
# gemma_quantize_and_chatbot.py

import os
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from auto_gptq import AutoGPTQForCausalLM, GPTQConfig
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import defaultdict
from typing import List
import uvicorn

# === [0] 경로 설정 ===
MODEL_ID = "google/gemma-3-12b-it"
SAVE_DIR = "./gemma-3-12b-it-GPTQ-4bit"

# === [1] HuggingFace 로그인 확인 ===
print("🔐 Hugging Face 인증이 필요합니다. 미리 `huggingface-cli login`을 해주세요.")

# === [2] 토크나이저 및 모델 CPU 로딩 ===
print("📦 모델 및 토크나이저 다운로드 중...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, use_fast=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    device_map={"": "cpu"},
    torch_dtype="auto",
    trust_remote_code=True
)

# === [3] 양자화 설정 ===
print("🔧 모델 양자화 시작...")
quantize_config = GPTQConfig(
    bits=4,
    group_size=128,
    desc_act=False,
    tokenizer=tokenizer
)
quantized_model = AutoGPTQForCausalLM.from_pretrained(
    MODEL_ID,
    quantize_config=quantize_config,
    device_map={"": "cpu"},
    trust_remote_code=True
)

# === [4] 저장 ===
print("💾 양자화된 모델 저장 중...")
quantized_model.save_pretrained(SAVE_DIR)
tokenizer.save_pretrained(SAVE_DIR)
print("✅ 저장 완료:", SAVE_DIR)

# === [5] FastAPI 앱 정의 ===
print("🚀 FastAPI 서버 준비 중...")
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

memory_store = defaultdict(list)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    thread_id: str = "default"

print("📥 모델 GPU 로딩 중...")
model = AutoGPTQForCausalLM.from_quantized(
    SAVE_DIR,
    device_map="auto",
    use_safetensors=True,
    trust_remote_code=True,
    inject_fused_attention=False
)
pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_new_tokens=1000,
    do_sample=True,
    temperature=0.7,
    top_p=0.9
)

@app.post("/chat")
async def chat_endpoint(request: Request):
    raw = await request.json()
    if "message" not in raw:
        return {"reply": "상담 내용을 입력해 주세요 🙏"}
    thread_id = raw.get("thread_id", "default")
    user_msg = ChatMessage(role="user", content=raw["message"])
    memory_store[thread_id].append(user_msg)
    history = memory_store[thread_id][:-1]
    question = memory_store[thread_id][-1].content.strip()
    history_text = "\n".join([f"{'상담자님' if m.role=='user' else 'AI'}: {m.content}" for m in history])
    prompt = f"""
너는 섬세하고 따뜻한 AI 심리상담사야.

[이전 대화]  
{history_text}

[상담자님의 현재 고민]  
{question}

[AI 상담사의 답변]
"""
    output = pipe(prompt)[0]["generated_text"]
    reply = output[len(prompt):].strip()
    memory_store[thread_id].append(ChatMessage(role="ai", content=reply))
    return {"reply": reply}

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    print("✅ 모든 준비 완료! http://0.0.0.0:8000 에서 서비스 시작합니다.")
    uvicorn.run(app, host="0.0.0.0", port=8000)
