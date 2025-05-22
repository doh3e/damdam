# LLM 포팅 매뉴얼
본 프로젝트에서 활용한 AI는 `LLM`, `감정 분석`으로 **총 2가지**입니다. 또한 모델 서빙은 개별 컨테이너에서 수행됩니다. 이 문서에서는 `LLM`에 관해서만 다루겠습니다.

## 의존성
`requirements.txt`
```
--extra-index-url https://download.pytorch.org/whl/cu121
annotated-types==0.7.0
anyio==3.7.1
certifi==2025.4.26
charset-normalizer==3.4.2
click==8.2.0
exceptiongroup==1.3.0
faiss-cpu==1.10.0
fastapi==0.115.1
filelock==3.13.1
fsspec==2024.6.1
h11==0.16.0
httpcore==1.0.9
httpx==0.27.0
huggingface-hub==0.31.4
idna==3.10
Jinja2==3.1.4
joblib==1.5.0
MarkupSafe==2.1.5
mpmath==1.3.0
networkx==3.3
numpy==1.26.4
nvidia-cublas-cu12==12.1.3.1
nvidia-cuda-cupti-cu12==12.1.105
nvidia-cuda-nvrtc-cu12==12.1.105
nvidia-cuda-runtime-cu12==12.1.105
nvidia-cudnn-cu12==8.9.2.26
nvidia-cufft-cu12==11.0.2.54
nvidia-curand-cu12==10.3.2.106
nvidia-cusolver-cu12==11.4.5.107
nvidia-cusparse-cu12==12.1.0.106
nvidia-nccl-cu12==2.19.3
nvidia-nvjitlink-cu12==12.1.105
nvidia-nvtx-cu12==12.1.105
orjson==3.10.18
packaging==25.0
pillow==11.0.0
pydantic==2.11.4
pydantic_core==2.33.2
python-dotenv==1.0.1
PyYAML==6.0.2
regex==2024.11.6
requests==2.32.3
safetensors==0.5.3
scikit-learn==1.6.1
scipy==1.15.3
sentence-transformers==2.6.1
sentencepiece==0.2.0
sniffio==1.3.1
starlette==0.38.6
sympy==1.13.3
threadpoolctl==3.6.0
tokenizers==0.21.1
torch==2.2.2+cu121
torchaudio==2.2.2+cu121
torchvision==0.17.2+cu121
tqdm==4.67.1
transformers==4.51.3
triton==2.2.0
typing-inspection==0.4.0
typing_extensions==4.12.2
urllib3==2.4.0
uvicorn==0.23.2
```
`torch`, `CUDA Toolkit`버전에 주의하셔야 합니다.

## 환경 구성
`Linux`, `Docker` 환경 기준 설정입니다.

### Ollama
| 항목    | 설명                         |
| ------ | -------------------------- |
| OS     | Ubuntu 20.04 이상 |
| CPU    | -               |
| GPU    | Tesla T4           |
| 포트    | 기본적으로 `11434` 사용           |

Ollama 설치
```bash
curl -fsSL https://ollama.com/install.sh | sh
```
설치 확인
```bash
ollama --version
```
모델 다운 및 실행
```bash
ollama run gemma3:12b-it-qat
```

백그라운드에서 계속 실행되게 하려면 추가 설정이 필요합니다.
```
sudo nano /etc/systemd/system/ollama.service
```
```ini
[Unit]
Description=Ollama Server
After=network.target

[Service]
ExecStart=/usr/bin/ollama serve
Restart=always
User=ubuntu
Environment=PATH=/usr/bin:/usr/local/bin
WorkingDirectory=/home/ubuntu

[Install]
WantedBy=multi-user.target
```
```
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl start ollama
```

### Fast API
모델 서빙을 위한 api 서버입니다.

#### Docker
```bash
nano Dockerfile
```
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

# torch 계열 먼저 설치 (custom index 사용)
RUN pip install --no-cache-dir \
    torch==2.2.2+cu121 \
    torchvision==0.17.2+cu121 \
    --index-url https://download.pytorch.org/whl/cu121

# 나머지는 PyPI에서 설치
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

LLM 모델이 로컬 `Ollama`에서 구동되고 있기 때문에 `Fast API` 서버와 통신하려면 호스트 게이트웨이 설정을 추가해야 합니다.
```bash
docker build -t ai-data .   # DockerFile 위치
docker run -d  --port 8001:8001 --add-host=host.docker.internal:host-gateway --name ai-data-container ai-data
```

#### 엔드포인트
LLM은 다음 세 가지 기능을 제공합니다.
| endpoint    | 설명                         |
| ------ | -------------------------- |
| `/chat` | 채팅 응답 생성 |
| `/summary` | 감정 분석을 위한 요약본 생성 |
| `/period-report` | 기간별 레포트를 위한 요약본 생성 |

#### 채팅
`POST` `http://your-domain:8001/chat`  
요청 body는 다음과 같으며, `userContext.nickname`, `messageInput.message`는 필수입니다.
```json
{
  "nickname": "내담이",
  "message": "오늘 너무 바빠서 지치고 우울하네 ㅠㅠ",
  "isVoice": false, // 음성 비음성 여부
  "userContext": {
    "botCustom": "상냥함", // 현재는 간단한 프롬프팅만
    "gender": "FEMALE", // 성별, 값이 없거나 비어있을 수도 있음
    "age": "THIRTIES", // 연령대, 값이 없거나 비어있을 수도 있음
    "career": "백엔드 개발자", // 직업, 값이 없거나 비어있을 수도 있음
    "mbti": "INFJ", // 엠비티아이, 값이 없거나 비어있을 수도 있음
    "depression": 10, // 우울지수, 값이 없거나 비어있을 수도 있음
    "anxiety": 7, // 불안지수, 값이 없거나 비어있을 수도 있음
    "stress": 12, // 스트레스지수, 값이 없거나 비어있을 수도 있음
    "isSuicidal": false, //자살사고유무, , 값이 없거나 비어있을 수도 있음
    "stressReason": "프로젝트 마감" // 스트레스요인, , 값이 없거나 비어있을 수도 있음
  },
  "emotion": {
    "happiness": 30,
    "sadness": 50,
    "angry": 10,
    "neutral": 5,
    "other": 5
  }
}
```
빠른 로컬 테스트:
```bash
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "담담",
    "message": "안녕하세요, 오늘 기분이 좀 우울해요."
  }'
```

#### 요약
`POST` `http://your-domain:8001/summary`  
요청 body는 다음과 같으며, `messageList`는 필수입니다.
```json
{
	"counsId": 1,
	"userId": 1,
	"messageList": [
		{
		"sender": "USER",
		"isVoice": false,
		"messageOrder": 1,
		"message": "오늘 정말 너무 졸리고 힘들다.",
		"timestamp": "2025-05-21T12:35:11",
		"emotion": {
			"happiness": 0,
			"angry": 10,
			"neutral": 10,
			"sadness": 80,
			"other": 0
			}
		}, {...}, {...}
	]
}
```

#### 기간별 레포트
`POST` `http://your-domain:8001/period-report`  
요청 body는 다음과 같으며, `messageList`는 필수입니다.
```json
{
  "startDate": "2025-05-01",
  "endDate":   "2025-05-20",
  "userContext": {
    "nickname":     "담담담",
    "botCustom":    "상냥함",               
    "gender":       "FEMALE",             
    "age":          "THIRTIES",           
    "career":       "백엔드 개발자",  
    "mbti":         "ENFP",               
    "depression":   10,
    "anxiety":      10,
    "stress":       20,
    "isSuicidal":   false,
    "stressReason": "취업 준비 스트레스"
  },
  "messageList": [
    {
      "counsId":   1,
      "userId":    2,
      "timestamp": "2025-05-09T05:45:27",
      "message":   "어떤 자료구조를 공부하는 게 좋을까?",
      "emotion": {
        "happiness": 0,
        "sadness":   50,
        "angry":     0,
        "neutral":   50,
        "other":     0
      }
    },
    {
      "counsId":   2,
      "userId":    2,
      "timestamp": "2025-05-19T05:46:09",
      "message":   "오늘도 서류 떨어졌어 개빡치네.",
      "emotion": {
        "happiness": 0,
        "sadness":   30,
        "angry":     70,
        "neutral":   0,
        "other":     0
      }
    }
    // … 추가 메시지들 …
  ]
}

```

