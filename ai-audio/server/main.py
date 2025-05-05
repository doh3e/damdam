# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from exceptions import InvalidAudioFormatError

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
        raise InvalidAudioFormatError(f"now allowed file format: {content_type}")

    content = await file.read()

    return JSONResponse(content={
        "filename": filename,
        "content_type": content_type,
        "message": "file upload complete"
    }, status_code=200)

@app.exception_handler(InvalidAudioFormatError)
async def invalid_audio_format_handler(request: Request, exc: InvalidAudioFormatError):
    return JSONResponse(
        status_code=400,
        content={"message": "input file format error", "detail": exc.detail}
    )


