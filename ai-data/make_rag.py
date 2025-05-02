import json
import pandas as pd

def extract_qa_pairs_from_file(filepath: str):
    qa_pairs = []
    
    with open(filepath, "r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if not line:
                continue
            try:
                session = json.loads(line)
                for i in range(len(session) - 1):
                    q = session[i]
                    a = session[i + 1]
                    if q["speaker"] == "상담사" and a["speaker"] == "내담자":
                        qa_pairs.append({
                            "question": q["utterance"].strip(),
                            "answer": a["utterance"].strip()
                        })
            except json.JSONDecodeError:
                print("⚠️ JSON 파싱 오류 발생. 해당 라인 건너뜀.")
    
    return pd.DataFrame(qa_pairs)

# 예시 사용법
file_path = "rag_data.txt"
df = extract_qa_pairs_from_file(file_path)

# 출력 저장 (옵션)
df.to_csv("qa_dataset.csv", index=False, encoding="utf-8-sig")  # Excel에서 읽기 편하게
df.to_json("qa_dataset.json", force_ascii=False, orient="records", indent=2)
