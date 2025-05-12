# from fastapi import FastAPI
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel, root_validator
# from typing import Optional
# from transformers import (
#     AutoTokenizer,
#     AutoModelForCausalLM,
#     BitsAndBytesConfig
# )
# import torch

# # ----------------------------
# # 1) 요청 스키마 정의
# # ----------------------------
# class GenerateRequest(BaseModel):
#     prompt: Optional[str] = None
#     message: Optional[str] = None

#     max_new_tokens: int = 128
#     do_sample: bool = True
#     top_p: float = 0.9
#     temperature: float = 0.8
#     thread_id: Optional[str] = None

#     @root_validator(pre=True)
#     def ensure_text(cls, values):
#         if not values.get("prompt") and not values.get("message"):
#             raise ValueError("`prompt` 또는 `message` 중 하나는 필요합니다.")
#         return values

# # ----------------------------
# # 2) 모델 & 토크나이저 초기화 (GPU 고정 배치)
# # ----------------------------
# print("Loading tokenizer and model...")
# tokenizer = AutoTokenizer.from_pretrained("google/gemma-3-12b-it")

# model = AutoModelForCausalLM.from_pretrained(
#     "google/gemma-3-12b-it",
#     quantization_config=BitsAndBytesConfig(
#         load_in_4bit=True,
#         bnb_4bit_quant_type="nf4",
#         bnb_4bit_compute_dtype=torch.float16,
#         bnb_4bit_use_double_quant=False
#     ),
#     # 모든 레이어를 CUDA GPU 0번에 올리도록 고정
#     device_map={"": "cuda:0"},
#     torch_dtype=torch.float16
# )

# # pad_token_id 설정
# model.config.pad_token_id = model.config.eos_token_id
# model.eval()

# # 디바이스 확인 로그
# print("First parameter on:", next(model.parameters()).device)

# # ----------------------------
# # 3) FastAPI 앱 설정
# # ----------------------------
# app = FastAPI(title="Gemma3 4bit Counseling API")

# @app.post("/generate")
# async def generate(req: GenerateRequest):
#     user_text = req.prompt or req.message

#     # 시스템 지시 + 컨트롤 토큰 포맷
#     system_prompt = (
#         "당신은 친절한 상담사입니다. "
#         "사용자의 고민을 공감하고, 대화에 알맞은 답변을 "
#         "친절하고 따뜻한 어조로 해주세요."
#     )
#     prompt = (
#         f"<start_of_turn>user\n"
#         f"{system_prompt}\n\n"
#         f"{user_text}<end_of_turn>\n"
#         f"<start_of_turn>model"
#     )

#     inputs = tokenizer(prompt, add_special_tokens=False, return_tensors="pt")
#     inputs = {k: v.to("cuda:0") for k, v in inputs.items()}
#     input_ids = inputs["input_ids"]

#     try:
#         outputs = model.generate(
#             input_ids=input_ids,
#             max_new_tokens=req.max_new_tokens,
#             do_sample=req.do_sample,
#             top_p=req.top_p,
#             temperature=req.temperature,
#             repetition_penalty=1.2,
#             no_repeat_ngram_size=2,
#             early_stopping=True
#         )
#     except RuntimeError as e:
#         print("Sampling error, fallback to greedy:", e)
#         outputs = model.generate(
#             input_ids=input_ids,
#             max_new_tokens=req.max_new_tokens,
#             do_sample=False
#         )

#     gen_tokens = outputs[0][ input_ids.shape[1] : ]
#     result = tokenizer.decode(gen_tokens, skip_special_tokens=True).strip()

#     return {"response": result, "thread_id": req.thread_id}

# @app.exception_handler(ValueError)
# async def validation_exception_handler(request, exc: ValueError):
#     return JSONResponse(
#         status_code=400,
#         content={"detail": str(exc)}
#     )

# # ----------------------------
# # 4) 실행 커맨드
# # ----------------------------
# # uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# import os
# import json
# import faiss
# import torch
# from typing import Optional
# from dotenv import load_dotenv
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel
# from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, BitsAndBytesConfig
# from sentence_transformers import SentenceTransformer
# from langchain.vectorstores.faiss import FAISS
# from langchain.schema import Document
# from langchain.docstore import InMemoryDocstore
# from langchain.embeddings import HuggingFaceEmbeddings
# import re

# # === [1] 환경 변수 및 모델 로딩 ===
# load_dotenv()

# gemma_model_name = "google/gemma-3-12b-it"
# print("🔧 Gemma-3 12B 모델 로딩 시작 (4bit 양자화 적용)")

# # 토크나이저 로드
# tokenizer = AutoTokenizer.from_pretrained(gemma_model_name)

# # 4-bit 양자화 설정 및 GPU 고정 배치
# model = AutoModelForCausalLM.from_pretrained(
#     gemma_model_name,
#     quantization_config=BitsAndBytesConfig(
#         load_in_4bit=True,
#         bnb_4bit_quant_type="nf4",
#         bnb_4bit_compute_dtype=torch.float16,
#         bnb_4bit_use_double_quant=False
#     ),
#     device_map={"": "cuda:0"},
#     torch_dtype=torch.float16
# )
# # EOS 토큰을 패딩 토큰으로 설정
# model.config.pad_token_id = model.config.eos_token_id
# print("First parameter on:", next(model.parameters()).device)

# # 텍스트 생성 파이프라인 설정 (generator 사용)
# generator = pipeline(
#     "text-generation",
#     model=model,
#     tokenizer=tokenizer,
#     max_new_tokens=128,
#     temperature=0.8,
#     top_p=0.9,
#     do_sample=True
# )
# print("✅ 모델 로딩 및 양자화 완료")

# # === [2] FAISS 인덱스 및 문서 로딩 ===
# print("🔧 FAISS 인덱스 로딩 시작")
# embedding_model = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")
# index = faiss.read_index("qa_index_bge_m3.faiss")
# with open("qa_chunks.json", "r", encoding="utf-8") as f:
#     chunks = json.load(f)
# docs = [Document(page_content=chunk, metadata={}) for chunk in chunks]
# index_to_docstore_id = {i: str(i) for i in range(len(docs))}
# docstore = InMemoryDocstore({str(i): doc for i, doc in enumerate(docs)})
# vectorstore = FAISS(embedding_model.embed_query, index, docstore, index_to_docstore_id)
# retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
# print("✅ FAISS 인덱스 로딩 완료")

# # === [3] FastAPI 앱 정의 ===
# app = FastAPI()
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # 요청 바디 스키마
# class GenerateRequest(BaseModel):
#     message: str
#     thread_id: Optional[str] = None

# # 공통 응답 생성 함수
# def generate_response(user_text: str) -> str:
#     # 프롬프트 템플릿
#     prompt = f"""
# 너는 공감 능력이 뛰어난 AI 심리상담사야.
# 사용자의 감정을 세심히 추론하고, 대화에 알맞은 답변을 친절하고 따뜻한 어조로 제공해 줘.

# [상담사로서의 답변]
# {user_text}
# """
#     print("▶ Prompt:\n", prompt)

#     generated = generator(prompt)[0]["generated_text"]
#     print("▶ Raw output:\n", repr(generated))

#     # '[상담사로서의 답변]' 태그 뒤만 추출
#     match = re.search(r"\[상담사로서의 답변\]([\s\S]*)", generated)
#     if match:
#         answer = match.group(1).strip()
#     else:
#         answer = generated.replace(prompt, "").strip()
#     print("✔ Final reply:\n", answer)
#     return answer

# # === [4] '/generate' 엔드포인트 ===
# @app.post("/generate")
# async def generate_endpoint(req: GenerateRequest):
#     if not req.message.strip():
#         return JSONResponse(status_code=400, content={"detail": "메시지를 입력하세요."})
#     reply = generate_response(req.message)
#     return {"response": reply, "thread_id": req.thread_id}

# # === [5] '/chat' 엔드포인트 (RAG) ===
# @app.post("/chat")
# async def chat_endpoint(req: GenerateRequest):
#     query = req.message.strip()
#     if not query:
#         return JSONResponse(content={"reply":"상담 내용을 입력해 주세요 🙏","sources":[]})
#     # RAG 검색
#     docs = retriever.get_relevant_documents(query)
#     context = "\n\n".join(doc.page_content for doc in docs)
#     # 프롬프트 생성
#     prompt = f"""
# 너는 공감 능력이 뛰어난 AI 심리상담사야.
# 사용자의 감정을 세심히 추론하고, 대화에 알맞은 답변을 친절하고 따뜻한 어조로 제공해 줘.

# [참고자료]
# {context}

# [상담사로서의 답변]
# {query}
# """
#     print("▶ RAG Prompt:\n", prompt)
#     generated = generator(prompt)[0]["generated_text"]
#     print("▶ RAG Raw output:\n", repr(generated))
#     match = re.search(r"\[상담사로서의 답변\]([\s\S]*)", generated)
#     if match:
#         answer = match.group(1).strip()
#     else:
#         answer = generated.replace(prompt, "").strip()
#     sources = [{"content":doc.page_content,"metadata":doc.metadata} for doc in docs]
#     return {"reply":answer, "sources":sources}

# # === [6] 헬스 체크 ===
# @app.get("/health")
# @app.get("/")
# async def health_check():
#     return {"status":"ok"}

# # === [7] 실행 ===
# # uvicorn app:app --host 0.0.0.0 --port 8000 --reload

import os
import torch
import logging
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import re
import traceback

# === [0] 로깅 설정 ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(), logging.FileHandler("gemma_api.log")]
)
logger = logging.getLogger("gemma-api")

# === [1] 환경 변수 및 모델 로딩 ===
load_dotenv()

gemma_model_name = "google/gemma-3-12b-it"
logger.info("🔧 Gemma-3 12B 모델 로딩 시작 (4bit 이중 양자화)")

try:
    # 토크나이저 로드 - 한글 지원
    tokenizer = AutoTokenizer.from_pretrained(
        gemma_model_name,
        trust_remote_code=True,
        use_fast=True
    )

    # 4-bit 이중 양자화 설정
    quant_cfg = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True
    )
    # 모델 로드 (from_pretrained)
    model = AutoModelForCausalLM.from_pretrained(
        gemma_model_name,
        quantization_config=quant_cfg,
        device_map="auto",            # GPU에 분산 로드
        offload_folder="./offload",     # 필요 시 CPU 오프로딩
        torch_dtype=torch.float16,
        low_cpu_mem_usage=True
    )

    # 패딩 토큰 설정
    model.config.pad_token_id = model.config.eos_token_id
    logger.info(f"Model loaded on devices: {model.device_map if hasattr(model, 'device_map') else 'cuda:0'}")

    # GPU 메모리 확인
    if torch.cuda.is_available():
        gm = torch.cuda.get_device_properties(0).total_memory / 1e9
        am = torch.cuda.memory_allocated(0) / 1e9
        logger.info(f"GPU memory: {gm:.2f} GB, allocated: {am:.2f} GB")

    logger.info("✅ 모델 로딩 및 양자화 완료")
except Exception as e:
    logger.error(f"모델 로딩 실패: {e}")
    logger.error(traceback.format_exc())
    raise

# === [2] FastAPI 앱 정의 ===
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# === [3] 요청 바디 스키마 ===
class GenerateRequest(BaseModel):
    message: str
    thread_id: Optional[str] = None

# === [4] 직접 생성 함수 ===
def generate_direct(user_text: str, max_new_tokens: int = 256) -> str:
    safe_text = user_text.strip()
    prompt_text = (
        "너는 친절한 AI 챗봇이야. 사용자의 말을 공감하고 자연스럽게 대화해줘.\n\n"
        f"사용자: {safe_text}\n"
        "챗봇: "
    )
    logger.info(f"▶ Prompt: {prompt_text[:60]}...")

    inputs = tokenizer(prompt_text, return_tensors="pt").to(model.device)

    # 1) 샘플링 생성
    try:
        logger.info("샘플링 시도")
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                top_k=50,
                repetition_penalty=1.1,
                pad_token_id=tokenizer.eos_token_id,
                eos_token_id=tokenizer.eos_token_id
            )
    except RuntimeError as e:
        logger.warning(f"샘플링 실패({e}), 빔 서치로 폴백")
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=False,
                num_beams=4,
                early_stopping=True,
                pad_token_id=tokenizer.eos_token_id,
                eos_token_id=tokenizer.eos_token_id
            )
    
    full_output = tokenizer.decode(outputs[0], skip_special_tokens=True)
    logger.info(f"▶ Full output: {full_output[:80]}...")
    print(full_output)
    # 응답 추출 및 정제
    if "챗봇:" in full_output:
        response = full_output.split("챗봇:", 1)[1].strip()
    else:
        response = full_output[len(prompt_text):].strip()

    # 특수 토큰 제거
    response = re.sub(r"<unused\d+>", "", response).strip()

    if not response:
        logger.warning("빈 응답, 기본 메시지 사용")
        response = "죄송합니다. 메시지를 생성할 수 없습니다."

    logger.info(f"✔ Reply: {response[:60]}...")
    return response

# === [5] '/generate' 엔드포인트 ===
@app.post("/generate")
async def generate_endpoint(request: Request):
    try:
        body = await request.json()
        msg = body.get("message", "").strip()
        tid = body.get("thread_id")
        if not msg:
            return JSONResponse(status_code=400, content={"detail": "메시지를 입력하세요."})
        logger.info(f"요청 메시지: {msg[:50]}...")
        reply = generate_direct(msg)
        return JSONResponse(content={"response": reply, "thread_id": tid})
    except Exception as e:
        logger.error(f"엔드포인트 오류: {e}")
        logger.error(traceback.format_exc())
        return JSONResponse(status_code=500, content={"detail": "서버 오류"})

# === [6] 헬스 체크 및 정보 ===
@app.get("/health")
async def health():
    return JSONResponse(content={"status": "ok", "model": gemma_model_name})

@app.get("/info")
async def info():
    data = {
        "model": gemma_model_name,
        "quantization": "4-bit double",
        "device_map": model.device_map if hasattr(model, 'device_map') else 'auto',
        "vocab_size": len(tokenizer)
    }
    return JSONResponse(content=data)

# === [7] 서버 실행 ===
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"서버 시작: 0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
