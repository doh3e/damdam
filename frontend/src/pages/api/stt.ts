/**
 * @file src/pages/api/stt.ts
 * @description 오디오 파일을 받아 OpenAI Whisper API를 사용하여 STT(Speech-to-Text)를 수행하고,
 * 변환된 텍스트를 반환하는 Next.js API Route 핸들러입니다.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
// formidable 타입은 @types/formidable에서 가져오지만, 실제 사용 시 라이브러리 버전과 호환되는지 확인 필요
import formidable, { errors as formidableErrors, Fields, Files, File as FormidableFile } from 'formidable';
import fs from 'fs';

// OpenAI API 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: false, // formidable을 사용하므로 Next.js의 bodyParser 비활성화
  },
};

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
 * STT API Route 핸들러 함수
 * @async
 * @function handler
 * @param {NextApiRequest} req - Next.js API 요청 객체
 * @param {NextApiResponse<STTSuccessResponse | STTErrorResponse>} res - Next.js API 응답 객체
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<STTSuccessResponse | STTErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const form = formidable({});
  let tempFilepath: string | undefined;

  try {
    const [fields, files] = await new Promise<[Fields<string>, Files<string>]>((resolve, reject) => {
      form.parse(req, (err, parsedFields: Fields<string>, parsedFiles: Files<string>) => {
        // formidable v3+ 에러 처리 방식 개선
        if (err) {
          // Formidable 에러인지 확인 (타입 가드 역할도 수행 가능)
          // @types/formidable에서 구체적인 에러 타입을 제공한다면 해당 타입으로 캐스팅하거나 instanceof 사용
          if (err instanceof Error) {
            // 기본적인 Error 타입인지 확인
            // formidableErrors 값들과 비교하여 좀 더 구체적인 formidable 에러인지 식별 가능
            // 예를 들어, err.code (Node.js 시스템 에러 코드) 또는 formidable 자체 에러 코드(err.internalCode 등)
            // formidable v3+ 에서는 err.httpCode 와 같은 속성이 있을 수 있음
            const formidableError = err as any; // 임시로 any 사용, @types/formidable 확인 후 구체적인 타입 적용 필요
            console.error('Formidable parsing error:', formidableError);
            return reject({
              message: formidableError.message || 'Error parsing form data',
              httpCode: formidableError.httpCode || 400, // formidable 에러 객체에 httpCode가 있을 수 있음
            });
          }
          // 일반 에러 또는 알 수 없는 에러 타입
          console.error('Unknown parsing error:', err);
          return reject({ message: 'Unknown error parsing form data', httpCode: 500 });
        }
        resolve([parsedFields, parsedFiles]);
      });
    });

    // 'audioFile' 필드에서 파일 가져오기 (formidable v3는 배열로 반환할 수 있음)
    const audioFileField = files.audioFile;
    if (!audioFileField || (Array.isArray(audioFileField) && audioFileField.length === 0)) {
      return res.status(400).json({ error: 'Audio file not found in request (field: audioFile).' });
    }

    // audioFileField가 배열이면 첫 번째 요소 사용, 아니면 그대로 사용
    const audioFile: FormidableFile = Array.isArray(audioFileField) ? audioFileField[0] : audioFileField;

    if (!audioFile || !audioFile.filepath) {
      return res.status(400).json({ error: 'Audio file content or filepath is missing.' });
    }
    tempFilepath = audioFile.filepath; // 나중에 삭제하기 위해 경로 저장

    // Whisper API 호출
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilepath), // fs.createReadStream은 string 경로 필요
      model: 'whisper-1',
      language: 'ko',
      response_format: 'json',
    });

    console.log('Whisper API transcription result received.');
    res.status(200).json({ text: transcription.text });
  } catch (error: any) {
    console.error('Error in STT API Route:', error);
    // 에러 객체에 httpCode가 있으면 해당 코드를 사용 (formidable 에러의 경우)
    const statusCode = error.httpCode || (error.response && error.response.status) || 500;
    const errorMessage =
      (error.response && error.response.data && error.response.data.error && error.response.data.error.message) ||
      error.message ||
      'An unknown error occurred.';

    res.status(statusCode).json({ error: errorMessage });
  } finally {
    // 임시 파일이 생성되었다면 삭제
    if (tempFilepath) {
      fs.unlink(tempFilepath, (unlinkErr) => {
        if (unlinkErr) {
          // 파일 삭제 실패는 클라이언트에게 오류를 보낼 필요는 없지만, 서버 로그에는 남기는 것이 좋음
          console.error('Failed to delete temporary audio file:', tempFilepath, unlinkErr);
        }
      });
    }
  }
}
