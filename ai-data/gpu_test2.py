import os
import json
import faiss
import torch
import numpy as np
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, GenerationConfig
from langchain.vectorstores.faiss import FAISS
from langchain.schema import Document
from langchain.docstore import InMemoryDocstore
from langchain.embeddings import HuggingFaceEmbeddings
import re
from collections import defaultdict

# === [0] 세션 기억 ===
memory_store = defaultdict(list)

# === [1] 환경 변수 및 모델 로딩 ===
load_dotenv()

gemma_model_name = "google/gemma-3-4b-it"
print("🔧 LLM 모델 로딩 시작")

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
    
    # ===== 핵심 수정 부분: CUDA 오류 수정을 위한 generate 함수 =====
    def text_generate(prompt, max_new_tokens=1000):
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        # 명시적 생성 설정 - multinomial 샘플링 오류 해결
        generation_config = GenerationConfig(
            max_new_tokens=max_new_tokens,
            do_sample=False,  # greedy decoding 사용
            temperature=1.0,  # 명시적으로 값을 설정해도 do_sample=False일 때는 사용 안 됨
            num_beams=1,      # beam search 비활성화
            top_p=1.0,        # 명시적 설정
            top_k=50,         # 명시적 설정
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id
        )
        
        # CUDA_LAUNCH_BLOCKING=1 효과를 내기 위한 동기화
        torch.cuda.synchronize()
        
        with torch.no_grad():
            try:
                # 모델의 기본 generation_config 값 명시적으로 재정의
                old_defaults = {}
                for key, value in generation_config.__dict__.items():
                    if hasattr(model.generation_config, key):
                        old_defaults[key] = getattr(model.generation_config, key)
                        setattr(model.generation_config, key, value)
                
                outputs = model.generate(
                    **inputs,
                    generation_config=generation_config
                )
                
                # 입력 토큰 수를 제외하고 생성된 텍스트만 반환
                result = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
                
                # 원래 생성 구성 복원
                for key, value in old_defaults.items():
                    setattr(model.generation_config, key, value)
                
                return result
            except Exception as e:
                print(f"생성 중 오류 발생: {e}")
                
                # 오류 발생 시 대체 전략: 파이프라인으로 시도
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
                    return result
                except Exception as e2:
                    print(f"파이프라인 방법도 실패: {e2}")
                    # 최후의 수단: CPU로 떨어뜨려서 실행
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
                        return result
                    except Exception as e3:
                        print(f"CPU fallback도 실패: {e3}")
                        return "죄송합니다, 응답 생성 중 기술적 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
        
    print("✅ LLM 모델 로딩 완료 (견고한 생성 함수 사용)")
except Exception as e:
    print(f"⚠️ 모델 로딩 중 오류: {e}")
    raise

# === [2] FAISS 인덱스 및 문서 로딩 ===
print("🔧 FAISS 인덱스 로딩 시작")
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
    raw = await request.json()

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
        return {"reply": "상담 내용을 입력해 주세요 🙏", "sources": []}

    current_question = messages[-1].content.strip()
    history = messages[:-1]

    # "자살" 키워드 감지 및 특별 처리
    docs = []
    context = ""
    
    # 🔍 RAG 검색 - 안전하게 처리 및 deprecation 경고 수정
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
            docs = []

    # 🧠 대화 히스토리 구성 - 최근 기록만 유지
    history_text = ""
    # 최근 대화 기록만 유지 (예: 최근 3개)
    recent_history = history[-3:] if len(history) > 3 else history
    for msg in recent_history:
        role = "상담자님" if msg.role == "user" else "AI"
        history_text += f"{role}: {msg.content}\n"

    # ✨ 프롬프트 구성
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

    # ✅ 응답 생성 (강화된 오류 처리 함수 사용)
    try:
        answer = text_generate(prompt)
    except Exception as e:
        print(f"⚠️ 모델 추론 중 오류 발생: {e}")
        answer = "죄송합니다, 상담 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."

    # 자살 언급이 있을 경우 위기 대응 메시지 추가
    crisis_keywords = ["자살", "죽고", "죽을", "목숨", "목매", "뛰어내", "날 죽이", "내 목숨"]
    if any(keyword in current_question.lower() for keyword in crisis_keywords):
        crisis_message = "\n\n위기 상황에서는 전문가의 도움이 필요합니다. 다음 자살예방 핫라인으로 연락해주세요: 1393 (24시간 위기상담전화)"
        answer += crisis_message

    memory_store[thread_id].append(ChatMessage(role="ai", content=answer))

    return {
        "reply": answer,
        "sources": [{"content": doc.page_content, "metadata": doc.metadata} for doc in docs]
    }

# === [6] 헬스 체크 ===
@app.get("/health")
@app.get("/")
async def health_check():
    return {"status": "ok", "model": gemma_model_name}

# === [7] 실행 ===
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)