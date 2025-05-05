from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from exceptions import InvalidAudioFormatError
import model, extractor
import tempfile
import os

app = FastAPI()

ALLOWED_AUDIO_TYPES = {"audio/wav", "audio/x-wav"}

@app.get("/")
def read_root():
    return {"message": "Hello audio-AI server!"}

@app.post("/analyze")
async def analyze(file: UploadFile=File(...)):
    filename = file.filename
    content_type = file.content_type

    if content_type not in ALLOWED_AUDIO_TYPES:
        raise InvalidAudioFormatError(detail=f"now allowed file format: {content_type}")

    # content = await file.read()

    #---------- 음성 파일 임시 저장 후 피처 추출
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(await file.read())
        tmp.flush()
        tmp_path = tmp.name

    try:
        features = extractor.extract(tmp_path)
    finally:
        os.remove(tmp_path)

    #---------- 모델 예측
    result = model.predict(features)
    
    return JSONResponse(content={
        "filename": filename,
        "content_type": content_type,
        "result": result,
        "message": "success"
    }, status_code=200)

@app.exception_handler(InvalidAudioFormatError)
async def invalid_audio_format_handler(request: Request, exc: InvalidAudioFormatError):
    return JSONResponse(
        status_code=400,
        content={"message": "input file format error", "detail": exc.detail}
    )


