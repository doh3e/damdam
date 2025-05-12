# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

# CORS 설정 (프론트엔드가 붙을 수 있도록)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 배포 시 도메인 제한 필요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma3:12b-it-qat"

@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    user_input = body.get("message", "")

    payload = {
        "model": MODEL_NAME,
        "prompt": user_input,
        "stream": False  # 응답을 한 번에 받음
    }

    # async with httpx.AsyncClient() as client:
    #     response = await client.post(OLLAMA_URL, json=payload)
    #     result = response.json()
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(OLLAMA_URL, json=payload)
        result = response.json()
    return {"response": result.get("response")}
