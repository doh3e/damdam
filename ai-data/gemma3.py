from transformers import AutoTokenizer, AutoModelForCausalLM
import torch


model_id = "google/gemma-3-4b-it"

# 모델과 토크나이저 불러오기
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    device_map={"": "cpu"},     # ✅ 전체 모델을 CPU로 올림
    torch_dtype=torch.float32   # ✅ float16은 GPU용이라 float32로!
)

# 테스트용 프롬프트
prompt = '''너는 사람들의 심리 상태를 분석하는 AI 심리상담사야.
심리상담에 대해 설명해주고, 심리 상담이 이루어지는 과정과 평가 방식에 대해서 상세하게 설명해줘.
'''
inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=1000)

print(tokenizer.decode(outputs[0], skip_special_tokens=True))
