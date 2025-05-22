# 감정 분석 포팅 매뉴얼
본 프로젝트에서 활용한 AI는 `LLM`, `감정 분석`으로 **총 2가지**입니다. 또한 모델 서빙은 개별 컨테이너에서 수행됩니다. 이 문서에서는 `감정 분석`에 관해서만 다루겠습니다.

## 의존성
`requirements.txt`
```
aiofiles==24.1.0
aliyun-python-sdk-core==2.16.0
aliyun-python-sdk-kms==2.16.5
annotated-types==0.7.0
antlr4-python3-runtime==4.9.3
anyio==4.9.0
audioread==3.0.1
certifi==2025.4.26
cffi==1.17.1
charset-normalizer==3.4.2
click==8.1.8
colorama==0.4.6
crcmod==1.7
cryptography==44.0.3
decorator==5.2.1
editdistance==0.8.1
exceptiongroup==1.2.2
fastapi==0.115.12
ffmpeg==1.4
ffmpy==0.5.0
filelock==3.18.0
fsspec==2025.3.2
funasr==1.2.6
gradio==5.29.0
gradio_client==1.10.0
groovy==0.1.2
h11==0.16.0
httpcore==1.0.9
httpx==0.28.1
huggingface==0.0.1
huggingface-hub==0.30.2
hydra-core==1.3.2
idna==3.10
intel-openmp==2021.4.0
jaconv==0.4.0
jamo==0.4.1
jieba==0.42.1
Jinja2==3.1.6
jmespath==0.10.0
joblib==1.5.0
kaldiio==2.18.1
lazy_loader==0.4
librosa==0.11.0
llvmlite==0.44.0
markdown-it-py==3.0.0
MarkupSafe==3.0.2
mdurl==0.1.2
mkl==2021.4.0
modelscope==1.25.0
mpmath==1.3.0
msgpack==1.1.0
networkx==3.4.2
numba==0.61.2
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
nvidia-nccl-cu12==2.20.5
nvidia-nvjitlink-cu12==12.9.41
nvidia-nvtx-cu12==12.1.105
omegaconf==2.3.0
orjson==3.10.18
oss2==2.19.1
packaging==25.0
pandas==2.2.3
pillow==11.2.1
platformdirs==4.3.7
pooch==1.8.2
protobuf==6.30.2
pycparser==2.22
pycryptodome==3.22.0
pydantic==2.11.4
pydantic_core==2.33.2
pydub==0.25.1
Pygments==2.19.1
pynndescent==0.5.13
python-dateutil==2.9.0.post0
python-dotenv==1.1.0
python-multipart==0.0.20
pytorch-wpe==0.0.1
pytz==2025.2
PyYAML==6.0.2
regex==2024.11.6
requests==2.32.3
rich==14.0.0
ruff==0.11.8
safehttpx==0.1.6
safetensors==0.5.3
scikit-learn==1.6.1
scipy==1.15.2
semantic-version==2.10.0
sentencepiece==0.2.0
shellingham==1.5.4
six==1.17.0
sniffio==1.3.1
soundfile==0.13.1
soxr==0.5.0.post1
starlette==0.46.2
sympy==1.14.0
tbb==2021.13.1
tensorboardX==2.6.2.2
threadpoolctl==3.6.0
tokenizers==0.21.1
tomlkit==0.13.2
torch==2.3.0
torch-complex==0.4.4
torchaudio==2.3.0
tqdm==4.67.1
transformers==4.51.3
triton==2.3.0
typer==0.15.3
typing-inspection==0.4.0
typing_extensions==4.13.2
tzdata==2025.2
umap-learn==0.5.7
urllib3==2.4.0
uvicorn==0.34.2
websockets==15.0.1
```

## 환경 구성
`Linux`, `Docker` 환경 기준 설정입니다.
## Forked SenseVoice
`SenseVoice`는 알리바바 그룹이 제공하는 음성 분석 모델입니다.  
본 프로젝트에서는 `SenseVoice`의 `softmax`값을 사용해 음성에서 확인되는 감정의 정도를 표현하는 데에 활용했습니다. 이를 위해 기존 레포지토리에 약간의 수정이 필요합니다.

`SenseVoice` 레포지토리 `Fork` 후 시작
```bash
# SenseVoice fork한 레포지토리 
git clone https://github.com/your-github/SenseVoice.git
```
`model.py`를 수정해야 합니다. 먼저 `softmax` 값을 받아오는 함수를 추가해줍니다.
```python
def get_softmax_prob(self, ctc_logits: torch.Tensor):
    probs = ctc_logits.exp()
    emotion_frame_idx = 1
    # utt_probs = probs.mean(dim=1)

    batch_emotion_probs = []
    for b_idx in range(probs.size(0)):
        p = probs[b_idx, emotion_frame_idx]
        batch_emotion_probs.append({
            emo: p[idx].item()
            for emo, idx in self.emo_dict.items()
        })
    return batch_emotion_probs
```
`SenseVoiceSmall.inference`의 `result`에 추가해줍니다.
```py
...
class SenseVoiceSmall(nn.Module):
    ...
    def inference(...):
        ...
        # c. Passed the encoder result and the beam search
        ctc_logits = self.ctc.log_softmax(encoder_out)

        # custom
        batch_emotion_probs = self.get_softmax_prob(ctc_logits)
        ...
        for i in range(b):
            ...
            if output_timestamp:
                ...
                result_i = {"key": key[i], "text": text, "timestamp": timestamp}
                result_i['emotion_probs'] = batch_emotion_probs[i]
                results.append(result_i)
            else:
                result_i = {"key": key[i], "text": text}
                result_i['emotion_probs'] = batch_emotion_probs[i]
                results.append(result_i)
        return results, meta_data
```
혹은 간편하게 본 프로젝트 레포지토리 클론
```bash
git clone https://github.com/your-github/SenseVoice.git
```
\*개인 레포지토리이므로 지워질 수 있습니다.

혹은 첨부된 `model.py`를 사용하셔도 됩니다.

### Fast API
모델 서빙을 위한 api 서버입니다.  
`.env` 파일에서 환경변수를 읽어오므로 먼저 설정해주셔야 합니다.
```bash
nano .env
```
```ini
PORT=8002
HOST="0.0.0.0"
```

#### Docker
```bash
nano Dockerfile
```
```dockerfile
# python:3.10.12 를 명시적으로 사용
FROM python:3.10.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . .
EXPOSE 8002
# fastapi 파일 실행
CMD ["python3", "mytest.py"]
```
```bash
docker build -t ai-emotion .   # DockerFile 위치
docker run -d -p 8002:8002 --name ai-emotion-container ai-emotion
```
모델이 설치될 때까지 fastapi 서버가 실행되지 않으므로 확인해주세요.

```bash
docker logs -f ai-emotion-container
```

#### 엔드포인트
감정 분석은 다음 두 가지 기능을 제공합니다.
| endpoint    | 설명                         |
| ------ | -------------------------- |
| `/text` | 텍스트 감정 분석 |
| `/audio` | 음성 감정 분석 |

#### 텍스트 감정 분석
`POST` `http://your-domain:8002/text`  
요청 body는 다음과 같으며, `text`는 필수입니다.
```json
{
  "text": "요즘 너무 우울해."
}
```
`klue/RoBERTa`에 감정 분류 태스크가 추가 학습된 모델을 사용합니다.  
[ubo7/RoBERTa-emotion-classfication](https://huggingface.co/ubo7/RoBERTa-emotion-classfication)  
\*개인 레포지토리이므로 지워질 수 있습니다.

#### 음성 감정 분석
`POST` `http://your-domain:8002/audio`  
요청 body는 다음과 같으며, `audio_url`은 필수입니다.

```json
{
  "audio_url": "http://your-hosted-audio-file-link"
}
```
혹은
```json
{
  "audio_url": "C:\Users\your-sample.wav"
}
```