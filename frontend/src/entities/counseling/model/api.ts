/**
 * @file entities/counseling/model/api.ts
 * 상담(Counseling) 엔티티 관련 API 호출 함수들을 정의합니다.
 * 이 함수들은 Tanstack Query의 queryFn 또는 mutationFn으로 사용될 수 있습니다.
 * FSD 아키텍처에 따라 `entities` 레이어의 `counseling` 슬라이스 내 `model`에 위치합니다.
 */
import { apiClient } from '@/shared/api'; // API 클라이언트 임포트
import { CounselingSession, ChatMessage, CounselingStatus } from './types'; // 동일 디렉토리의 타입 임포트

/**
 * 지난 상담 세션 목록을 가져오는 API 함수입니다.
 * GET /counsels
 *
 * @param {{ page?: number; limit?: number; status?: CounselingStatus }} [params] - 요청 파라미터 (페이지네이션, 상태 필터 등)
 * @returns {Promise<CounselingSession[]>} 상담 세션 목록
 */
export const fetchPastCounselingSessions = async (params?: {
  page?: number;
  limit?: number;
  status?: CounselingStatus;
}): Promise<CounselingSession[]> => {
  // API 명세서에 따라 실제 쿼리 파라미터를 구성합니다.
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);

  const endpoint = `/counsels${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return apiClient.get<CounselingSession[]>(endpoint);
};

/**
 * 특정 상담 세션의 메시지 목록을 가져오는 API 함수입니다.
 * GET /counsels/{couns_id}
 * API 명세서에 따르면 이 엔드포인트가 세션 정보와 메시지 목록을 함께 반환할 수 있습니다.
 * 여기서는 메시지 목록만 가져온다고 가정하거나, 또는 세션 전체 정보를 포함하는 타입을 반환하도록 수정할 수 있습니다.
 *
 * @param {string} sessionId - 조회할 상담 세션의 ID
 * @param {{ page?: number; limit?: number }} [params] - 요청 파라미터 (메시지 페이지네이션)
 * @returns {Promise<ChatMessage[]>} 해당 상담 세션의 메시지 목록 (또는 세션 전체 정보 타입)
 */
export const fetchCounselingMessages = async (
  sessionId: string,
  params?: { page?: number; limit?: number }
): Promise<ChatMessage[]> => {
  // 실제 응답이 세션 정보도 포함하면 타입 수정 필요
  if (!sessionId) throw new Error('Session ID is required to fetch messages.');
  // 메시지 페이징이 필요한 경우 쿼리 파라미터 추가
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const endpoint = `/counsels/${sessionId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  // API가 세션 정보와 메시지를 함께 반환한다면, 응답 타입은 { session: CounselingSession, messages: ChatMessage[] } 형태가 될 수 있음
  // 여기서는 우선 ChatMessage[]만 반환한다고 가정.
  // 실제 API 응답에 맞춰 수정 필요. 예를 들어, 세션 정보도 같이 받는다면:
  // const response = await apiClient.get<{ sessionInfo: CounselingSession, messages: ChatMessage[] }>(endpoint);
  // return response.messages;
  // 또는, 이 함수가 CounselingSession 객체를 반환하고, 그 안에 messages 필드가 포함될 수도 있음.
  // 지금은 API 명세서의 "상담 내역 보기"를 메시지 목록 조회로 해석.
  const response = await apiClient.get<{ messages: ChatMessage[] }>(endpoint); // 임시 응답 구조
  return response.messages;
};

/**
 * 새로운 상담 세션을 생성하는 API 함수입니다.
 * POST /counsels
 *
 * @param {{ userId: string; initialContext?: Record<string, any> }} data - 새 상담 생성 요청 데이터
 * @returns {Promise<CounselingSession>} 생성된 상담 세션 정보
 */
export const createCounselingSession = async (data: {
  userId: string;
  initialContext?: Record<string, any>;
}): Promise<CounselingSession> => {
  // API 명세서에는 요청 바디가 명시되어 있지 않으나, userId 등이 필요할 수 있으므로 data 객체로 받음.
  // 실제 백엔드 API 요구사항에 맞춰 요청 바디를 구성해야 함.
  return apiClient.post<{ userId: string; initialContext?: Record<string, any> }, CounselingSession>('/counsels', data);
};

/**
 * 특정 상담 세션을 종료하는 API 함수입니다. (is_closed = true로 업데이트)
 * PATCH /counsels/{couns_id}
 *
 * @param {string} sessionId - 종료할 상담 세션의 ID
 * @returns {Promise<void>} // API 명세서상 반환값이 명확하지 않으나, 성공 여부만 중요할 수 있음. 필요시 수정.
 */
export const closeCounselingSession = async (sessionId: string): Promise<void> => {
  if (!sessionId) throw new Error('Session ID is required to close the session.');
  // PATCH 요청의 바디가 필요하다면 추가. API 명세서에는 바디 내용이 없음.
  // 예: await apiClient.patch(`/counsels/${sessionId}`, { is_closed: true });
  return apiClient.patch<undefined, void>(`/counsels/${sessionId}`, undefined); // 바디 없이 요청
};

/**
 * 특정 상담 세션을 삭제하는 API 함수입니다.
 * DELETE /counsels/{couns_id}
 *
 * @param {string} sessionId - 삭제할 상담 세션의 ID
 * @returns {Promise<void>}
 */
export const deleteCounselingSession = async (sessionId: string): Promise<void> => {
  if (!sessionId) throw new Error('Session ID is required to delete the session.');
  return apiClient.delete(`/counsels/${sessionId}`);
};

/**
 * 특정 상담 세션에 채팅 메시지를 전송하는 API 함수입니다.
 * POST /counsels/{couns_id}
 * API 명세서에는 { "type":"voice" or "text", "content":"안녕하세요" } 형태로 요청 바디가 명시되어 있습니다.
 *
 * @param {string} sessionId - 메시지를 전송할 상담 세션의 ID
 * @param {{ type: 'voice' | 'text'; content: string }} messageData - 전송할 메시지 데이터
 * @returns {Promise<ChatMessage>} 서버에서 생성/처리된 메시지 객체 (AI 응답이 아닌, 사용자가 보낸 메시지에 대한 서버의 확인 응답일 수 있음)
 */
export const sendChatMessageToServer = async (
  sessionId: string,
  messageData: { type: 'voice' | 'text'; content: string }
): Promise<ChatMessage> => {
  // 실제 응답 타입은 AI 응답을 포함할 수도, 단순 성공 여부일 수도 있음. 명세 확인 필요.
  if (!sessionId) throw new Error('Session ID is required to send a message.');
  return apiClient.post<
    { type: 'voice' | 'text'; content: string },
    ChatMessage // 임시로 ChatMessage로 지정. 실제 서버 응답에 맞춰야 함.
  >(`/counsels/${sessionId}`, messageData);
};
