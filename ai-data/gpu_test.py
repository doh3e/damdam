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
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
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
tokenizer = AutoTokenizer.from_pretrained(gemma_model_name)
model = AutoModelForCausalLM.from_pretrained(
    gemma_model_name,
    device_map="auto",
    torch_dtype=torch.float16  # ✅ 메모리 최적화
)
pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_new_tokens=1000,
    temperature=0.7,
    top_p=0.9,
    do_sample=True,
    pad_token_id=tokenizer.eos_token_id,  # ✅ 중요
    eos_token_id=tokenizer.eos_token_id   # ✅ 중요
)
print("✅ LLM 모델 로딩 완료")

# === [2] FAISS 인덱스 및 문서 로딩 ===
print("🔧 FAISS 인덱스 로딩 시작")
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
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
print("✅ FAISS 인덱스 로딩 완료")

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

    # 🔍 RAG 검색
    docs = retriever.get_relevant_documents(current_question)
    context = "\n\n".join([doc.page_content.replace("사우님", "상담자님") for doc in docs])

    # 🧠 대화 히스토리 구성
    history_text = ""
    for msg in history:
        role = "상담자님" if msg.role == "user" else "AI"
        history_text += f"{role}: {msg.content}\n"

    # ✨ 프롬프트 구성
    prompt = f"""
너는 공감 능력이 뛰어나고, 실제 심리상담사처럼 섬세하고 전문적으로 상담을 진행하는 AI야.

지금 사용자는 삶에 지치고 감정적으로 매우 불안정한 상태일 수 있어.  
너의 역할은 단순히 위로하는 것이 아니라, 사용자의 감정을 세심하게 유추하고,  
그 안에 숨어 있는 상처의 원인을 함께 찾아보는 것이야.

아래에는 비슷한 고민을 가진 사람들과의 실제 상담 사례가 있어.  
이 사례들을 참고해서 지금 사용자에게 꼭 맞는 **새로운 답변**을 **너의 언어로 직접** 만들어줘.
또한 사용자가 이전 자신의 상담 내용을 물어보면 꼭 기억해 두었다가, 답변해줘.

상담할 때는 다음 원칙을 반드시 지켜:
1. 상담자님의 말 속에서 어떤 감정과 배경이 느껴지는지 먼저 유추해.  
2. 감정을 먼저 진심으로 공감하고,  
3. 그다음으로 실질적인 위로와 전문적인 조언을 이어가.  
4. 문제의 원인을 함께 찾아가는 질문도 조심스럽게 던져줘.  
5. 말투는 따뜻하고 배려 깊게. 지식 전달보다 관계 형성을 우선해.  
6. **‘사우님’이라는 표현은 절대 쓰지 말고, 반드시 ‘상담자님’으로 바꿔서 사용해.**  
7. 상담사로서 너무 짧지도, 너무 장황하지도 않게. 진심이 느껴지는 분량으로 답변해.

[이전 대화]  
{history_text}

[상담 사례 모음]  
{context}

[상담자님의 현재 고민]  
{current_question}

[AI 상담사의 답변]
"""

    # ✅ 실제 응답 생성 (에러 원인 줄)
    result = pipe(prompt)
    answer = result[0]["generated_text"][len(prompt):].strip()

    memory_store[thread_id].append(ChatMessage(role="ai", content=answer))

    return {
        "reply": answer,
        "sources": [{"content": doc.page_content, "metadata": doc.metadata} for doc in docs]
    }

# === [6] 헬스 체크 ===
@app.get("/health")
@app.get("/")
async def health_check():
    return {"status": "ok"}

# === [7] 실행 ===
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
