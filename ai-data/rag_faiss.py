import json
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# Step 1: Load data
qa_pairs = []
with open("rag_data2.txt", "r", encoding="utf-8") as f:
    for line in f:
        item = json.loads(line.strip())
        qa_pairs.append({
            "question": item["input"].strip(),
            "answer": item["output"].strip()
        })

# Step 2: Chunk 생성 (Q + A 함께)
chunks = [f"Q: {qa['question']}\nA: {qa['answer']}" for qa in qa_pairs]

# Step 3: 임베딩
model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(chunks, convert_to_numpy=True)
faiss.normalize_L2(embeddings)

# Step 4: FAISS 저장
index = faiss.IndexFlatIP(embeddings.shape[1])
index.add(embeddings)

# 저장
faiss.write_index(index, "qa_index.faiss")
with open("qa_chunks.json", "w", encoding="utf-8") as f:
    json.dump(chunks, f, ensure_ascii=False, indent=2)
