import os
import torch
import logging
import traceback
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# === [0] 로깅 설정 ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("api_server.log")
    ]
)
logger = logging.getLogger("gemma-api")

# === [1] 모델명 및 설정 ===
model_name = "google/gemma-3-4b-it"

# === [2] 토크나이저 & 모델 로딩 ===
logger.info("🔧 모델 로딩 중...")
try:
    # transformers 라이브러리 임포트
    from transformers import AutoTokenizer, AutoModelForCausalLM
    
    # 토크나이저 로드 - 한글 처리를 위한 설정 추가
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        trust_remote_code=True,  # 원격 코드 신뢰 설정
        use_fast=True            # 빠른 토크나이저 사용
    )
    
    # 모델 로드 - 안정성을 위한 설정 추가
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16,  # 양자화 대신 float16 사용
        device_map="auto",
        attn_implementation="eager"  # 주의 메커니즘 구현 변경
    )
    
    # 모델 평가 모드로 설정
    model.eval()
    
    # 모델 메모리 사용량 확인
    if torch.cuda.is_available():
        gpu_memory = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        allocated_memory = torch.cuda.memory_allocated(0) / (1024**3)
        logger.info(f"GPU 메모리: {gpu_memory:.2f}GB, 할당된 메모리: {allocated_memory:.2f}GB")
        logger.info(f"CUDA 버전: {torch.version.cuda}")
        logger.info(f"GPU 이름: {torch.cuda.get_device_name(0)}")
    
    logger.info("✅ 모델 로딩 완료")
except Exception as e:
    logger.error(f"모델 로딩 실패: {str(e)}")
    logger.error(traceback.format_exc())
    raise

# === [3] FastAPI 앱 정의 ===
app = FastAPI(title="Gemma 3 API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === [4] 요청 스키마 정의 ===
class ChatInput(BaseModel):
    message: str = Field(..., description="사용자 메시지")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "안녕하세요"
            }
        }

# === [5] 에러 핸들러 ===
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"요청 처리 중 오류: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": f"서버 오류: {str(exc)}"},
        media_type="application/json; charset=utf-8"
    )

# === [6] 직접 생성 함수 (안정성 개선) ===
def generate_text(prompt, max_length=500):
    try:
        logger.info(f"프롬프트: {prompt}")
        # 입력 토큰화 - 명시적으로 디바이스 지정
        inputs = tokenizer(prompt, return_tensors="pt")
        inputs = {k: v.to(model.device) for k, v in inputs.items()}
        
        # 안전한 생성 파라미터 설정
        with torch.no_grad():
            try:
                # 첫 번째 시도: 샘플링 없이 안전하게 생성
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=max_length,
                    do_sample=False,  # 샘플링 비활성화 (greedy decoding 사용)
                    num_beams=1,      # beam search 비활성화
                    pad_token_id=tokenizer.eos_token_id,
                    eos_token_id=tokenizer.eos_token_id
                )
                logger.info("첫 번째 생성 시도 성공")
            except RuntimeError as e:
                # 오류 발생 시 더 안전한 설정으로 재시도
                logger.warning(f"첫 번째 생성 시도 실패: {str(e)}, 안전 모드로 재시도")
                try:
                    outputs = model.generate(
                        **inputs,
                        max_new_tokens=max_length,
                        do_sample=False,
                        num_beams=1,
                        use_cache=False,  # 캐시 사용 비활성화
                        pad_token_id=tokenizer.eos_token_id,
                        eos_token_id=tokenizer.eos_token_id
                    )
                    logger.info("두 번째 생성 시도 성공")
                except RuntimeError as e2:
                    # 두 번째 시도도 실패하면 더 짧은 응답 생성 시도
                    logger.warning(f"두 번째 생성 시도 실패: {str(e2)}, 짧은 응답 생성 시도")
                    outputs = model.generate(
                        **inputs,
                        max_new_tokens=100,  # 더 짧은 응답
                        do_sample=False,
                        num_beams=1,
                        use_cache=False,
                        pad_token_id=tokenizer.eos_token_id,
                        eos_token_id=tokenizer.eos_token_id
                    )
                    logger.info("세 번째 생성 시도 성공")
        
        # 생성된 텍스트 디코딩
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # 입력과 출력 로깅 - 디버깅용
        logger.info(f"생성된 전체 텍스트: {generated_text}")
        
        # 프롬프트 제거 로직 개선 - 상담사: 이후의 텍스트만 추출
        if "상담사:" in generated_text:
            response = generated_text.split("상담사:", 1)[1].strip()
        else:
            # 프롬프트 전체가 포함되지 않을 수 있으므로 기존 방식 대체
            logger.warning("상담사: 접두어를 찾을 수 없음, 전체 응답 사용")
            response = generated_text[len(prompt):].strip()
            
            # 응답이 비어있는 경우 처리
            if not response:
                logger.warning("응답이 비어있음, 프롬프트 제거 없이 전체 응답 사용")
                response = generated_text.strip()
        
        logger.info(f"최종 응답 (처음 50자): {response[:50]}...")
        return response
        
    except Exception as e:
        logger.error(f"텍스트 생성 중 오류: {str(e)}")
        logger.error(traceback.format_exc())
        return f"죄송합니다, 응답 생성 중 오류가 발생했습니다. 다시 시도해주세요."

# === [7] /chat 엔드포인트 ===
@app.post("/chat")
async def chat(request: Request):
    try:
        # 원시 바디 데이터를 직접 처리
        body = await request.body()
        logger.info(f"원시 요청 바디: {body}")
        
        # JSON 파싱 시도
        try:
            import json
            body_json = json.loads(body)
            message = body_json.get("message", "")
        except json.JSONDecodeError as e:
            logger.error(f"JSON 파싱 실패: {str(e)}")
            raise HTTPException(status_code=400, detail="잘못된 JSON 형식입니다")
        
        # 메시지 유효성 검사
        if not message:
            raise HTTPException(status_code=400, detail="메시지가 비어있습니다")
            
        # 입력 로깅
        logger.info(f"입력 메시지: {message}")
        
        # 프롬프트 구성 - 심리상담사 컨텍스트 추가
        prompt = f"당신은 공감적이고 도움이 되는 AI 심리상담사입니다. 사용자의 감정과 상황을 이해하고 도움이 되는 조언을 제공하세요.\n\n사용자: {message}\n상담사:"
        
        # 직접 생성 함수 호출
        answer = generate_text(prompt)
        
        # 응답이 비어있는지 확인
        if not answer or answer.isspace():
            logger.warning("빈 응답이 생성됨. 기본 응답 사용")
            answer = "죄송합니다, 현재 응답을 생성할 수 없습니다. 다시 시도해주세요."
        
        # UTF-8 인코딩으로 명시적 응답
        return JSONResponse(
            content={"reply": answer},
            media_type="application/json; charset=utf-8"
        )
    except HTTPException:
        # 이미 생성된 HTTPException은 그대로 전달
        raise
    except Exception as e:
        logger.error(f"추론 중 오류: {str(e)}")
        logger.error(traceback.format_exc())
        # 더 자세한 오류 메시지 반환
        return JSONResponse(
            status_code=500,
            content={"detail": f"추론 중 오류: {str(e)}", "type": str(type(e))},
            media_type="application/json; charset=utf-8"
        )

# === [8] 헬스 체크 ===
@app.get("/")
def health_check():
    return JSONResponse(
        content={"status": "ok", "model": model_name},
        media_type="application/json; charset=utf-8"
    )

# === [9] 모델 정보 ===
@app.get("/info")
def model_info():
    info = {
        "model": model_name,
        "precision": "float16",
        "max_tokens": 500,
        "pytorch_version": torch.__version__,
        "cuda_available": torch.cuda.is_available(),
    }
    
    if torch.cuda.is_available():
        info["cuda_version"] = torch.version.cuda
        info["gpu_name"] = torch.cuda.get_device_name(0)
    
    return JSONResponse(
        content=info,
        media_type="application/json; charset=utf-8"
    )

# === [10] 서버 실행 ===
if __name__ == "__main__":
    import uvicorn
    
    # 환경 변수로 포트 설정 가능
    port = int(os.environ.get("PORT", 8000))
    
    logger.info(f"서버 시작: http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")