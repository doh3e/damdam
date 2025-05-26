from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from exceptions import *
from client_request.analyzeRequest import AnalyzeRequest
from client_request.textRequest import TextAnalyzeRequest
from model import SenseVoiceSmall
from server_config import label2scheme, prob2scheme, text_label2scheme
import tempfile
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from dotenv import load_dotenv

load_dotenv()
HF_TOKEN = os.getenv('HF_TOKEN')
app = FastAPI()

model_dir = "iic/SenseVoiceSmall"
bert_dir = 'ubo7/RoBERTa-emotion-classfication'


m, kwargs = SenseVoiceSmall.from_pretrained(model=model_dir, device="cuda:0")
m.eval()

tokenizer = AutoTokenizer.from_pretrained(bert_dir, token=HF_TOKEN)
bert = AutoModelForSequenceClassification.from_pretrained(bert_dir, token=HF_TOKEN)
bert_id2label = bert.config.id2label

# HF_TOKEN = os.getenv('HF_TOKEN')
# AWS_KEY = os.getenv('AWS_KEY')
# AWS_SECRET = os.getenv('AWS_SECRET')
# BUCKET_NAME = "damdam-counseling-bucket"

@app.get("/")
def read_root():
    return {"message": "Hello audio-AI server!"}

@app.post("/audio")
async def analyze(req: AnalyzeRequest):
    from funasr.utils.load_utils import download_from_url
    import time
    
    url = req.audio_url
    
    filename = url.split("/")[-1]
    ext = filename.split(".")[-1]


    if ext not in ['mp3', 'wav']:
        raise InvalidAudioFormatError(f'.{ext}')
    
    print(f'request url: {url}')
    
    try:
        res = m.inference(
            data_in=url,
            language="auto", # "zh", "en", "yue", "ja", "ko", "nospeech"
            use_itn=False,
            ban_emo_unk=False,
            **kwargs,
        )
    except HTTPException as e:
        raise str(e)
    except Exception as e:
        raise InternalSenseVociceError(e)

    emotion_scores = {
        prob2scheme[label]: round(v*100)
        for label, v in res[0][0]['emotion_probs'].items()
    }

    # final emotion tag
    res = res[0][0]["text"].split("<|woitn|>")
    li = res[0].replace("<", "").replace(">", "").split("|")
    li = [e for e in li if e]

    final_language, final_emotion, final_event = li
    
    return JSONResponse(content={
        "message": "success",
        "filename": filename,
        "result": {
            "emotion": label2scheme[final_emotion],
            "emotion_scores": emotion_scores,
            "language": final_language,
            "event": final_event
        },
        
    }, status_code=200)
    
@app.post("/text")
async def text_analyze(req: TextAnalyzeRequest):
    def predict_emotion(text):
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = bert(**inputs)
            logits = outputs.logits
            pred_id = torch.argmax(logits, dim=1).item()
            pred_label = bert_id2label[pred_id]
            probs = torch.softmax(logits, dim=1).squeeze().tolist()
        return pred_label, probs
    
    def score_recalculate(scores:list ):
        recalculated_scores = {emo:0 for emo in label2scheme.values()}

        for i, v in enumerate(scores):
            emo = bert_id2label[i]
            recalculated_scores[text_label2scheme[emo]] += v
        for emo, v in recalculated_scores.items():
            recalculated_scores[emo] = round(v*100)
        return recalculated_scores

    text = req.text
    predicted = predict_emotion(text)
    emotion = text_label2scheme[predicted[0]]
    emotion_scores = score_recalculate(predicted[1])

    return JSONResponse(content={
        "message": "success",
        "text": text,
        "result": {
            "emotion": emotion,
            "emotion_scores": emotion_scores,
            "language": "ko",
            "event": "Speech"
        }
    }, status_code=200)


@app.post("/legacy-analyze")
async def legacy_analyze(file: UploadFile=File(...)):
    filename = file.filename
    content_type = file.content_type

    #---------- 음성 파일 임시 저장 후 피처 추출
    ext = os.path.splitext(file.filename)[-1]
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(await file.read())
        tmp.flush()
        tmp_path = tmp.name
        if not content_type.startswith('audio'):
            raise InvalidAudioFormatError(content_type)
    try:
        res = m.inference(
            data_in=tmp_path,
            language="auto", # "zh", "en", "yue", "ja", "ko", "nospeech"
            use_itn=False,
            ban_emo_unk=False,
            **kwargs,
        )
    except Exception:
        raise InternalSenseVociceError("inference failed")
    finally:
        os.remove(tmp_path)

    # emotion score 
    emotion_scores = {
        prob2scheme[label]: round(v, 0)
        for label, v in res[0][0]['emotion_probs'].items()
    }

    # final emotion tag
    res = res[0][0]["text"].split("<|woitn|>")
    li = res[0].replace("<", "").replace(">", "").split("|")
    li = [e for e in li if e]

    final_language, final_emotion, final_event = li
    
    return JSONResponse(content={
        "filename": filename,
        "content_type": content_type,
        "message": "success",
        "result": {
            "emotion": label2scheme[final_emotion],
            "emotion_scores": emotion_scores,
            "language": final_language,
            "event": final_event
        },
        
    }, status_code=200)

@app.exception_handler(InvalidAudioFormatError)
async def invalid_audio_format_handler(request: Request, exc: InvalidAudioFormatError):
    return JSONResponse(content={
            "message": "input file format error",
            "detail": exc.detail
        }, status_code=400)

@app.exception_handler(InternalSenseVociceError)
async def sensevoice_internal_handler(request: Request, exc: InternalSenseVociceError):
    return JSONResponse(content={
            "message": "audio model error",
            "detail": exc.detail
        }, status_code=500)

@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status": exc.status_code,
        },
    )



if __name__ == "__main__":
    import uvicorn

    PORT = int(os.getenv('PORT'))
    HOST = os.getenv('HOST')

    uvicorn.run(app, host=HOST, port=PORT)

