from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import Dict
import re
# ✅ 대화 메모리 초기화
chat_memory: Dict[str, list[str]] = {}
print("🚨 [chat_memory] 상담 대화 기록 초기화 완료 – 새로운 세션으로 시작합니다.")
app = FastAPI()

# === CORS 설정 ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "null"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === 모델, 데이터 로딩 ===
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma3:12b-it-qat"

retriever_model = SentenceTransformer("BAAI/bge-m3")
index = faiss.read_index("qa_index_bge_m3.faiss")
with open("qa_chunks.json", "r", encoding="utf-8") as f:
    chunks = json.load(f)

chat_memory: Dict[str, list[str]] = {}

# === 유사문서 검색 ===
def retrieve_relevant_chunks(query: str, top_k: int = 3) -> list[str]:
    query_vec = retriever_model.encode([f"질문: {query}"], convert_to_numpy=True)
    faiss.normalize_L2(query_vec)
    _, I = index.search(query_vec, top_k)
    return [chunks[i] for i in I[0]]

# === 프롬프트 생성 ===
def build_rag_prompt(
    query: str,
    retrieved_docs: list[str],
    history_text: str,
    nickname: str,
    user_context: dict,
    emotion: dict
) -> str:
    context = "\n\n".join(retrieved_docs)

    profile_info = []
    if user_context.get("age"):
        profile_info.append(f"{user_context['age']} 연령대")
    if user_context.get("gender"):
        profile_info.append(f"{user_context['gender']} 성별")
    if user_context.get("career"):
        profile_info.append(f"{user_context['career']} 직업")
    if user_context.get("mbti"):
        profile_info.append(f"{user_context['mbti']} 성격유형")
    if user_context.get("stressReason"):
        profile_info.append(f"스트레스 요인: {user_context['stressReason']}")

    profile_summary = ", ".join(profile_info)
    emotion_summary = (
        f"감정 분석 결과: "
        f"우울({emotion.get('sadness', 0)}), 행복({emotion.get('happiness', 0)}), "
        f"분노({emotion.get('angry', 0)}), 중립({emotion.get('neutral', 0)}), 기타({emotion.get('other', 0)})"
    )

    return f"""
너는 따뜻하고 신뢰감 있는 AI 심리상담사야.
말투는 {user_context.get("botCustom", "상냥한")} 톤으로 유지해.

상담자는 "{nickname}"이라는 이름으로 불리고 싶어 해. 반드시 이 이름을 사용해서 말해줘.

상담자의 배경 정보: {profile_summary}
{emotion_summary}

지금까지 상담자와 나눈 대화 기록은 다음과 같아:

{history_text}

[상담자 질문]
{query}

[AI 상담사의 답변 지침]
- 반드시 사용자가 “안녕”, “안녕하세요”, “hi” 등 명시적인 인사를 먼저 했을 경우에만 가볍게 인사해.
- 사용자가 인사하지 않는다면, 절대 인사하지 말고, 상담만 진행해.
- **인사 이후에도**, 내담자가 말하지 않은 감정, 배경, 과거 사건 등은 절대 유추하지 마.
- 특히, 인사에 이어 “요즘 힘드셨죠?”, “회사 일이 힘드셨죠?”, “꿈을 잊으셨죠?” 등의 표현은 **금지야.**
- 인사 이후에는 반드시 “무엇이 가장 마음에 걸리셨을까요?”, “어떤 이야기부터 나눠볼까요?”처럼 **중립적인 질문으로 연결해.**

❌ 예시 (잘못된 응답):
질문: 안녕하세요  
응답: 안녕하세요, 내담이님. 요즘 많이 힘드셨죠? 회사도 그렇고...

✅ 예시 (좋은 응답):
질문: 안녕하세요  
응답: 안녕하세요, {nickname}님. 반갑습니다. 어떤 이야기부터 나눠볼까요?

- 사용자가 말하지 않은 내용(회사, 팀원, 집, 꿈, 우울함 등)은 절대 말하지 마.

- 정보가 부족할 경우 추측하지 말고, 상황에 맞는 간단한 질문을 제시해.

- 내담자의 감정 상태는 반드시 **발화에 나타난 직접적 표현**에 기반하여 추측해.  
  예: “너무 힘들다”라고 했다면 → “그만큼 힘든 시간이셨던 것 같아요”와 같이 반영하되, **배경 유추 금지.**

- 사용자가 본인이 했던 질문을 기억하냐고 물어보면, 반드시 사용자의 질문이 무엇이었는지 기억해서 알려줘. 다른 말을 하지마.
  예: "방금 전에 저에게 요즘 너무 힘들다고 말씀해주셨어요."

- 절대 말하지 않은 배경, 장소, 관계(예: 학교, 집, 가족, 친구, 직장 등)를 **추론하거나 언급하지 마.**  
  ❌ “학교와 집안 모두에서 어려움을 겪고 계시고...” ← 이런 문장은 금지

- 내담자가 요청하지 않은 **해결책이나 조언을 제시하지 마.**  
  예: “일기를 써보세요”, “전문가와 이야기해보세요” 등은 말하지 마

- 위로 표현도 **한두 문장 이상 반복하지 마.**  
  예: “혼자가 아니에요”, “곁에 있어요” 같은 문장은 최대 1회 이하로만 표현하고, **중복된 표현은 피해야 함**

- 아래 참고 문서의 답변 스타일(A)을 참고해. 다만, **사용자의 입력이 우선이며, 참고 문서에 있는 감정이나 사건을 끌어오지 마.**

- 반드시 '{nickname}님'이라고 부르고, 응답은 3~5문장, 하나의 문단으로 간결하게 마무리해.  
  문장이 너무 길거나 단락이 여러 개인 답변은 불안감을 줄 수 있으니 지양해.

[❗ 예시]

질문: 나 너무 힘들다!!!  
잘못된 응답 ❌: 학교와 집안에서도 어려움을 겪고 계시고...  
잘된 응답 ✅: 그렇게 말씀하신 걸 보니 정말 지치셨던 것 같아요. 어떤 부분이 가장 힘들게 느껴졌을까요?

→ 반드시 “사용자의 입력 범위 내에서만” 응답을 생성하고, 그 외의 해석은 하지 마.


[❗ 절대 금지 사항 예시]
❌ 사용자가 말하지 않은 환경(예: 집안, 부모) 유추  
❌ 정해진 듯한 조언 ("작은 것부터 시작해보세요" 등 반복 문구)  
✅ 사용자의 표현을 있는 그대로 반영 ("너무 힘들다" → "그렇게 말씀하신 걸 보니 정말 지치셨던 것 같아요")

[참고 문서]
아래는 유사한 상담 문서에서 발췌한 실제 응답 예시야.  
→ 단, 표현 방식만 참고하고, 여기에 있는 내용(장소, 인물, 사건 등)은 절대 가져오지 마.

{context}
"""

# === /ai-data/chat 엔드포인트 ===


@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    context = body.get("userContext", {}) or {}
    message_input = body.get("messageInput", {}) or {}
    emotion = body.get("emotion", {}) or {}

    nickname = context.get("nickname", "상당자")

    # -1 값은 null 대신 None 처리
    for k in ["depression", "anxiety", "stress"]:
        if context.get(k) == -1:
            context[k] = None

    message = message_input.get("message", "")
    if not message:
        return {"ai_response": "무엇이든 입력해주세요."}

    # 여기서는 이전 대화를 보지 않는다고 가정
    history_text = f"상당자: {message}"
    retrieved_docs = retrieve_relevant_chunks(message)

    prompt = build_rag_prompt(
        query=message,
        retrieved_docs=retrieved_docs,
        history_text=history_text,
        nickname=nickname,
        user_context=context,
        emotion=emotion
    )

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "num_predict": 250,
        "top_k": 40,
        "top_p": 0.9,
        "temperature": 0.7
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            res = await client.post(OLLAMA_URL, json=payload)
            result = res.json()
            ai_text = result.get("response", "").strip()
    except Exception as e:
        print("[❌ chat 예외 발생]", str(e))
        return {"ai_response": "모델 응답 중 오류가 발생했습니다."}

    return {"ai_response": ai_text}


# 📋 요약 프롬프트
def build_summary_prompt(history_text: str) -> str:
    return f"""
너는 지금까지의 상담 대화를 바탕으로 상담자님의 감정 상태를 분석하는 심리상담사야.
Russell 감정 원형 모형(Circumplex Model of Affect)에 따라 감정을 분석해.

아래는 상담자와 AI의 전체 대화 내용이야:

{history_text}

이 상담 내용을 기반으로, 아래 JSON 형식으로 요약 보고서를 작성해줘.
이 상담 내용을 기반으로 아래 형식에 맞는 JSON 리포트를 작성해줘. 각 필드는 다음을 충실히 반영해야 해:

---

📌 "summary": 전체 상담 내용을 객관적으로 요약해. 감정 분석은 하지 말고, 어떤 주제로 어떤 이야기들이 오갔는지만 간결하게 정리해.

📌 "analyze": 대화 중 상담자의 감정이 어떻게 흘러갔는지 분석해줘. 예를 들어, 처음에는 불안했지만 점차 안정을 찾았다거나, 분노가 점점 줄어들고 무기력함이 드러났다는 식으로 시간 순서의 감정 변화를 서술해.

📌 "valence": Russell 감정 원형 모델 기준으로 상담자의 전반적인 감정 방향을 평가해. (예: "positive", "neutral", "negative")

📌 "arousal": Russell 감정 원형 모델 기준으로 감정의 활성도를 평가해. (예: "high", "medium", "low")

---

✅ 반드시 아래 JSON 형식으로만 출력하고, 설명 문장이나 여분의 텍스트는 절대 포함하지 마.  
✅ JSON 키 이름은 반드시 영문 소문자로 유지하고, 순서도 유지해.

```json
{{
  "summary": "대화 요약 (예: 상담자는 최근 업무 스트레스로 인해 불면을 겪고 있음을 이야기했다...)",
  "analyze": "감정 변화 분석 (예: 초반에는 분노가 있었지만 점점 우울과 무기력함이 강조되었다...)",
  "valence": "positive | neutral | negative",
  "arousal": "high | medium | low"
}}
```
"""

@app.post("/summary")
async def summarize(request: Request):
    body = await request.json()
    message_list = body.get("messageList", [])

    if not message_list:
        return {"summary": "요약할 상담 기록이 없습니다."}

    # messageOrder 순서대로 정렬
    message_list.sort(key=lambda m: m.get("messageOrder", 0))

    history_lines = []
    for m in message_list:
        sender = m.get("sender", "USER")
        speaker = "상담자" if sender == "USER" else "AI"
        content = m.get("message", "")
        history_lines.append(f"{speaker}: {content}")

    history_text = "\n".join(history_lines)
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
            response_text = result.get("response", "").strip()

            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                match = re.search(r"\{[\s\S]*\}", response_text)
                if match:
                    return json.loads(match.group())
                else:
                    return {
                        "summary": "JSON 형식을 파싱할 수 없습니다.",
                        "raw_response": response_text
                    }

    except Exception as e:
        print("[❌ 요약 오류 발생]", str(e))
        return {
            "summary": "레포트를 생성하는 중 오류가 발생했습니다.",
            "raw_response": response_text if "response_text" in locals() else "없음"
        }
def build_period_report_prompt(full_dialogs_text: str) -> str:
    return f"""
너는 감정 분석과 대화 흐름 해석에 능한 **전문 심리상담사**야.  
아래는 한 사용자가 일정 기간 동안 AI 상담사와 나눈 전체 상담 대화야.

이 대화에서 감정 흐름, 표현된 정서, 회복의 실마리 등을 분석해서 **전문 상담 리포트**를 작성해줘.
[전체 상담 대화 기록]
{full_dialogs_text}
---

🧠 반드시 아래 4개 항목을 포함해서 서술해줘:  
- 각 항목은 단순 나열이 아닌 **서술형 문단**으로 작성해야 해  
- 감정의 흐름과 맥락, 회복의 신호 등을 담백하게 담아내는 전문가 시선이 필요해  
- **상담 회기 수는 명시하지 않아도 되며**, 시간 흐름에 따라 자연스럽게 정리하면 돼

---

1. **"summary"**  
- 사용자의 감정 흐름, 주요 표현, 행동의 변화 등을 시간 순서대로 정리  
- 단순 요약이 아닌 **감정 변화**, **회복의 실마리**, **상담의 의미 있는 순간**을 중심으로 서술

2. **"compliment"**  
- AI가 사용자의 태도, 말, 변화에 대해 긍정적으로 반응한 부분을 **구체적 표현 + 해석** 중심으로 정리  
- 예: 어떤 발화에 어떤 칭찬이 있었고, 그 칭찬이 어떤 심리적 효과를 노렸는지

3. **"worry"**  
- 사용자가 표현한 우울, 무기력, 불안 등의 정서를 문장 중심으로 제시하되,  
  각 표현이 **어떤 심리 상태를 드러내는지**, 상담사가 읽은 정서적 의미도 포함해

4. **"advice"**  
- AI가 감정 완화나 자기 이해, 회복을 위해 시도한 개입(질문, 피드백 등)을 정리  
- 단순 문장이 아니라, **질문/제안이 어떤 기능을 했는지**도 서술해

---

✅ 아래 JSON 형식으로 출력해줘  
✅ 설명 문장은 포함하지 말고, JSON **키 순서와 이름**도 정확히 지켜줘  
✅ 각 필드는 **서술형 문단**으로 정성껏 채워줘

```json
{{
  "summary": "감정 흐름, 정서 변화, 회복 과정 중심의 상담 리포트",
  "compliment": "사용자에게 긍정적으로 반응한 장면과 그 의미",
  "worry": "심리적 고통 표현 + 전문가적 해석",
  "advice": "AI 개입(질문/피드백)의 기능과 상담적 의미"
}}
```
"""
@app.post("/period-report")
async def generate_period_report(request: Request):
    body = await request.json()
    nickname = body.get("nickname", "default")
    dialogs = body.get("dialogs", [])

    if not dialogs:
        return {"error": "대화 기록이 없습니다."}

    full_dialogs_text = "\n".join(dialogs)
    prompt = build_period_report_prompt(full_dialogs_text)

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "num_predict": 300,  # ✅ 더 길게
        "top_k": 40,
        "top_p": 0.9,
        "temperature": 0.7
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            res = await client.post(OLLAMA_URL, json=payload)
            result = res.json()
            response_text = result.get("response", "")
            response_text = re.sub(r"```json|```", "", response_text).strip()
            print("[🧠 Ollama 응답 일부]:", response_text)  # ✅ 앞부분만 미리 확인
            ai_response_cleaned = response_text.strip()

            try:
                return json.loads(ai_response_cleaned)
            except json.JSONDecodeError:
                match = re.search(r"\{[\s\S]*\}", ai_response_cleaned)
                if match:
                    return json.loads(match.group())
                else:
                    return {
                        "error": "JSON 형식을 파싱할 수 없습니다.",
                        "raw_response": ai_response_cleaned
                    }

    except Exception as e:
        print("[❌ 기간별 리포트 오류 발생]", str(e))
        return {
            "error": "AI 분석 중 오류가 발생했습니다.",
            "raw_response": response_text if "response_text" in locals() else "없음"
        }
