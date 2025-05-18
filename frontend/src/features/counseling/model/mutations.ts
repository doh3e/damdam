/**
 * @file frontend/src/features/counseling/model/mutations.ts
 * @description 상담 관련 Tanstack Query 뮤테이션 훅들을 정의합니다.
 * STT 요청을 위한 뮤테이션을 추가합니다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CounselingSession } from '@/entities/counseling/model/types';
import { counselingQueryKeys } from '@/entities/counseling/model/queries'; // 경로 수정: queryKeys -> queries
import { useCounselingStore } from '@/features/counseling/model/counselingStore';

// ... (기존 뮤테이션 코드들) ...

/**
 * @typedef STTRequestData
 * @property {Blob} audioFile - STT를 수행할 오디오 파일 (Blob 형태)
 */
interface STTRequestData {
  audioFile: Blob;
}

/**
 * @typedef STTResponseData
 * @property {string} text - STT 변환 결과 텍스트
 */
interface STTResponseData {
  text: string;
}

/**
 * STT API Route(/api/stt)로 오디오 파일을 전송하여 텍스트로 변환하는 비동기 함수입니다.
 * @async
 * @function requestSTT
 * @param {STTRequestData} data - 오디오 파일을 포함하는 요청 데이터
 * @returns {Promise<STTResponseData>} STT 변환 결과 텍스트를 포함하는 Promise
 * @throws {Error} API 요청 실패 시 에러 발생
 */
const requestSTT = async (data: STTRequestData): Promise<STTResponseData> => {
  const formData = new FormData();
  formData.append('audioFile', data.audioFile, 'recording.webm'); // 파일 이름 지정 (서버에서 사용될 수 있음)

  // Next.js API Route는 현재 도메인을 사용하므로 전체 URL을 명시할 필요는 없지만,
  // 명확성을 위해 또는 외부 API를 호출하는 경우 전체 URL을 사용합니다.
  // 여기서는 /api/stt를 사용합니다.
  const response = await fetch('/api/stt', {
    method: 'POST',
    body: formData,
    // headers: { 'Content-Type': 'multipart/form-data' } // FormData 사용 시 브라우저가 자동으로 설정
  });

  if (!response.ok) {
    // 서버에서 에러 응답이 온 경우 (API Route에서 설정한 에러 형식 가정)
    const errorData = await response
      .json()
      .catch(() => ({ error: 'STT 요청 처리 중 알 수 없는 오류가 발생했습니다.' }));
    throw new Error(errorData.error || `STT API request failed with status ${response.status}`);
  }

  return response.json();
};

/**
 * 오디오 파일을 STT API로 전송하여 텍스트로 변환하는 Tanstack Query 뮤테이션 훅입니다.
 * @returns {import('@tanstack/react-query').UseMutationResult<STTResponseData, Error, STTRequestData, unknown>}
 * Tanstack Query 뮤테이션 결과 객체 (mutate, data, error, isLoading 등 포함)
 */
export const useRequestSTTMutation = () => {
  // 성공/에러 시 특정 쿼리 무효화 또는 다른 액션이 필요하다면 QueryClient 사용 가능
  // const queryClient = useQueryClient();

  return useMutation<STTResponseData, Error, STTRequestData, unknown>({
    mutationFn: requestSTT, // 실제 API 호출을 수행하는 함수
    // onSuccess: (data, variables, context) => {
    //   // STT 성공 시 수행할 작업 (예: 특정 쿼리 무효화, 상태 업데이트 등)
    //   console.log('STT 변환 성공:', data.text);
    // },
    // onError: (error, variables, context) => {
    //   // STT 실패 시 수행할 작업
    //   console.error('STT 변환 실패:', error.message);
    // },
  });
};

// ... (다른 기존 뮤테이션들이 있다면 여기에 유지) ...
