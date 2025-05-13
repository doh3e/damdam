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
# 너는 전문 심리상담사 역할을 수행하는 AI야. 상담자님의 감정에 깊이 공감하고, 조심스럽고 따뜻한 말투로 진심을 담아 응답해야 해.

# 다음은 지금까지 상담자님과의 대화 기록이야. 이 맥락을 고려해서 이어지는 대화를 자연스럽게 이어줘:

# {history_text}

# [상담자 질문]
# {query}

# AI 상담사로서 너의 임무는 다음과 같아:
# 1. 먼저 감정의 종류와 강도를 조심스럽게 추측해.
# 2. 그 감정에 따뜻하고 진심 어린 말로 공감해줘.
# 3. 지금 그런 감정을 느끼게 된 계기나 상황을 조심스럽게 물어봐.
# 4. 해결책 제시는 하지 말고, 충분히 들어주고 정서적으로 지지해주는 태도를 보여줘.

# ✅ 반드시 "사우님"이 아닌 "상담자님"이라고 부르고,
# ✅ 말투는 차분하고 공감적인 톤을 유지해줘.
# ✅ 답변은 3~4문장으로 자연스럽고 간결하게 마무리해줘.

# [참고자료]
# {context}

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
#     history_text = "\n".join(chat_memory[user_id][-6:])

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

# # === 감정요약용 프롬프트 (Russell 모델 기반 포함) ===
# def build_summary_prompt(history_text: str) -> str:
#     return f"""
# 너는 지금까지 상담자와 AI가 나눈 심리상담 대화를 분석해서,
# 상담자의 감정 상태를 Russell의 원형 감정 모형(Circumplex Model of Affect)에 기반해 요약하고,
# 구체적인 감정 점수를 포함한 JSON 형태로 정리해줘.

# 다음과 같은 JSON 형식으로 응답해:

# {{
#   "summary": "감정 흐름에 대한 자연어 요약",
#   "scores": {{
#     "우울": 정수 (0~10),
#     "불안": 정수 (0~10),
#     "무기력": 정수 (0~10),
#     "외로움": 정수 (0~10),
#     "분노": 정수 (0~10)
#   }},
#   "valence": "positive | neutral | negative",
#   "arousal": "high | medium | low"
# }}

# ✅ 반드시 JSON 형식으로 정확하게 응답해줘. summary는 자연어 문단, scores와 Russell 지표는 수치 및 문자열로 정확히 표현해.
# """

# @app.post("/summary")
# async def summarize(request: Request):
#     body = await request.json()
#     user_id = body.get("user_id", "default")

#     if user_id not in chat_memory or not chat_memory[user_id]:
#         return {"summary": "요약할 상담 기록이 없습니다."}

#     history_text = "\n".join(chat_memory[user_id])
#     prompt = build_summary_prompt(history_text)

#     payload = {
#         "model": MODEL_NAME,
#         "prompt": prompt,
#         "stream": False,
#         "num_predict": 400,
#         "top_k": 40,
#         "top_p": 0.9,
#         "temperature": 0.7
#     }

#     try:
#         async with httpx.AsyncClient(timeout=120.0) as client:
#             res = await client.post(OLLAMA_URL, json=payload)
#             result = res.json()
#     except Exception as e:
#         print("[❌ 요약 오류 발생]", str(e))
#         return {"summary": "레포트를 생성하는 중 오류가 발생했습니다."}

#     response = result.get("response", "{}").strip()

#     try:
#         parsed = json.loads(response)
#         return parsed
#     except json.JSONDecodeError:
#         return {"summary": "요약 응답을 파싱할 수 없습니다.", "raw": response}

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
너는 전문 심리상담사 역할을 수행하는 AI야. 상담자님의 감정에 깊이 공감하고, 조심스럽고 따뜻한 말투로 진심을 담아 응답해야 해.

다음은 지금까지 상담자님과의 대화 기록이야. 이 맥락을 고려해서 이어지는 대화를 자연스럽게 이어줘:

{history_text}

[상담자 질문]
{query}

AI 상담사로서 너의 임무는 다음과 같아:
1. 먼저 감정의 종류와 강도를 조심스럽게 추측해.
2. 그 감정에 따뜻하고 진심 어린 말로 공감해줘.
3. 지금 그런 감정을 느끼게 된 계기나 상황을 조심스럽게 물어봐.
4. 해결책 제시는 하지 말고, 충분히 들어주고 정서적으로 지지해주는 태도를 보여줘.

✅ 반드시 "사우님"이 아닌 "상담자님"이라고 부르고,
✅ 말투는 차분하고 공감적인 톤을 유지해줘.
✅ 답변은 3~4문장으로 자연스럽고 간결하게 마무리해줘.

[참고자료]
{context}

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

# === 감정요약용 프롬프트 (Russell 모델 기반 포함 + JSON 응답 강제) ===
def build_summary_prompt(history_text: str) -> str:
    return f"""
너는 지금까지 상담자와 AI가 나눈 심리상담 대화를 분석해서,
상담자의 감정 상태를 Russell의 원형 감정 모형(Circumplex Model of Affect)에 기반해 요약하고,
구체적인 감정 점수를 포함한 JSON 형태로 정리해줘.

아래 형식 그대로, 반드시 JSON 코드블록(```json)으로 응답해:
```json
{{
  "summary": "감정 흐름에 대한 자연어 요약",
  "scores": {{
    "우울": 정수 (0~10),
    "불안": 정수 (0~10),
    "무기력": 정수 (0~10),
    "외로움": 정수 (0~10),
    "분노": 정수 (0~10)
  }},
  "valence": "positive | neutral | negative",
  "arousal": "high | medium | low"
}}
```
✅ 반드시 위와 같이 JSON 코드블록 내에 정확히 응답해줘. summary는 자연어 문단, scores와 Russell 지표는 수치 및 문자열로 정확히 표현해.
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
        "num_predict": 400,
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

    response = result.get("response", "{}").strip()

    try:
        json_start = response.find('{')
        json_text = response[json_start:]
        parsed = json.loads(json_text)
        return parsed
    except Exception:
        return {"summary": "요약 응답을 파싱할 수 없습니다.", "raw": response}
