import os
import json
import faiss
import torch
import numpy as np
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, GenerationConfig
from langchain.vectorstores.faiss import FAISS
from langchain.schema import Document
from langchain.docstore import InMemoryDocstore
from langchain.embeddings import HuggingFaceEmbeddings
import re
from collections import defaultdict
import traceback
import time

# === [0] 세션 기억 ===
memory_store = defaultdict(list)

# === [1] 환경 변수 및 모델 로딩 ===
load_dotenv()

gemma_model_name = "google/gemma-3-4b-it"
print("🔧 LLM 모델 로딩 시작")

# 글로벌 모델/토크나이저 변수
tokenizer = None
model = None

# 예외 처리 추가
try:
    tokenizer = AutoTokenizer.from_pretrained(gemma_model_name)
    
    # ⚠️ 중요: CUDA 컴퓨팅 능력 확인
    if torch.cuda.is_available():
        device_capability = torch.cuda.get_device_capability()
        print(f"CUDA 컴퓨팅 능력: {device_capability}")
        
        # 텐서코어(Tensor Cores) 사용 가능한지 확인 (Ampere 아키텍처 이상)
        has_tensor_cores = device_capability[0] >= 8
        
        # 최소한의 안전한 dtype 선택
        if has_tensor_cores:
            print("✅ 텐서코어 지원 GPU - torch.bfloat16 사용")
            dtype = torch.bfloat16
        else:
            print("⚠️ 텐서코어 미지원 GPU - torch.float16 사용")
            dtype = torch.float16
    else:
        print("⚠️ CUDA 사용 불가 - CPU 모드로 실행")
        dtype = torch.float32
    
    model = AutoModelForCausalLM.from_pretrained(
        gemma_model_name,
        device_map="auto",
        torch_dtype=dtype
    )
    
    # ===== 핵심 수정 부분: 더 견고한 텍스트 생성 함수 =====
    def text_generate(prompt, max_new_tokens=1000, use_fallbacks=True):
        # 입력값 유효성 검사
        if not prompt or not isinstance(prompt, str):
            return "입력 프롬프트가 유효하지 않습니다."
            
        # 최대 토큰 수 조정 (너무 크면 CUDA OOM 발생 가능)
        max_new_tokens = min(max_new_tokens, 1500)
        
        # 프롬프트 토큰화 및 디바이스 이동
        try:
            inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        except Exception as e:
            print(f"토큰화 오류: {e}")
            return "텍스트 처리 중 오류가 발생했습니다."
        
        # 명시적 생성 설정 - multinomial 샘플링 오류 해결
        generation_config = GenerationConfig(
            max_new_tokens=max_new_tokens,
            do_sample=False,  # greedy decoding 사용
            temperature=1.0,  # 명시적으로 값을 설정 
            num_beams=1,      # beam search 비활성화
            top_p=1.0,        # 명시적 설정
            top_k=50,         # 명시적 설정
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id
        )
        
        # CUDA_LAUNCH_BLOCKING=1 효과를 내기 위한 동기화
        if torch.cuda.is_available():
            torch.cuda.synchronize()
        
        # 방법 1: 직접 생성 (기본 방법)
        with torch.no_grad():
            try:
                # 세팅 백업 및 명시적 설정 적용
                old_defaults = {}
                for key, value in generation_config.__dict__.items():
                    if hasattr(model.generation_config, key):
                        old_defaults[key] = getattr(model.generation_config, key)
                        setattr(model.generation_config, key, value)
                
                # 시간 제한으로 생성 과정 모니터링
                start_time = time.time()
                outputs = model.generate(
                    **inputs,
                    generation_config=generation_config
                )
                generation_time = time.time() - start_time
                print(f"생성 시간: {generation_time:.2f}초")
                
                # 입력 토큰 수를 제외하고 생성된 텍스트만 반환
                result = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
                
                # 결과 검증
                if not result or result.isspace():
                    raise ValueError("빈 결과가 생성되었습니다.")
                
                # 원래 생성 구성 복원
                for key, value in old_defaults.items():
                    setattr(model.generation_config, key, value)
                
                print("✅ 기본 생성 방식 성공")
                return result
                
            except Exception as e:
                print(f"기본 생성 중 오류 발생: {e}")
                traceback.print_exc()
                
                # 폴백 옵션이 꺼져 있으면 여기서 예외 발생
                if not use_fallbacks:
                    raise e
                
                # 방법 2: 파이프라인 시도
                try:
                    print("대체 방법으로 파이프라인 시도...")
                    pipe = pipeline(
                        "text-generation",
                        model=model,
                        tokenizer=tokenizer,
                        max_new_tokens=max_new_tokens,
                        do_sample=False,
                        temperature=None
                    )
                    result = pipe(prompt)[0]['generated_text']
                    # 입력 프롬프트 제거
                    if result.startswith(prompt):
                        result = result[len(prompt):]
                    
                    # 결과 검증
                    if not result or result.isspace():
                        raise ValueError("파이프라인 생성 결과가 비어 있습니다.")
                        
                    print("✅ 파이프라인 방식 성공")
                    return result
                    
                except Exception as e2:
                    print(f"파이프라인 방법도 실패: {e2}")
                    traceback.print_exc()
                    
                    # 방법 3: CPU로 fallback
                    try:
                        print("CPU로 fallback...")
                        # 일시적으로 CPU로 모델 이동
                        current_device = next(model.parameters()).device
                        model_cpu = model.to("cpu")
                        inputs_cpu = {k: v.to("cpu") for k, v in inputs.items()}
                        
                        with torch.no_grad():
                            outputs = model_cpu.generate(
                                **inputs_cpu,
                                max_new_tokens=max_new_tokens,
                                do_sample=False,
                                temperature=None
                            )
                        
                        # 다시 원래 장치로 복원
                        model.to(current_device)
                        
                        result = tokenizer.decode(outputs[0][inputs_cpu['input_ids'].shape[1]:], skip_special_tokens=True)
                        
                        # 결과 검증
                        if not result or result.isspace():
                            raise ValueError("CPU 생성 결과가 비어 있습니다.")
                            
                        print("✅ CPU fallback 방식 성공")
                        return result
                        
                    except Exception as e3:
                        print(f"CPU fallback도 실패: {e3}")
                        traceback.print_exc()
                        # 모든 방법 실패
                        return "죄송합니다, 응답 생성 중 기술적 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
        
    print("✅ LLM 모델 로딩 완료 (매우 견고한 생성 함수 사용)")
except Exception as e:
    print(f"⚠️ 모델 로딩 중 오류: {e}")
    traceback.print_exc()
    tokenizer = None  # 오류 발생 시 변수 초기화
    model = None

# === [2] FAISS 인덱스 및 문서 로딩 ===
print("🔧 FAISS 인덱스 로딩 시작")
retriever = None
try:
    embedding_model = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")
    index = faiss.read_index("qa_index_bge_m3.faiss")
    with open("qa_chunks.json", "r", encoding="utf-8") as f:
        chunks = json.load(f)
    docs = [Document(page_content=chunk, metadata={}) for chunk in chunks]
    index_to_docstore_id = {i: str(i) for i in range(len(docs))}
    docstore = InMemoryDocstore({str(i): doc for i, doc in enumerate(docs)})
    vectorstore = FAISS(
        embedding_model.embed_query,
        index,
        docstore,
        index_to_docstore_id
    )
    # LangChain deprecation 경고 수정
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    print("✅ FAISS 인덱스 로딩 완료")
except Exception as e:
    print(f"⚠️ FAISS 인덱스 로딩 중 오류: {e}")
    traceback.print_exc()
    retriever = None

# === [3] FastAPI 앱 정의 ===
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === [4] 요청 바디 정의 ===
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = []
    thread_id: str = "default"

# === [5] 상담 응답 API ===
@app.post("/chat")
async def chat_endpoint(request: Request):
    # 1. 모델 상태 확인
    if model is None or tokenizer is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"reply": "AI 모델이 현재 사용 불가능합니다. 서버 관리자에게 문의하세요.", "sources": []}
        )
    
    # 2. 요청 처리
    try:
        raw = await request.json()
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"reply": "잘못된 요청 형식입니다.", "sources": []}
        )

    # 3. 메시지 처리
    try:
        if "message" in raw:
            thread_id = raw.get("thread_id", "default")
            new_message = ChatMessage(role="user", content=raw["message"])
            memory_store[thread_id].append(new_message)
            messages = memory_store[thread_id]
        elif "messages" in raw:
            chat_req = ChatRequest(**raw)
            thread_id = chat_req.thread_id
            memory_store[thread_id].extend(chat_req.messages)
            messages = memory_store[thread_id]
        else:
            return JSONResponse(
                content={"reply": "상담 내용을 입력해 주세요 🙏", "sources": []}
            )

        current_question = messages[-1].content.strip()
        history = messages[:-1]

        # 4. RAG 검색
        docs = []
        context = ""
        
        if retriever is not None:
            try:
                # 새로운 invoke 메서드 사용 (LangChain 업데이트 반영)
                if hasattr(retriever, "invoke"):
                    docs = retriever.invoke(current_question)
                else:
                    # 이전 메서드는 경고와 함께 계속 작동
                    docs = retriever.get_relevant_documents(current_question)
                    
                # 검색 결과가 너무 많은 경우 제한
                if len(docs) > 3:
                    docs = docs[:3]
                context = "\n\n".join([doc.page_content.replace("사우님", "상담자님") for doc in docs])
            except Exception as e:
                print(f"RAG 검색 중 오류 발생: {e}")
                traceback.print_exc()
                docs = []
                # RAG 검색 실패해도 계속 진행

        # 5. 대화 히스토리 구성
        history_text = ""
        # 최근 대화 기록만 유지 (예: 최근 3개)
        recent_history = history[-3:] if len(history) > 3 else history
        for msg in recent_history:
            role = "상담자님" if msg.role == "user" else "AI"
            history_text += f"{role}: {msg.content}\n"

        # 6. 프롬프트 구성
        prompt = f"""
너는 공감 능력이 뛰어나고, 실제 심리상담사처럼 섬세하고 전문적으로 상담을 진행하는 AI야.

상담할 때는 다음 원칙을 반드시 지켜:
1. 상담자님의 감정을 진심으로 공감하고 위로하기
2. 따뜻하고 배려 깊은 말투 사용하기
3. '사우님'이라는 표현은 쓰지 말고 '상담자님'으로 바꿔서 사용하기
4. 답변은 명확하고 간결하게 제공하기

[이전 대화]  
{history_text}

[상담 참고 자료]  
{context}

[상담자님의 현재 고민]  
{current_question}

[AI 상담사의 답변]
"""

        # 7. 응답 생성
        start_time = time.time()
        try:
            answer = text_generate(prompt)
            generation_time = time.time() - start_time
            print(f"총 생성 시간: {generation_time:.2f}초")
            
            # 응답 검증
            if not answer or answer.isspace() or "죄송합니다" in answer and "기술적 문제" in answer:
                raise ValueError("유효한 응답이 생성되지 않았습니다.")
                
        except Exception as e:
            print(f"⚠️ 모델 추론 중 오류 발생: {e}")
            traceback.print_exc()
            
            # 기본 응답 제공 (서버 오류가 아닌 일반 응답으로)
            answer = "안녕하세요, 상담자님. 현재 AI 시스템이 과부하 상태입니다. 잠시 후 다시 시도해 주시면 더 나은 답변을 드릴 수 있을 것 같습니다. 불편을 드려 죄송합니다."

        # 8. 자살 관련 키워드 감지 및 위기 대응
        crisis_keywords = ["자살", "죽고", "죽을", "목숨", "목매", "뛰어내", "날 죽이", "내 목숨"]
        if any(keyword in current_question.lower() for keyword in crisis_keywords):
            crisis_message = "\n\n위기 상황에서는 전문가의 도움이 필요합니다. 다음 자살예방 핫라인으로 연락해주세요: 1393 (24시간 위기상담전화)"
            answer += crisis_message

        # 9. 메모리에 응답 저장
        memory_store[thread_id].append(ChatMessage(role="ai", content=answer))

        # 10. 성공 응답 반환
        return JSONResponse(
            content={
                "reply": answer,
                "sources": [{"content": doc.page_content, "metadata": doc.metadata} for doc in docs]
            }
        )
            
    except Exception as e:
        print(f"⚠️ 요청 처리 중 치명적 오류: {e}")
        traceback.print_exc()
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"reply": "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.", "sources": []}
        )

# === [6] 헬스 체크 ===
@app.get("/health")
@app.get("/")
async def health_check():
    model_status = "loaded" if model is not None else "not_loaded"
    retriever_status = "loaded" if retriever is not None else "not_loaded"
    
    return {
        "status": "ok", 
        "model": gemma_model_name,
        "model_status": model_status,
        "retriever_status": retriever_status,
        "cuda_available": torch.cuda.is_available()
    }

# === [7] 메모리 관리 ===
@app.delete("/memory/{thread_id}")
async def clear_memory(thread_id: str):
    if thread_id in memory_store:
        del memory_store[thread_id]
        return {"status": "ok", "message": f"Thread {thread_id} cleared"}
    return {"status": "not_found", "message": f"Thread {thread_id} not found"}

# === [8] 실행 ===
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)