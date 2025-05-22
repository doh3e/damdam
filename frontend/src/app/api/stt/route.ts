/**
 * @file src/app/api/stt/route.ts
 * @description 오디오 파일을 받아 OpenAI Whisper API를 사용하여 STT(Speech-to-Text)를 수행하고,
 * 변환된 텍스트를 반환하는 Next.js App Router Route Handler입니다.
 */
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 임시 로그 추가
// console.log(
//   '[STT_ROUTE_TS] Loading OpenAI API Key from env:',
//   process.env.OPENAI_API_KEY ? 'Key Found (length: ' + process.env.OPENAI_API_KEY.length + ')' : 'Key NOT Found!'
// );
// if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length < 10) {
//   console.warn('[STT_ROUTE_TS] OpenAI API Key seems too short:', process.env.OPENAI_API_KEY);
// }

// OpenAI API 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @typedef STTErrorResponse
 * @property {string} error - 에러 메시지
 */
type STTErrorResponse = {
  error: string;
};

/**
 * @typedef STTSuccessResponse
 * @property {string} text - STT 변환 결과 텍스트
 */
type STTSuccessResponse = {
  text: string;
};

/**
 * STT API Route 핸들러 함수 (POST 요청 처리)
 * @async
 * @function POST
 * @param {NextRequest} request - Next.js API 요청 객체 (NextRequest 사용 시 formData() 등 추가 기능 활용 가능)
 * @returns {Promise<NextResponse<STTSuccessResponse | STTErrorResponse>>}
 */
export async function POST(request: NextRequest): Promise<NextResponse<STTSuccessResponse | STTErrorResponse>> {
  // console.log('[STT_ROUTE_TS_POST] Received request');
  try {
    // console.log('[STT_ROUTE_TS_POST] Attempting to get formData');
    const formData = await request.formData();
    // console.log('[STT_ROUTE_TS_POST] formData received');
    const audioFile = formData.get('audioFile');
    // console.log('[STT_ROUTE_TS_POST] audioFile retrieved:', audioFile ? 'File found' : 'File NOT found');

    if (!audioFile || !(audioFile instanceof File)) {
      console.error('[STT_ROUTE_TS_POST] Audio file validation failed');
      return NextResponse.json(
        { error: 'Audio file not found in request or is not a file (field: audioFile).' },
        { status: 400 }
      );
    }

    // Whisper API 호출 시 File 객체를 직접 전달
    // OpenAI SDK v4+는 File 객체를 지원합니다.
    // console.log('[STT_ROUTE_TS_POST] Attempting OpenAI API call');
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile, // File 객체 직접 전달
      model: 'whisper-1',
      language: 'ko',
      response_format: 'json',
    });

    // console.log('Whisper API transcription result received.');
    return NextResponse.json({ text: transcription.text }, { status: 200 });
  } catch (error: any) {
    console.error('[STT_ROUTE_TS_POST] Error caught in STT API Route:', error);

    let errorMessage = 'An unknown error occurred.';
    let statusCode = 500;

    if (error.response) {
      // OpenAI API 에러
      errorMessage = error.response.data?.error?.message || error.response.statusText || errorMessage;
      statusCode = error.response.status || statusCode;
    } else if (error.message) {
      // 일반 에러
      errorMessage = error.message;
    }

    // OpenAI API 에러 객체 구조에 따른 상세 메시지 추출 시도
    if (error.error?.message) {
      // SDK에서 발생시키는 에러 구조가 다를 수 있음
      errorMessage = error.error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

// App Router에서는 bodyParser config가 필요 없습니다.
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// OPTIONS 핸들러 (필요한 경우 CORS 등을 위해 추가)
export async function OPTIONS() {
  return new Response(null, {
    status: 204, // No Content
    headers: {
      'Access-Control-Allow-Origin': '*', // 실제 프로덕션에서는 더 제한적인 도메인 사용
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
