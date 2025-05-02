# import os
# from typing import List, Optional

# from dotenv import load_dotenv
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from langchain.chains import RetrievalQA
# from langchain.prompts import PromptTemplate
# from langchain.vectorstores.faiss import FAISS
# from langchain.embeddings import HuggingFaceEmbeddings
# from langchain.schema import Document
# from langchain.docstore import InMemoryDocstore
# from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
# from langchain.llms import HuggingFacePipeline
# from pydantic import BaseModel
# import torch
# import faiss
# import json
# import numpy as np

# # === [1] 환경 변수 및 모델 로딩 ===

# load_dotenv()

# # Huggingface Gemma 3 로컬 LLM 로딩
# gemma_model_name = "google/gemma-2b-it"  # 더 가벼운 모델로 변경
# print("🔧 LLM 모델 로딩 시작")
# tokenizer = AutoTokenizer.from_pretrained(gemma_model_name)
# model = AutoModelForCausalLM.from_pretrained(
#     gemma_model_name,
#     device_map="auto",
#     torch_dtype=torch.float32  # CPU 환경에 적합하도록 float32 사용
# )

# pipe = pipeline(
#     "text-generation",
#     model=model,
#     tokenizer=tokenizer,
#     max_new_tokens=1000,
#     temperature=0.5,
#     top_p=0.9,
#     do_sample=True
# )

# gemma_llm = HuggingFacePipeline(pipeline=pipe)
# print("✅ LLM 모델 로딩 완료")

# # === [2] FAISS 인덱스 및 문서 로딩 ===
# print("🔧 FAISS 인덱스 로딩 시작")
# embedding_model = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")

# index = faiss.read_index("qa_index_bge_m3.faiss")
# with open("qa_chunks.json", "r", encoding="utf-8") as f:
#     chunks = json.load(f)

# docs = [Document(page_content=chunk, metadata={}) for chunk in chunks]
# index_to_docstore_id = {i: str(i) for i in range(len(docs))}
# docstore = InMemoryDocstore({str(i): doc for i, doc in enumerate(docs)})

# vectorstore = FAISS(
#     embedding_model.embed_query,
#     index,
#     docstore,
#     index_to_docstore_id
# )

# retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
# print("✅ FAISS 인덱스 로딩 완료")

# # === [3] FastAPI 앱 정의 ===

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # === [4] 요청 바디 정의 ===

# class ChatMessage(BaseModel):
#     role: str
#     content: str

# class AssistantRequest(BaseModel):
#     message: str
#     thread_id: Optional[str] = None

# class ChatRequest(BaseModel):
#     messages: List[ChatMessage]

# class MessageRequest(BaseModel):
#     message: str

# # === [5] 프롬프트 템플릿 ===

# custom_prompt = PromptTemplate(
#     input_variables=["context", "question"],
#     template="""
# 너는 공감 능력이 뛰어난 AI 심리상담사야.

# 아래는 실제로 비슷한 고민을 가진 사용자들과의 상담 사례들이야. 이 사례들을 참고해서, 지금 사용자의 질문에 맞는 **새로운 조언**을 **너의 말로 직접** 생성해서 전달해 줘.

# 다음 규칙을 반드시 지켜:
# 1. 참고자료는 절대 그대로 복붙하지 마. 요약하거나 너만의 문장으로 다시 써.
# 2. 사용자의 감정 상태를 추론하고 그에 공감하는 말을 먼저 해 줘.
# 3. 이후 실질적인 조언이나 위로, 제안이 이어져야 해.
# 4. 필요하다면 아래 예시들을 참고해 말투를 맞춰줘.

# 📚 상담 예시 (few-shot)
# 사용자: 요즘 너무 무기력하고 아무 것도 하기 싫어요.
# 상담사: 그럴 수 있어요. 몸이 너무 지쳤거나, 마음이 텅 빈 느낌이 들 땐 아무것도 하기 싫을 수 있어요. 우선 그런 마음을 억지로 바꾸려 하지 않아도 괜찮아요. 잠깐 쉬는 것도 방법이에요.

# 사용자: 사람들이 다 저를 싫어하는 것 같아요.
# 상담사: 그런 생각이 들면 많이 외롭고 불안하셨을 것 같아요. 그런데 대부분의 사람들은 타인의 생각보다 자기 일에 더 집중해요. 혹시 너무 혼자서 고민하고 있진 않나요?

# [참고자료]
# {context}

# [사용자 질문]
# {question}

# [상담사로서의 답변]

#     """
# )

# # === [6] 상담 응답 API ===

# @app.post("/chat")
# async def chat_endpoint(req: MessageRequest):
#     print("📩 받은 요청:", req)
#     print("📨 message 내용:", repr(req.message))

#     if not req.message or not req.message.strip():
#         return {
#             "reply": "상담 내용을 입력해 주세요 🙏",
#             "sources": []
#         }

#     print("🧱 QA 체인 생성 시작")
#     qa = RetrievalQA.from_chain_type(
#         llm=gemma_llm,
#         chain_type="stuff",
#         retriever=retriever,
#         return_source_documents=True,
#         chain_type_kwargs={"prompt": custom_prompt}
#     )

#     print("🚀 프롬프트 실행 시작")
#     result = qa.invoke(req.message)
#     print("✅ 응답 생성 완료")

#     source_docs = result['source_documents']
#     sources = [{"content": doc.page_content, "metadata": doc.metadata} for doc in source_docs]

#     for i, source in enumerate(sources):
#         print(f"📚 Source {i + 1}: {source['content']}")
#         print(f"🗂 Metadata: {source['metadata']}")

#     return {
#         "reply": result['result'],
#         "sources": sources
#     }

# # === [7] 헬스 체크 ===

# @app.get("/health")
# @app.get("/")
# async def health_check():
#     return {"status": "ok"}

# # === [8] 실행 ===

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
#########################################################
# 버전 2
# import os
# import json
# import faiss
# import torch
# import numpy as np
# from typing import List, Optional
# from dotenv import load_dotenv
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from sentence_transformers import SentenceTransformer
# from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
# from langchain.vectorstores.faiss import FAISS
# from langchain.schema import Document
# from langchain.docstore import InMemoryDocstore
# from langchain.embeddings import HuggingFaceEmbeddings

# # === [1] 환경 변수 및 모델 로딩 ===
# load_dotenv()

# # Gemma 모델 로딩 (Gemma 2B)
# gemma_model_name = "google/gemma-4b-it"
# print("🔧 LLM 모델 로딩 시작")
# tokenizer = AutoTokenizer.from_pretrained(gemma_model_name)
# model = AutoModelForCausalLM.from_pretrained(
#     gemma_model_name,
#     device_map="auto",
#     torch_dtype=torch.float32
# )
# pipe = pipeline(
#     "text-generation",
#     model=model,
#     tokenizer=tokenizer,
#     max_new_tokens=1000,
#     temperature=0.7,
#     top_p=0.9,
#     do_sample=True
# )
# print("✅ LLM 모델 로딩 완료")

# # === [2] FAISS 인덱스 및 문서 로딩 ===
# print("🔧 FAISS 인덱스 로딩 시작")
# embedding_model = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")
# index = faiss.read_index("qa_index_bge_m3.faiss")
# with open("qa_chunks.json", "r", encoding="utf-8") as f:
#     chunks = json.load(f)

# docs = [Document(page_content=chunk, metadata={}) for chunk in chunks]
# index_to_docstore_id = {i: str(i) for i in range(len(docs))}
# docstore = InMemoryDocstore({str(i): doc for i, doc in enumerate(docs)})

# vectorstore = FAISS(
#     embedding_model.embed_query,
#     index,
#     docstore,
#     index_to_docstore_id
# )
# retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
# print("✅ FAISS 인덱스 로딩 완료")

# # === [3] FastAPI 앱 정의 ===
# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # === [4] 요청 바디 정의 ===
# class MessageRequest(BaseModel):
#     message: str

# # === [5] 상담 응답 API ===
# @app.post("/chat")
# async def chat_endpoint(req: MessageRequest):
#     query = req.message.strip()
#     if not query:
#         return {"reply": "상담 내용을 입력해 주세요 🙏", "sources": []}

#     # 🔍 RAG 검색
#     docs = retriever.get_relevant_documents(query)
#     context = "\n\n".join([doc.page_content for doc in docs])

#     # ✨ 프롬프트 구성
#     prompt = f"""
# 너는 공감 능력이 뛰어나고, 실제 심리상담사처럼 섬세하고 전문적으로 상담을 진행하는 AI야.

# 지금 사용자는 삶에 지치고 감정적으로 매우 불안정한 상태일 수 있어.  
# 너의 역할은 단순히 위로하는 것이 아니라, 사용자의 감정을 세심하게 유추하고,  
# 그 안에 숨어 있는 상처의 원인을 함께 찾아보는 것이야.

# 아래에는 비슷한 고민을 가진 사람들과의 실제 상담 사례가 있어.  
# 이 사례들을 참고해서 지금 사용자에게 꼭 맞는 **새로운 답변**을 **너의 언어로 직접** 만들어줘.

# 상담할 때는 다음 원칙을 반드시 지켜:
# 1. 상담자님의 말 속에서 어떤 감정과 배경이 느껴지는지 먼저 유추해.  
#    예: ‘상담자님께서는 오랜 시간 외로움을 견디고 계셨던 것 같아요.’  
# 2. 감정을 먼저 진심으로 공감하고,  
# 3. 그다음으로 실질적인 위로와 전문적인 조언을 이어가.  
# 4. 문제의 원인을 함께 찾아가는 질문도 조심스럽게 던져줘.  
# 5. 말투는 따뜻하고 배려 깊게. 지식 전달보다 관계 형성을 우선해.  
# 6. **‘사우님’이라는 표현은 절대 쓰지 말고, 반드시 ‘상담자님’으로 바꿔서 사용해.**  
# 7. 상담사로서 너무 짧지도, 너무 장황하지도 않게. 진심이 느껴지는 분량으로 답변해.

# [상담 사례 모음]  
# {context}

# [상담자님의 고민]  
# {query}

# [상담사로서의 답변]

# """

#     output = pipe(prompt)[0]["generated_text"]
#     answer = output.split("[상담사로서의 답변]")[-1].strip()

#     return {
#         "reply": answer,
#         "sources": [{"content": doc.page_content, "metadata": doc.metadata} for doc in docs]
#     }

# # === [6] 헬스 체크 ===
# @app.get("/health")
# @app.get("/")
# async def health_check():
#     return {"status": "ok"}

# # === [7] 실행 ===
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)


# 버전 3 모델 변경
import os
import json
import faiss
import torch
import numpy as np
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from langchain.vectorstores.faiss import FAISS
from langchain.schema import Document
from langchain.docstore import InMemoryDocstore
from langchain.embeddings import HuggingFaceEmbeddings

# === [1] 환경 변수 및 모델 로딩 ===
load_dotenv()

# Gemma 모델 로딩 (Gemma 3 4B)
gemma_model_name = "google/gemma-3-4b-it"
print("🔧 LLM 모델 로딩 시작")
tokenizer = AutoTokenizer.from_pretrained(gemma_model_name)
model = AutoModelForCausalLM.from_pretrained(
    gemma_model_name,
    device_map="auto",
    torch_dtype=torch.float32
)
pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_new_tokens=1000,
    temperature=0.7,
    top_p=0.9,
    do_sample=True
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
class MessageRequest(BaseModel):
    message: str

# === [5] 상담 응답 API ===
@app.post("/chat")
async def chat_endpoint(req: MessageRequest):
    query = req.message.strip()
    if not query:
        return {"reply": "상담 내용을 입력해 주세요 🙏", "sources": []}

    # 🔍 RAG 검색
    docs = retriever.get_relevant_documents(query)
    context = "\n\n".join([doc.page_content.replace("사우님", "상담자님") for doc in docs])

    # ✨ 프롬프트 구성
    prompt = f"""
너는 공감 능력이 뛰어나고, 실제 심리상담사처럼 섬세하고 전문적으로 상담을 진행하는 AI야.

지금 사용자는 삶에 지치고 감정적으로 매우 불안정한 상태일 수 있어.  
너의 역할은 단순히 위로하는 것이 아니라, 사용자의 감정을 세심하게 유추하고,  
그 안에 숨어 있는 상처의 원인을 함께 찾아보는 것이야.

아래에는 비슷한 고민을 가진 사람들과의 실제 상담 사례가 있어.  
이 사례들을 참고해서 지금 사용자에게 꼭 맞는 **새로운 답변**을 **너의 언어로 직접** 만들어줘.

상담할 때는 다음 원칙을 반드시 지켜:
1. 상담자님의 말 속에서 어떤 감정과 배경이 느껴지는지 먼저 유추해.  
   예: ‘상담자님께서는 오랜 시간 외로움을 견디고 계셨던 것 같아요.’  
2. 감정을 먼저 진심으로 공감하고,  
3. 그다음으로 실질적인 위로와 전문적인 조언을 이어가.  
4. 문제의 원인을 함께 찾아가는 질문도 조심스럽게 던져줘.  
5. 말투는 따뜻하고 배려 깊게. 지식 전달보다 관계 형성을 우선해.  
6. **‘사우님’이라는 표현은 절대 쓰지 말고, 반드시 ‘상담자님’으로 바꿔서 사용해.**  
7. 상담사로서 너무 짧지도, 너무 장황하지도 않게. 진심이 느껴지는 분량으로 답변해.

[상담 사례 모음]  
{context}

[상담자님의 고민]  
{query}

[AI 상담사의 답변]
"""

    output = pipe(prompt)[0]["generated_text"]

    # '[AI 상담사의 답변]' 이후만 추출
    import re
    match = re.search(r"\\[AI 상담사의 답변\\](.*)", output, re.DOTALL)
    if match:
        answer = match.group(1).strip()
    else:
        answer = output[len(prompt):].strip()

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
