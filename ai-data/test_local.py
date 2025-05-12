# import json
# import faiss
# import numpy as np
# from sentence_transformers import SentenceTransformer
# from transformers import AutoTokenizer, AutoModelForCausalLM
# import torch

# # === [1] 모델 및 데이터 로딩 ===

# # 벡터 검색용 임베딩 모델
# retriever_model = SentenceTransformer("BAAI/bge-m3")
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# print(f"Using device: {device}")

# # 생성형 언어 모델 (Gemma 3 4B)
# llm_tokenizer = AutoTokenizer.from_pretrained("google/gemma-3-4b-it")
# llm_model = AutoModelForCausalLM.from_pretrained(
#     "google/gemma-3-4b-it",
#     device_map={"": device},
#     torch_dtype=torch.float16
# )

# # FAISS 인덱스와 chunks 로딩
# index = faiss.read_index("qa_index_bge_m3.faiss")
# with open("qa_chunks.json", "r", encoding="utf-8") as f:
#     chunks = json.load(f)


# # === [2] FAISS 검색 함수 ===

# def retrieve_relevant_chunks(query: str, top_k: int = 3) -> list[str]:
#     """질문 벡터화 후 FAISS로 관련 문서 top_k개 검색"""
#     query_text = f"질문: {query}"
#     query_vec = retriever_model.encode([query_text], convert_to_numpy=True)
#     faiss.normalize_L2(query_vec)
#     _, I = index.search(query_vec, top_k)
#     return [chunks[i] for i in I[0]]


# # === [3] 프롬프트 생성 (RAG + 대화형 스타일) ===

# def build_rag_prompt(query: str, retrieved_docs: list[str]) -> str:
#     """문서 내용을 참고자료로 넣고 LLM이 자연스럽게 답변 생성하도록 구성"""
#     context = "\n\n".join(retrieved_docs)

#     prompt = f"""
# 너는 공감 능력이 뛰어나고, 실제 심리상담사처럼 섬세하고 전문적으로 상담을 진행하는 AI야.

# 지금 사용자는 삶에 지치고 감정적으로 매우 불안정한 상태일 수 있어.  
# 너의 역할은 단순히 위로하는 것이 아니라, 사용자의 감정을 세심하게 유추하고,  
# 그 안에 숨어 있는 상처의 원인을 함께 찾아보는 것이야.

# 아래에는 비슷한 고민을 가진 사람들과의 실제 상담 사례가 있어.  
# 이 사례들을 참고해서 지금 사용자에게 꼭 맞는 **새로운 답변**을 **너의 언어로 직접** 만들어줘.
# 또한 사용자가 이전 자신의 상담 내용을 물어보면 꼭 기억해 두었다가, 답변해줘.

# 상담할 때는 다음 원칙을 반드시 지켜:
# 1. 상담자님의 말 속에서 어떤 감정과 배경이 느껴지는지 먼저 유추해.  
# 2. 감정을 먼저 진심으로 공감하고,  
# 3. 그다음으로 실질적인 위로와 전문적인 조언을 이어가.  
# 4. 문제의 원인을 함께 찾아가는 질문도 조심스럽게 던져줘.  
# 5. 말투는 따뜻하고 배려 깊게. 지식 전달보다 관계 형성을 우선해.  
# 6. **‘사우님’이라는 표현은 절대 쓰지 말고, 반드시 ‘상담자님’으로 바꿔서 사용해.**  
# 7. 상담사로서 너무 짧지도, 너무 장황하지도 않게. 진심이 느껴지는 분량으로 답변해.

# [참고자료]
# {context}

# [사용자 질문]
# {query}

# [AI 상담사의 답변]
# """
#     return prompt


# # === [4] LLM 응답 생성 ===

# def generate_rag_response(query: str) -> tuple[str, str]:
#     """RAG 검색 + 프롬프트 구성 + 생성형 답변 (검색 결과도 반환)"""
#     retrieved_docs = retrieve_relevant_chunks(query, top_k=3)
#     prompt = build_rag_prompt(query, retrieved_docs)

#     inputs = llm_tokenizer(prompt, return_tensors="pt")
#     outputs = llm_model.generate(
#         **inputs,
#         max_new_tokens=1000,
#         temperature=0.7,
#         top_p=0.9,
#         do_sample=True
#     )

#     response = llm_tokenizer.decode(outputs[0], skip_special_tokens=True)
#     return "\n\n".join(retrieved_docs), response


# # === [5] 실행 예시 ===

# if __name__ == "__main__":
#     user_query = "죽고 싶다는 생각이 자꾸 들어요. 어떻게 해야 하나요?"
#     print("💬 사용자 질문:", user_query)

#     retrieved_text, response = generate_rag_response(user_query)

#     print("\n📚 [참고자료 (RAG 검색 결과)]")
#     print(retrieved_text)

#     print("\n🧠 [AI 상담사의 답변]")
#     print(response)

# import json
# import faiss
# import numpy as np
# from sentence_transformers import SentenceTransformer
# from transformers import AutoTokenizer, AutoModelForCausalLM
# import torch

# # === [0] 디바이스 설정 ===
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# print(f"Using device: {device}")

# # === [1] 모델 및 데이터 로딩 ===

# # 벡터 검색용 임베딩 모델 (sentence‐transformers 도 GPU 사용 가능)
# retriever_model = SentenceTransformer("BAAI/bge-m3", device=device)

# # 생성형 언어 모델 (Gemma 3 4B) → GPU 로드
# llm_tokenizer = AutoTokenizer.from_pretrained("google/gemma-3-4b-it")
# llm_model = AutoModelForCausalLM.from_pretrained(
#     "google/gemma-3-4b-it",
#     torch_dtype=torch.float16  # 메모리 절약을 위해 FP16
# ).to(device)               # 전체 모델을 GPU로 이동

# # FAISS 인덱스와 chunks 로딩
# index = faiss.read_index("qa_index_bge_m3.faiss")
# with open("qa_chunks.json", "r", encoding="utf-8") as f:
#     chunks = json.load(f)

# # === [2] FAISS 검색 함수 ===

# def retrieve_relevant_chunks(query: str, top_k: int = 3) -> list[str]:
#     query_text = f"질문: {query}"
#     query_vec = retriever_model.encode([query_text], convert_to_numpy=True)
#     faiss.normalize_L2(query_vec)
#     _, I = index.search(query_vec, top_k)
#     return [chunks[i] for i in I[0]]

# # === [3] 프롬프트 생성 ===

# def build_rag_prompt(query: str, retrieved_docs: list[str]) -> str:
#     context = "\n\n".join(retrieved_docs)
#     return f"""
# 너는 공감 능력이 뛰어난 AI 심리상담사야...
# [참고자료]
# {context}

# [사용자 질문]
# {query}

# [AI 상담사의 답변]
# """

# # === [4] LLM 응답 생성 ===

# def generate_rag_response(query: str) -> tuple[str, str]:
#     retrieved_docs = retrieve_relevant_chunks(query, top_k=3)
#     prompt = build_rag_prompt(query, retrieved_docs)

#     # 토크나이징 & 디바이스 이동
#     inputs = llm_tokenizer(prompt, return_tensors="pt").to(device)

#     # 생성
#     outputs = llm_model.generate(
#         **inputs,
#         max_new_tokens=256,
#         do_sample=True,
#         temperature=0.7,
#         top_p=0.9
#     )

#     response = llm_tokenizer.decode(outputs[0], skip_special_tokens=True)
#     return "\n\n".join(retrieved_docs), response

# # === [5] 실행 예시 ===

# if __name__ == "__main__":
#     user_query = "죽고 싶다는 생각이 자꾸 들어요. 어떻게 해야 하나요?"
#     print("💬 사용자 질문:", user_query)

#     retrieved_text, response = generate_rag_response(user_query)

#     print("\n📚 [참고자료]")
#     print(retrieved_text)

#     print("\n🧠 [AI 상담사의 답변]")
#     print(response)

### gpu에 올린 코드 -> float에서 에러 발생생
# import json
# import faiss
# import torch
# from sentence_transformers import SentenceTransformer
# from transformers import AutoTokenizer, AutoModelForCausalLM
# import re

# # === [0] GPU 설정 ===
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# print("Using device:", device)

# # === [1] 모델 & 데이터 로딩 ===
# retriever = SentenceTransformer("BAAI/bge-m3", device=device)

# tokenizer = AutoTokenizer.from_pretrained("google/gemma-3-4b-it")
# llm_model = AutoModelForCausalLM.from_pretrained(
#     "google/gemma-3-4b-it",
#     torch_dtype=torch.float16
# ).to(device)
# llm_model.config.pad_token_id = tokenizer.eos_token_id

# index = faiss.read_index("qa_index_bge_m3.faiss")
# with open("qa_chunks.json","r",encoding="utf-8") as f:
#     chunks = json.load(f)

# # === [2] 검색 함수 ===
# def retrieve_relevant_chunks(query, top_k=3):
#     vec = retriever.encode([f"질문: {query}"], convert_to_numpy=True)
#     faiss.normalize_L2(vec)
#     _, I = index.search(vec, top_k)
#     return [chunks[i] for i in I[0]]

# # === [3] 프롬프트 생성 ===
# def build_rag_prompt(query, docs):
#     ctx = "\n\n".join(docs)
#     return f"""
# 너는 공감 능력이 뛰어난 AI 심리상담사야.

# [참고자료]
# {ctx}

# [사용자 질문]
# {query}

# [AI 상담사의 답변]
# """

# # === [4] 응답 생성 ===
# def generate_rag_response(query):
#     docs = retrieve_relevant_chunks(query)
#     prompt = build_rag_prompt(query, docs)
#     inputs = tokenizer(prompt, return_tensors="pt").to(device)

#     try:
#         outputs = llm_model.generate(
#             **inputs,
#             max_new_tokens=256,
#             do_sample=True,
#             temperature=0.7,
#             top_p=0.9,
#             pad_token_id=tokenizer.eos_token_id,
#             eos_token_id=tokenizer.eos_token_id,
#             repetition_penalty=1.2,
#             no_repeat_ngram_size=2
#         )
#     except RuntimeError:
#         outputs = llm_model.generate(
#             **inputs,
#             max_new_tokens=256,
#             do_sample=False,
#             num_beams=4,
#             early_stopping=True,
#             pad_token_id=tokenizer.eos_token_id,
#             eos_token_id=tokenizer.eos_token_id
#         )

#     full = tokenizer.decode(outputs[0], skip_special_tokens=True)

#     # '[AI 상담사의 답변]' 뒤 부분
#     if "[AI 상담사의 답변]" in full:
#         resp = full.split("[AI 상담사의 답변]",1)[1]
#     else:
#         resp = full[len(prompt):]
#     resp = resp.strip()

#     # 특수 토큰 제거
#     resp = re.sub(r"<unused\d+>", "", resp)
#     # 한글, 영문, 숫자, 기본 구두점만 허용
#     resp = re.sub(r"[^\uAC00-\uD7A3\w\s\.,!?\-]", "", resp)
#     resp = resp.strip()

#     return "\n\n".join(docs), resp

# # === [5] 테스트 ===
# if __name__ == "__main__":
#     q = "요즘 너무 불안해요"
#     docs, answer = generate_rag_response(q)
#     print("[참고자료]\n", docs)
#     print("[답변]\n", answer)

## QT
# test_quant_rag.py
## guff 시도 했던 코드드
# import os
# import json
# import faiss
# import torch
# import re
# from sentence_transformers import SentenceTransformer
# from transformers import (
#     AutoTokenizer,
#     AutoModelForCausalLM,
#     BitsAndBytesConfig
# )

# # === [0] 설정 ===
# DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# MODEL_PATH = "/home/ubuntu/gemma-3-12b-it"
# OFFLOAD_FOLDER = "/home/ubuntu/offload"

# # === [1] 임베딩 모델 (RAG) ===
# print(f"Loading retriever on {DEVICE}…")
# retriever = SentenceTransformer("BAAI/bge-m3", device=DEVICE)

# # === [2] 토크나이저 & LLM (quantized) 로드 ===
# print("Loading tokenizer & quantized LLM…")
# tokenizer = AutoTokenizer.from_pretrained(
#     MODEL_PATH,
#     trust_remote_code=True
# )

# quant_cfg = BitsAndBytesConfig(
#     load_in_4bit=True,
#     bnb_4bit_quant_type="nf4",
#     bnb_4bit_compute_dtype=torch.float16,
#     bnb_4bit_use_double_quant=True
# )

# model = AutoModelForCausalLM.from_pretrained(
#     MODEL_PATH,
#     quantization_config=quant_cfg,
#     device_map="auto",
#     offload_folder=OFFLOAD_FOLDER,
#     torch_dtype=torch.float16,
#     low_cpu_mem_usage=True,
#     trust_remote_code=True
# )
# model.config.pad_token_id = tokenizer.eos_token_id
# print("Model ready.")

# # === [3] FAISS 인덱스 로드 ===
# print("Loading FAISS index…")
# index = faiss.read_index("qa_index_bge_m3.faiss")
# with open("qa_chunks.json", "r", encoding="utf-8") as f:
#     chunks = json.load(f)

# # === [4] 검색 함수 ===
# def retrieve_relevant_chunks(query: str, top_k: int = 3) -> list[str]:
#     if not query.strip():
#         raise ValueError("입력 문장이 비어 있습니다.")
#     q = retriever.encode([f"질문: {query}"], convert_to_numpy=True)
#     faiss.normalize_L2(q)
#     _, I = index.search(q, top_k)
#     return [chunks[i] for i in I[0]]

# # === [5] 프롬프트 생성 ===
# def build_rag_prompt(query: str, docs: list[str]) -> str:
#     ctx = "\n\n".join(docs)
#     return f"""너는 공감 능력이 뛰어난 AI 심리상담사야.

# [참고자료]
# {ctx}

# [사용자 질문]
# {query}

# [AI 상담사의 답변]
# """

# # === [6] 생성 함수 ===
# def generate_rag_response(query: str) -> tuple[str, str]:
#     try:
#         docs = retrieve_relevant_chunks(query, top_k=3)
#     except ValueError as ve:
#         return "", f"❌ 입력 오류: {str(ve)}"

#     prompt = build_rag_prompt(query, docs)

#     inputs = tokenizer(prompt, return_tensors="pt").to(DEVICE)
#     try:
#         out = model.generate(
#             **inputs,
#             max_new_tokens=256,
#             do_sample=True,
#             temperature=0.7,
#             top_p=0.9,
#             pad_token_id=tokenizer.eos_token_id,
#             eos_token_id=tokenizer.eos_token_id,
#             repetition_penalty=1.2,
#             no_repeat_ngram_size=2
#         )
#     except RuntimeError as e:
#         print("Sampling failed, fallback to beam search:", e)
#         out = model.generate(
#             **inputs,
#             max_new_tokens=256,
#             do_sample=False,
#             num_beams=4,
#             early_stopping=True,
#             pad_token_id=tokenizer.eos_token_id,
#             eos_token_id=tokenizer.eos_token_id
#         )

#     full = tokenizer.decode(out[0], skip_special_tokens=True)
#     if "[AI 상담사의 답변]" in full:
#         resp = full.split("[AI 상담사의 답변]", 1)[1].strip()
#     else:
#         resp = full[len(prompt):].strip()

#     resp = re.sub(r"<unused\\d+>", "", resp).strip()
#     return "\n\n".join(docs), resp

# # === [7] 실행 예시 ===
# if __name__ == "__main__":
#     user_query = input("📝 질문을 입력하세요: 사는게 너무 힘들어서 죽고싶어요.").strip()
#     docs, answer = generate_rag_response(user_query)
#     print("\n📚 [참고자료]\n", docs)
#     print("\n🤖 [AI 상담사의 답변]\n", answer)

### 양자화 재시도도
# import json
# import faiss
# import numpy as np
# import torch
# import re
# from sentence_transformers import SentenceTransformer
# from transformers import (
#     AutoTokenizer,
#     AutoModelForCausalLM,
#     BitsAndBytesConfig,
# )

# # === [0] 디바이스 설정 ===
# DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# print(f"Using device: {DEVICE}")

# # === [1] 임베딩 모델 (RAG) ===
# retriever_model = SentenceTransformer("BAAI/bge-m3", device=DEVICE)

# # === [2] 양자화 설정 및 LLM 로드 ===
# quant_cfg = BitsAndBytesConfig(
#     load_in_4bit=True,
#     bnb_4bit_quant_type="nf4",
#     bnb_4bit_compute_dtype=torch.float16,
#     bnb_4bit_use_double_quant=True
# )

# llm_tokenizer = AutoTokenizer.from_pretrained("google/gemma-3-4b-it")
# llm_model = AutoModelForCausalLM.from_pretrained(
#     "google/gemma-3-4b-it",
#     device_map="auto",
#     quantization_config=quant_cfg,
#     torch_dtype=torch.float16,
#     trust_remote_code=True
# )
# llm_model.config.pad_token_id = llm_tokenizer.eos_token_id
# llm_model.eval()

# # === [3] FAISS 로딩 ===
# index = faiss.read_index("qa_index_bge_m3.faiss")
# with open("qa_chunks.json", "r", encoding="utf-8") as f:
#     chunks = json.load(f)

# # === [4] 검색 함수 ===
# def retrieve_relevant_chunks(query: str, top_k: int = 3) -> list[str]:
#     query_vec = retriever_model.encode([f"질문: {query}"], convert_to_numpy=True)
#     faiss.normalize_L2(query_vec)
#     _, I = index.search(query_vec, top_k)
#     return [chunks[i] for i in I[0]]

# # === [5] 프롬프트 구성 ===
# def build_rag_prompt(query: str, docs: list[str]) -> str:
#     context = "\n\n".join(docs)
#     return f"""
# 너는 공감 능력이 뛰어난 AI 심리상담사야.

# [참고자료]
# {context}

# [사용자 질문]
# {query}

# [AI 상담사의 답변]
# """

# # === [6] 응답 생성 ===
# def generate_rag_response(query: str) -> tuple[str, str]:
#     docs = retrieve_relevant_chunks(query)
#     prompt = build_rag_prompt(query, docs)
#     inputs = llm_tokenizer(prompt, return_tensors="pt").to(llm_model.device)

#     try:
#         outputs = llm_model.generate(
#             **inputs,
#             max_new_tokens=512,
#             do_sample=True,
#             temperature=0.7,
#             top_p=0.9,
#             repetition_penalty=1.2,
#             no_repeat_ngram_size=2,
#             pad_token_id=llm_tokenizer.eos_token_id,
#             eos_token_id=llm_tokenizer.eos_token_id
#         )
#     except RuntimeError as e:
#         print("❗ 샘플링 실패. 그리디로 재시도:", e)
#         outputs = llm_model.generate(
#             **inputs,
#             max_new_tokens=256,
#             do_sample=False,
#             num_beams=4,
#             early_stopping=True,
#             pad_token_id=llm_tokenizer.eos_token_id,
#             eos_token_id=llm_tokenizer.eos_token_id
#         )

#     full = llm_tokenizer.decode(outputs[0], skip_special_tokens=True)

#     # '[AI 상담사의 답변]' 기준 추출
#     if "[AI 상담사의 답변]" in full:
#         resp = full.split("[AI 상담사의 답변]", 1)[1]
#     else:
#         resp = full[len(prompt):]
#     resp = re.sub(r"<unused\d+>", "", resp).strip()
#     return "\n\n".join(docs), resp

# # === [7] 실행 예시 ===
# if __name__ == "__main__":
#     q = "요즘 너무 불안해요. 어떻게 해야 하죠?"
#     docs, answer = generate_rag_response(q)
#     print("\n📚 [참고자료]\n", docs)
#     print("\n🧠 [AI 상담사의 답변]\n", answer)

### 양자화 + 프롬프트 양식 변경
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import re

# === [1] 모델 및 데이터 로딩 ===

# 벡터 검색용 임베딩 모델
retriever_model = SentenceTransformer("BAAI/bge-m3")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# 생성형 언어 모델 (Gemma 3 4B)
llm_tokenizer = AutoTokenizer.from_pretrained("google/gemma-3-4b-it")
llm_model = AutoModelForCausalLM.from_pretrained(
    "google/gemma-3-4b-it",
    device_map={"": device},
    torch_dtype=torch.float16
)
llm_model.config.pad_token_id = llm_tokenizer.eos_token_id

# FAISS 인덱스와 chunks 로딩
index = faiss.read_index("qa_index_bge_m3.faiss")
with open("qa_chunks.json", "r", encoding="utf-8") as f:
    chunks = json.load(f)


# === [2] FAISS 검색 함수 ===

def retrieve_relevant_chunks(query: str, top_k: int = 3) -> list[str]:
    """질문 벡터화 후 FAISS로 관련 문서 top_k개 검색"""
    query_text = f"질문: {query}"
    query_vec = retriever_model.encode([query_text], convert_to_numpy=True)
    faiss.normalize_L2(query_vec)
    _, I = index.search(query_vec, top_k)
    return [chunks[i] for i in I[0]]


# === [3] 프롬프트 생성 (Gemma 공식 포맷 적용) ===

def build_rag_prompt(query: str, retrieved_docs: list[str]) -> str:
    """문서 내용을 참고자료로 넣고 LLM이 공식 포맷으로 답변 생성하도록 구성"""
    context = "\n\n".join(retrieved_docs)
    instruction = f"다음은 사용자와 AI 상담사 간의 대화입니다. AI는 공감 능력이 뛰어나고 섬세하게 반응합니다.\n\n[참고자료]\n{context}\n\n[사용자 질문]\n{query}"

    return (
        f"<start_of_turn>user\n{instruction}<end_of_turn>\n"
        f"<start_of_turn>model\n"
    )


# === [4] LLM 응답 생성 ===

def generate_rag_response(query: str) -> tuple[str, str]:
    """RAG 검색 + 프롬프트 구성 + 생성형 답변 (검색 결과도 반환)"""
    retrieved_docs = retrieve_relevant_chunks(query, top_k=3)
    prompt = build_rag_prompt(query, retrieved_docs)

    inputs = llm_tokenizer(prompt, return_tensors="pt", add_special_tokens=False).to(device)
    outputs = llm_model.generate(
        **inputs,
        max_new_tokens=1000,
        temperature=0.7,
        top_p=0.9,
        do_sample=True,
        repetition_penalty=1.2,
        no_repeat_ngram_size=2,
        pad_token_id=llm_tokenizer.eos_token_id,
        eos_token_id=llm_tokenizer.eos_token_id
    )

    response = llm_tokenizer.decode(outputs[0], skip_special_tokens=True)

    # "<start_of_turn>model" 이후 텍스트만 추출
    if "<start_of_turn>model" in response:
        response = response.split("<start_of_turn>model")[-1].strip()

    response = re.sub(r"<unused\d+>", "", response)
    return "\n\n".join(retrieved_docs), response


# === [5] 실행 예시 ===

if __name__ == "__main__":
    user_query = "죽고 싶다는 생각이 자꾸 들어요. 어떻게 해야 하나요?"
    print("💬 사용자 질문:", user_query)

    retrieved_text, response = generate_rag_response(user_query)

    print("\n📚 [참고자료 (RAG 검색 결과)]")
    print(retrieved_text)

    print("\n🧠 [AI 상담사의 답변]")
    print(response)
