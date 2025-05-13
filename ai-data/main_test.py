
######## 가장 기본 : 채팅만 가능능
# from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware
# import httpx

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # 배포 시 도메인 제한 필요
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# OLLAMA_URL = "http://localhost:11434/api/generate"
# MODEL_NAME = "gemma3:12b-it-qat"

# @app.post("/chat")
# async def chat(request: Request):
#     body = await request.json()
#     user_input = body.get("message", "")

#     payload = {
#         "model": MODEL_NAME,
#         "prompt": f"{user_input}\n\n➡️ 핵심만 간단하게 3~4문장으로 심리상담 답변해줘.",
#         "stream": False,
#         "num_predict": 200,  # 🔧 최대 생성 토큰 수 제한
#         "top_k": 40,
#         "top_p": 0.9
#     }

#     async with httpx.AsyncClient(timeout=60.0) as client:
#         response = await client.post(OLLAMA_URL, json=payload)
#         result = response.json()

#     return {"response": result.get("response")}

# main.py
######### rag 검색 기능 추가가
# from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware
# import httpx
# import json
# import faiss
# import numpy as np
# from sentence_transformers import SentenceTransformer

# # === 설정 ===
# app = FastAPI()
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"], allow_credentials=True,
#     allow_methods=["*"], allow_headers=["*"]
# )

# OLLAMA_URL = "http://localhost:11434/api/generate"
# MODEL_NAME = "gemma3:12b-it-qat"

# retriever_model = SentenceTransformer("BAAI/bge-m3")
# index = faiss.read_index("qa_index_bge_m3.faiss")
# with open("qa_chunks.json", "r", encoding="utf-8") as f:
#     chunks = json.load(f)

# # === [1] FAISS 검색 함수 ===
# def retrieve_relevant_chunks(query: str, top_k: int = 3) -> list[str]:
#     query_text = f"질문: {query}"
#     query_vec = retriever_model.encode([query_text], convert_to_numpy=True)
#     faiss.normalize_L2(query_vec)
#     _, I = index.search(query_vec, top_k)
#     return [chunks[i] for i in I[0]]

# # === [2] 프롬프트 생성 ===
# def build_rag_prompt(query: str, retrieved_docs: list[str]) -> str:
#     context = "\n\n".join(retrieved_docs)
#     return f"""
# 너는 공감 능력이 뛰어난 AI 심리상담사야. 감정을 유추하고 조언을 제공하는 역할을 해.
# 다음은 유사한 고민 사례야. 이를 참고해서 사용자 질문에 따뜻하고 전문적으로 응답해줘.

# [참고자료]
# {context}

# [사용자 질문]
# {query}

# [AI 상담사의 답변]
# """

# # === [3] FastAPI 엔드포인트 ===
# @app.post("/chat")
# async def chat(request: Request):
#     body = await request.json()
#     user_input = body.get("message", "")

#     # [1] RAG 검색
#     retrieved_docs = retrieve_relevant_chunks(user_input)
#     prompt = build_rag_prompt(user_input, retrieved_docs)

#     # [2] Ollama 요청
#     payload = {
#         "model": MODEL_NAME,
#         "prompt": prompt,
#         "stream": False,
#         "num_predict": 300,
#         "top_k": 40,
#         "top_p": 0.9
#     }

#     async with httpx.AsyncClient(timeout=60.0) as client:
#         res = await client.post(OLLAMA_URL, json=payload)
#         result = res.json()

#     # [3] 명확하게 구분해서 응답
#     return {
#         "ai_response": result.get("response", "").strip(),
#         "retrieved_chunks": retrieved_docs
#     }

############## 프롬프트 고도화
# main.py
# from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware
# import httpx
# import json
# import faiss
# import numpy as np
# from sentence_transformers import SentenceTransformer

# # === FastAPI 세팅 ===
# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # 프론트에서 접근 가능하게 허용
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # === Ollama 세팅 ===
# OLLAMA_URL = "http://localhost:11434/api/generate"
# MODEL_NAME = "gemma3:12b-it-qat"

# # === 벡터 검색기 로딩 ===
# retriever_model = SentenceTransformer("BAAI/bge-m3")
# index = faiss.read_index("qa_index_bge_m3.faiss")
# with open("qa_chunks.json", "r", encoding="utf-8") as f:
#     chunks = json.load(f)

# # === [1] FAISS 검색 함수 ===
# def retrieve_relevant_chunks(query: str, top_k: int = 3) -> list[str]:
#     query_text = f"질문: {query}"
#     query_vec = retriever_model.encode([query_text], convert_to_numpy=True)
#     faiss.normalize_L2(query_vec)
#     _, I = index.search(query_vec, top_k)
#     return [chunks[i] for i in I[0]]

# # === [2] 프롬프트 생성 (고도화) ===
# def build_rag_prompt(query: str, retrieved_docs: list[str]) -> str:
#     context = "\n\n".join(retrieved_docs)

#     return f"""
# 너는 따뜻하고 신뢰감 있는 AI 심리상담사야.
# 임상심리학과 정신건강 상담학을 전공한 전문가로서, 감정에 깊이 공감하면서도 문제의 본질을 함께 찾아주는 역할을 해.

# 이번 상담자는 자존감, 불안, 우울 같은 문제로 힘들어하고 있어.
# 상담자의 말에서 느껴지는 **감정의 종류와 강도**를 먼저 파악하고, 그 감정에 맞는 말투와 조언 방식을 택해줘.

# 답변 구성은 아래 순서대로 해:
# 1. 상담자의 감정을 조심스럽게 추측해줘.
# 2. 그 감정에 진심으로 공감해줘.
# 3. 감정이 생긴 배경/원인을 유추해줘.
# 4. 실질적이고 구체적인 조언을 2~3가지 제시해줘.
# 5. 상담자 스스로 변화할 수 있다는 희망적인 메시지로 마무리해줘.

# 말투는 상담자와의 신뢰 형성을 최우선으로 하고,
# 지식 전달보다 감정 공감과 질문자 중심의 상담에 집중해줘.

# 반드시 "사우님"이 아니라 "상담자님"이라고 부르고,
# 답변은 길지 않게 3~5 문장으로 답변해줘.

# [참고자료]
# {context}

# [상담자 질문]
# {query}

# [AI 상담사의 답변]
# """

# # === [3] FastAPI 엔드포인트 ===
# @app.post("/chat")
# async def chat(request: Request):
#     body = await request.json()
#     user_input = body.get("message", "")

#     retrieved_docs = retrieve_relevant_chunks(user_input)
#     prompt = build_rag_prompt(user_input, retrieved_docs)

#     payload = {
#         "model": MODEL_NAME,
#         "prompt": prompt,
#         "stream": False,
#         "num_predict": 300,
#         "top_k": 40,
#         "top_p": 0.9,
#         "temperature": 0.7
#     }

#     async with httpx.AsyncClient(timeout=60.0) as client:
#         res = await client.post(OLLAMA_URL, json=payload)
#         result = res.json()

#     return {
#         "ai_response": result.get("response", "").strip()
#     }

######### 단기 기억 기능 추가
# from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware
# import httpx
# import json
# import faiss
# import numpy as np
# from sentence_transformers import SentenceTransformer

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# OLLAMA_URL = "http://localhost:11434/api/generate"
# MODEL_NAME = "gemma3:12b-it-qat"

# retriever_model = SentenceTransformer("BAAI/bge-m3")
# index = faiss.read_index("qa_index_bge_m3.faiss")
# with open("qa_chunks.json", "r", encoding="utf-8") as f:
#     chunks = json.load(f)

# chat_memory: dict[str, list[str]] = {}

# def retrieve_relevant_chunks(query: str, top_k: int = 3) -> list[str]:
#     query_text = f"질문: {query}"
#     query_vec = retriever_model.encode([query_text], convert_to_numpy=True)
#     faiss.normalize_L2(query_vec)
#     _, I = index.search(query_vec, top_k)
#     return [chunks[i] for i in I[0]]

# def build_rag_prompt(query: str, retrieved_docs: list[str], history_text: str) -> str:
#     context = "\n\n".join(retrieved_docs)

#     return f"""
# 너는 따뜻하고 신뢰감 있는 AI 심리상담사야.
# 임상심리학과 정신건강 상담학을 전공한 전문가로서, 감정에 깊이 공감하면서도 문제의 본질을 함께 찾아주는 역할을 해.

# 이번 상담자는 자존감, 불안, 우울 같은 문제로 힘들어하고 있어.
# 상담자의 말에서 느껴지는 **감정의 종류와 강도**를 먼저 파악하고, 그 감정에 맞는 말투와 조언 방식을 택해줘.

# 이전 대화 내용을 참고해서 이어지는 흐름으로 상담해줘:

# {history_text}

# 답변 구성은 아래 순서대로 해:
# 1. 상담자의 감정을 조심스럽게 추측해줘.
# 2. 그 감정에 진심으로 공감해줘.
# 3. 감정이 생긴 배경/원인을 유추해줘.
# 4. 실질적이고 구체적인 조언을 2~3가지 제시해줘.
# 5. 상담자 스스로 변화할 수 있다는 희망적인 메시지로 마무리해줘.

# 말투는 상담자와의 신뢰 형성을 최우선으로 하고,
# 지식 전달보다 감정 공감과 질문자 중심의 상담에 집중해줘.

# 반드시 \"사우님\"이 아니라 \"상담자님\"이라고 부르고,
# 답변은 길지 않게 3~5 문장으로 답변해줘.

# [참고자료]
# {context}

# [상담자 질문]
# {query}

# [AI 상담사의 답변]
# """

# @app.post("/chat")
# async def chat(request: Request):
#     body = await request.json()
#     user_input = body.get("message", "")
#     user_id = body.get("user_id", "default")

#     if user_id not in chat_memory:
#         chat_memory[user_id] = []
#     chat_memory[user_id].append(f"상담자님: {user_input}")
#     history_text = "\n".join(chat_memory[user_id][-5:])

#     retrieved_docs = retrieve_relevant_chunks(user_input)
#     prompt = build_rag_prompt(user_input, retrieved_docs, history_text)

#     payload = {
#         "model": MODEL_NAME,
#         "prompt": prompt,
#         "stream": False,
#         "num_predict": 150,
#         "top_k": 40,
#         "top_p": 0.9,
#         "temperature": 0.7
#         # "stop": ["\n\n상담자님", "그럼 좋은 하루 보내세요", "</s>"]
#     }

#     try:
#         async with httpx.AsyncClient(timeout=120.0) as client:
#             res = await client.post(OLLAMA_URL, json=payload)
#             result = res.json()
#     except Exception as e:
#         print("[❌ 예외 발생]", str(e))
#         return {"ai_response": "모델 응답 중 오류가 발생했습니다."}

#     ai_text = result.get("response")
#     if not ai_text:
#         ai_text = "상담 내용을 처리하는 중 오류가 발생했어요. 다시 시도해 주세요."

#     chat_memory[user_id].append(f"AI: {ai_text.strip()}")

#     return {
#         "ai_response": ai_text.strip()
#     }



######## 단기기억 2번째 버전(프롬프트 내에 기억 위치 변경)
# from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware
# import httpx
# import json
# import faiss
# import numpy as np
# from sentence_transformers import SentenceTransformer

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# OLLAMA_URL = "http://localhost:11434/api/generate"
# MODEL_NAME = "gemma3:12b-it-qat"

# retriever_model = SentenceTransformer("BAAI/bge-m3")
# index = faiss.read_index("qa_index_bge_m3.faiss")
# with open("qa_chunks.json", "r", encoding="utf-8") as f:
#     chunks = json.load(f)

# chat_memory: dict[str, list[str]] = {}

# def retrieve_relevant_chunks(query: str, top_k: int = 3) -> list[str]:
#     query_text = f"질문: {query}"
#     query_vec = retriever_model.encode([query_text], convert_to_numpy=True)
#     faiss.normalize_L2(query_vec)
#     _, I = index.search(query_vec, top_k)
#     return [chunks[i] for i in I[0]]

# def build_rag_prompt(query: str, retrieved_docs: list[str], history_text: str) -> str:
#     context = "\n\n".join(retrieved_docs)

#     return f"""
# 너는 따뜻하고 신뢰감 있는 AI 심리상담사야.
# 임상심리학과 정신건강 상담학을 전공한 전문가로서, 감정에 깊이 공감하면서도 문제의 본질을 함께 찾아주는 역할을 해.

# 이번 상담자는 자존감, 불안, 우울 같은 문제로 힘들어하고 있어.
# 상담자의 말에서 느껴지는 **감정의 종류와 강도**를 먼저 파악하고, 그 감정에 맞는 말투와 조언 방식을 택해줘.

# 지금까지의 대화 흐름은 아래와 같아. 반드시 이 맥락을 기억하고, 이어서 답변해줘:

# {history_text}

# 답변 구성은 아래 순서대로 해:
# 1. 상담자의 감정을 조심스럽게 추측해줘.
# 2. 그 감정에 진심으로 공감해줘.
# 3. 감정이 생긴 배경/원인을 유추해줘.
# 4. 실질적이고 구체적인 조언을 2~3가지 제시해줘.
# 5. 상담자 스스로 변화할 수 있다는 희망적인 메시지로 마무리해줘.

# 말투는 상담자와의 신뢰 형성을 최우선으로 하고,
# 지식 전달보다 감정 공감과 질문자 중심의 상담에 집중해줘.

# 반드시 "사우님"이 아니라 "상담자님"이라고 부르고,
# 답변은 길지 않게 3~5 문장으로 답변해줘.

# [참고자료]
# {context}

# [상담자 질문]
# {query}

# [AI 상담사의 답변]
# """

# @app.post("/chat")
# async def chat(request: Request):
#     body = await request.json()
#     user_input = body.get("message", "")
#     user_id = body.get("user_id", "default")

#     if user_id not in chat_memory:
#         chat_memory[user_id] = []

#     chat_memory[user_id].append(f"상담자님: {user_input}")
#     history_text = "\n".join(chat_memory[user_id][-6:])  # 최근 3쌍 (상담자+AI)

#     retrieved_docs = retrieve_relevant_chunks(user_input)
#     prompt = build_rag_prompt(user_input, retrieved_docs, history_text)

#     payload = {
#         "model": MODEL_NAME,
#         "prompt": prompt,
#         "stream": False,
#         "num_predict": 150,
#         "top_k": 40,
#         "top_p": 0.9,
#         "temperature": 0.7
#     }

#     try:
#         async with httpx.AsyncClient(timeout=120.0) as client:
#             res = await client.post(OLLAMA_URL, json=payload)
#             result = res.json()
#     except Exception as e:
#         print("[❌ 예외 발생]", str(e))
#         return {"ai_response": "모델 응답 중 오류가 발생했습니다."}

#     ai_text = result.get("response")
#     if not ai_text:
#         ai_text = "상담 내용을 처리하는 중 오류가 발생했어요. 다시 시도해 주세요."

#     chat_memory[user_id].append(f"AI: {ai_text.strip()}")

#     return {
#         "ai_response": ai_text.strip()
#     }


### 레포트 요약 기능 추가
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma3:12b-it-qat"

retriever_model = SentenceTransformer("BAAI/bge-m3")
index = faiss.read_index("qa_index_bge_m3.faiss")
with open("qa_chunks.json", "r", encoding="utf-8") as f:
    chunks = json.load(f)

chat_memory: dict[str, list[str]] = {}

def retrieve_relevant_chunks(query: str, top_k: int = 3) -> list[str]:
    query_text = f"질문: {query}"
    query_vec = retriever_model.encode([query_text], convert_to_numpy=True)
    faiss.normalize_L2(query_vec)
    _, I = index.search(query_vec, top_k)
    return [chunks[i] for i in I[0]]

def build_rag_prompt(query: str, retrieved_docs: list[str], history_text: str) -> str:
    context = "\n\n".join(retrieved_docs)

    return f"""
너는 따뜻하고 신뢰감 있는 AI 심리상담사야.
임상심리학과 정신건강 상담학을 전공한 전문가로서, 감정에 깊이 공감하면서도 문제의 본질을 함께 찾아주는 역할을 해.

이번 상담자는 자존감, 불안, 우울 같은 문제로 힘들어하고 있어.
상담자의 말에서 느껴지는 **감정의 종류와 강도**를 먼저 파악하고, 그 감정에 맞는 말투와 조언 방식을 택해줘.

지금까지의 대화 흐름은 아래와 같아. 반드시 이 맥락을 기억하고, 이어서 답변해줘:

{history_text}

답변 구성은 아래 순서대로 해:
1. 상담자의 감정을 조심스럽게 추측해줘.
2. 그 감정에 진심으로 공감해줘.
3. 감정이 생긴 배경/원인을 유추해줘.
4. 실질적이고 구체적인 조언을 2~3가지 제시해줘.
5. 상담자 스스로 변화할 수 있다는 희망적인 메시지로 마무리해줘.

말투는 상담자와의 신뢰 형성을 최우선으로 하고,
지식 전달보다 감정 공감과 질문자 중심의 상담에 집중해줘.

반드시 \"사우님\"이 아니라 \"상담자님\"이라고 부르고,
답변은 길지 않게 3~5 문장으로 답변해줘.

[참고자료]
{context}

[상담자 질문]
{query}

[AI 상담사의 답변]
"""

@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    user_input = body.get("message", "")
    user_id = body.get("user_id", "default")

    if user_id not in chat_memory:
        chat_memory[user_id] = []

    chat_memory[user_id].append(f"상담자님: {user_input}")
    history_text = "\n".join(chat_memory[user_id][-6:])

    retrieved_docs = retrieve_relevant_chunks(user_input)
    prompt = build_rag_prompt(user_input, retrieved_docs, history_text)

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "num_predict": 150,
        "top_k": 40,
        "top_p": 0.9,
        "temperature": 0.7
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            res = await client.post(OLLAMA_URL, json=payload)
            result = res.json()
    except Exception as e:
        print("[❌ 예외 발생]", str(e))
        return {"ai_response": "모델 응답 중 오류가 발생했습니다."}

    ai_text = result.get("response")
    if not ai_text:
        ai_text = "상담 내용을 처리하는 중 오류가 발생했어요. 다시 시도해 주세요."

    chat_memory[user_id].append(f"AI: {ai_text.strip()}")

    return {
        "ai_response": ai_text.strip()
    }

# === 감정요약용 프롬프트 ===
def build_summary_prompt(history_text: str) -> str:
    return f"""
너는 심리상담 대화 내용을 분석하여 사용자의 감정 상태를 요약하고,
그 감정의 원인과 특성을 정리한 짧은 레포트를 작성하는 역할을 해.

아래는 상담자와 AI의 전체 대화 내용이야:

{history_text}

이 상담 내용을 기반으로 다음을 포함한 짧은 보고서를 작성해줘:
1. 현재 감정 상태 요약 (예: 불안, 우울, 분노 등 복수 가능)
2. 감정이 유발된 주요 원인
3. 상담자가 특히 힘들어했던 부분
4. 상담자가 자주 반복해서 표현한 감정이나 생각
5. 종합 평가 및 회복을 위한 조언

응답은 문단 형태로 작성하고, 너무 길지 않게 정돈해서 출력해줘.
"""

@app.post("/summary")
async def summarize(request: Request):
    body = await request.json()
    user_id = body.get("user_id", "default")

    if user_id not in chat_memory or not chat_memory[user_id]:
        return {"summary": "요약할 상담 기록이 없습니다."}

    history_text = "\n".join(chat_memory[user_id])
    prompt = build_summary_prompt(history_text)

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "num_predict": 300,
        "top_k": 40,
        "top_p": 0.9,
        "temperature": 0.7
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            res = await client.post(OLLAMA_URL, json=payload)
            result = res.json()
    except Exception as e:
        print("[❌ 요약 오류 발생]", str(e))
        return {"summary": "레포트를 생성하는 중 오류가 발생했습니다."}

    summary = result.get("response", "").strip()
    return {"summary": summary}
