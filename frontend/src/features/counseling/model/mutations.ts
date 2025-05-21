/**
 * @file frontend/src/features/counseling/model/mutations.ts
 * @description 상담 관련 Tanstack Query 뮤테이션 훅들을 정의합니다.
 * STT 요청을 위한 뮤테이션을 추가합니다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CounselingSession } from '@/entities/counseling/model/types';
import { counselingQueryKeys } from '@/entities/counseling/model/queries'; // 경로 수정: queryKeys -> queries
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import { apiClient } from '@/shared/api';

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
  formData.append('audioFile', data.audioFile, 'recording.wav');

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
    onSuccess: (data, variables, context) => {
      // STT 성공 시 수행할 작업 (예: 특정 쿼리 무효화, 상태 업데이트 등)
      console.log('STT API Success:', data);
      // 기존 로직: 스토어 업데이트 등은 SendMessageForm.tsx의 .then() 블록에서 처리될 수 있음
      // 또는 여기서 직접 스토어 액션을 호출할 수도 있습니다.
    },
    onError: (error, variables, context) => {
      // STT 실패 시 수행할 작업
      console.error('STT API Error:', error.message, error);
    },
  });
};

/**
 * @typedef UploadVoiceFilePayload
 * @property {string} counsId - 상담 세션 ID
 * @property {Blob} audioFile - 업로드할 오디오 파일 (Blob)
 * @property {number} messageOrder - 해당 음성 메시지의 순서
 * @property {string} [filename] - (선택사항) 서버에 저장될 파일명
 */
interface UploadVoiceFilePayload {
  counsId: string;
  audioFile: Blob;
  messageOrder: number;
  filename?: string; // .wav 또는 .webm 등 확장자 포함
}

/**
 * @typedef UploadVoiceFileResponse
 * @description 음성 파일 업로드 API의 예상 응답 타입입니다.
 * 실제 API 응답에 따라 수정해야 합니다. (예: { success: boolean, filePath?: string })
 */
interface UploadVoiceFileResponse {
  // 예시: 성공 여부 및 저장된 파일 경로 등
  success: boolean;
  message?: string;
  filePath?: string; // 서버에서 저장된 경로를 반환한다면
  // 혹은 백엔드가 저장된 ChatMessage 객체를 반환할 수도 있습니다.
}

/**
 * 음성 파일을 서버의 /counsels/{counsId}/voice 엔드포인트로 업로드합니다.
 * @async
 * @function uploadVoiceFile
 * @param {UploadVoiceFilePayload} payload - counsId, audioFile, messageOrder 포함
 * @returns {Promise<UploadVoiceFileResponse>} 업로드 결과
 * @throws {Error} API 요청 실패 시 에러 발생
 */
const uploadVoiceFile = async (payload: UploadVoiceFilePayload): Promise<UploadVoiceFileResponse> => {
  const { counsId, audioFile, messageOrder, filename } = payload;

  if (!counsId) throw new Error('Counseling ID (counsId) is required for voice upload.');
  if (!audioFile) throw new Error('Audio file (audioFile) is required for voice upload.');
  if (typeof messageOrder !== 'number') throw new Error('Message order (messageOrder) is required for voice upload.');

  const formData = new FormData();
  // Swagger 스펙에 따라 필드명을 'file'로 변경
  // filename이 제공되면 사용하고, 아니면 기본 파일명을 'voice.wav'로 사용
  const finalFilename = filename || 'voice.wav'; // .wav 또는 .webm 등 확장자 포함
  formData.append('file', audioFile, finalFilename);

  // Swagger 스펙에 따라 messageOrder를 쿼리 파라미터로 전달
  const endpoint = `/counsels/${counsId}/voice?messageOrder=${messageOrder}`;

  // apiClient.post 호출 시 config 객체를 통해 Content-Type을 'multipart/form-data'로 명시적으로 설정합니다.
  return apiClient.post<FormData, UploadVoiceFileResponse>(
    endpoint,
    formData,
    {
      // headers: { // FormData 사용 시 Content-Type 헤더는 Axios가 자동으로 설정하도록 제거합니다.
      //   'Content-Type': 'multipart/form-data',
      // },
      timeout: 30000,
    } as import('axios').InternalAxiosRequestConfig // 타입 단언은 유지하거나, 필요시 조정
  );
};

/**
 * 음성 파일을 업로드하는 Tanstack Query 뮤테이션 훅입니다.
 * @returns {import('@tanstack/react-query').UseMutationResult<UploadVoiceFileResponse, Error, UploadVoiceFilePayload, unknown>}
 */
export const useUploadVoiceFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<UploadVoiceFileResponse, Error, UploadVoiceFilePayload, unknown>({
    mutationFn: uploadVoiceFile,
    onSuccess: (data, variables) => {
      console.log('음성 파일 업로드 성공:', data);
      // 성공 시 특정 쿼리 무효화 또는 다른 액션 수행 가능
      // if (variables.counsId) {
      //   queryClient.invalidateQueries({ queryKey: counselingQueryKeys.detail(variables.counsId) });
      // }
    },
    onError: (error, variables) => {
      console.error(
        `음성 파일 업로드 실패 (counsId: ${variables.counsId}, order: ${variables.messageOrder}):`,
        error.message
      );
    },
  });
};
