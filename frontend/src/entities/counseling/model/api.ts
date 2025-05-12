/**
 * @file entities/counseling/model/api.ts
 * 상담(Counseling) 엔티티 관련 API 호출 함수들을 정의합니다.
 * 이 함수들은 Tanstack Query의 queryFn 또는 mutationFn으로 사용될 수 있습니다.
 * FSD 아키텍처에 따라 `entities` 레이어의 `counseling` 슬라이스 내 `model`에 위치합니다.
 */
import { apiClient } from '@/shared/api'; // API 클라이언트 임포트
import { CounselingSession, ChatMessage, MessageType } from './types';

// TypeScript 타입 정의로 변경
export type FetchPastCounselingSessionsParams = {
  page?: number;
  limit?: number;
  is_closed?: boolean; // status 대신 is_closed 사용
};

/**
 * 지난 상담 세션 목록을 가져오는 API 함수입니다.
 * GET /counsels
 *
 * @param {FetchPastCounselingSessionsParams} [params] - 요청 파라미터
 * @returns {Promise<CounselingSession[]>} 상담 세션 목록
 */
export const fetchPastCounselingSessions = async (
  params?: FetchPastCounselingSessionsParams
): Promise<CounselingSession[]> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (typeof params?.is_closed === 'boolean') queryParams.append('is_closed', params.is_closed.toString());

  const endpoint = `/counsels${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return apiClient.get<CounselingSession[]>(endpoint);
};

export interface CounselingSessionWithMessages {
  /** 상담 세션 정보. API 응답에 따라 이 필드명이 sessionInfo 등이 될 수 있음 */
  session: CounselingSession; // 실제 API 응답 구조에 맞게 키 이름 확인 필요 (예: counselingData, sessionDetails 등)
  /** 해당 상담 세션의 메시지 목록. API 응답에 따라 이 필드명이 chatHistory 등이 될 수 있음 */
  messages: ChatMessage[];
}

/**
 * 특정 상담 세션의 상세 정보 및 메시지 목록을 가져오는 API 함수입니다.
 * GET /counsels/{couns_id}
 * API 명세서에 따르면 "개별 상담 세션 진입, 상담 채팅 내역 보기"를 수행합니다.
 *
 * @param {string} couns_id - 조회할 상담 세션의 ID
 * @param {{ page?: number; limit?: number }} [messageParams] - 메시지 페이지네이션 파라미터 (필요시 API 명세 확인)
 * @returns {Promise<CounselingSessionWithMessages>} 해당 상담 세션 정보 및 메시지 목록
 */
export const fetchCounselingSessionDetails = async (
  couns_id: string,
  messageParams?: { page?: number; limit?: number }
): Promise<CounselingSessionWithMessages> => {
  if (!couns_id) throw new Error('Counseling ID (couns_id) is required to fetch session details.');

  const queryParams = new URLSearchParams();
  if (messageParams?.page) queryParams.append('page', messageParams.page.toString());
  if (messageParams?.limit) queryParams.append('limit', messageParams.limit.toString());

  const endpoint = `/counsels/${couns_id}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  // API 응답이 세션 정보와 메시지를 함께 포함한다고 가정합니다.
  // 실제 API 응답 구조에 따라 TResponse 타입을 정확히 명시해야 합니다.
  // 예를 들어, 백엔드가 { counselingSession: {...}, messages: [...] } 형태로 반환한다면 그에 맞게 수정합니다.
  // 우선은 CounselingSession 타입 내에 messages 필드가 있거나, 별도 필드로 온다고 가정하고 아래와 같이 구성합니다.
  // 여기서는 API 명세서의 설명을 바탕으로 세션 정보와 메시지 목록을 함께 받는다고 가정합니다.
  return apiClient.get<CounselingSessionWithMessages>(endpoint);
  // 만약 API가 CounselingSession 객체 안에 messages: ChatMessage[]를 포함하여 반환한다면,
  // 반환 타입을 Promise<CounselingSession>으로 하고, CounselingSession 인터페이스에 messages?: ChatMessage[] 를 추가해야 합니다.
  // 현재는 명확한 분리를 위해 CounselingSessionWithMessages 타입을 사용합니다.
};

// 사용자 ID는 JWT 토큰에서 추출하므로 요청 바디에서 user_id 제거
export type CreateCounselingSessionPayload = {
  couns_title?: string;
  initialContext?: Record<string, any>;
};

/**
 * 새로운 상담 세션을 생성하는 API 함수입니다.
 * POST /counsels
 * 한 세션당 대화 제한: "20토큰 / 토큰당 500자제한"
 * 사용자 ID는 JWT 인증 토큰을 통해 서버에서 식별합니다.
 *
 * @param {CreateCounselingSessionPayload} [payload] - 새 상담 생성 시 전달할 선택적 데이터 (예: 상담 제목)
 * @returns {Promise<CounselingSession>} 생성된 상담 세션 정보
 */
export const createCounselingSession = async (
  payload?: CreateCounselingSessionPayload // 요청 바디는 선택 사항
): Promise<CounselingSession> => {
  // 사용자 ID는 JWT로 전달되므로, payload에서 user_id 관련 로직 제거
  return apiClient.post<CreateCounselingSessionPayload | undefined, CounselingSession>('/counsels', payload);
};

/**
 * 특정 상담 세션을 종료하는 API 함수입니다. (is_closed = true로 업데이트는 백엔드에서 처리)
 * POST /counsels/{couns_id}
 * 요청 바디는 필요 없으며, JWT 인증 토큰과 경로 파라미터의 couns_id를 사용합니다.
 *
 * @param {string} couns_id - 종료할 상담 세션의 ID
 * @returns {Promise<void>} 성공 여부 (백엔드 응답에 따라 수정 가능, 예: 업데이트된 CounselingSession)
 */
export const closeCounselingSession = async (couns_id: string): Promise<void> => {
  if (!couns_id) throw new Error('Counseling ID (couns_id) is required to close the session.');
  const endpoint = `/counsels/${couns_id}`;
  // 요청 바디 불필요, is_closed 설정은 백엔드 담당
  // 백엔드가 업데이트된 세션 정보를 반환하지 않는다고 가정하고 Promise<void>로 변경
  return apiClient.post<undefined, void>(endpoint, undefined);
};

/**
 * 특정 상담 세션을 삭제하는 API 함수입니다.
 * DELETE /counsels/{couns_id}
 *
 * @param {string} couns_id - 삭제할 상담 세션의 ID
 * @returns {Promise<void>}
 */
export const deleteCounselingSession = async (couns_id: string): Promise<void> => {
  if (!couns_id) throw new Error('Counseling ID (couns_id) is required to delete the session.');
  const endpoint = `/counsels/${couns_id}`;
  return apiClient.delete(endpoint);
};

export type UpdateCounselingTitlePayload = {
  couns_title: string;
};

/**
 * 특정 상담 세션의 제목을 수정하는 API 함수입니다.
 * PATCH /counsels/{couns_id}
 *
 * @param {string} couns_id - 제목을 수정할 상담 세션의 ID
 * @param {UpdateCounselingTitlePayload} payload - 변경할 제목 정보
 * @returns {Promise<CounselingSession>} 수정된 상담 세션 정보
 */
export const updateCounselingTitle = async (
  couns_id: string,
  payload: UpdateCounselingTitlePayload
): Promise<CounselingSession> => {
  if (!couns_id) throw new Error('Counseling ID (couns_id) is required to update the title.');
  if (!payload || !payload.couns_title) throw new Error('New title (couns_title) is required.');

  const endpoint = `/counsels/${couns_id}`;
  return apiClient.patch<UpdateCounselingTitlePayload, CounselingSession>(endpoint, payload);
};

export type CreateSessionReportResponse = {
  report_id: string; // ERD `session_report.s_report_id` (INT) 와 타입 일치 필요, 여기서는 string으로 가정
  message?: string; // 성공 또는 정보 메시지 (옵션)
};

/**
 * 특정 상담 세션에 대한 개별 레포트를 발행하는 API 함수입니다.
 * POST /counsels/{couns_id}/reports
 *
 * @param {string} couns_id - 레포트를 발행할 상담 세션의 ID
 * @returns {Promise<CreateSessionReportResponse>} 발행된 레포트 정보
 */
export const createSessionReport = async (couns_id: string): Promise<CreateSessionReportResponse> => {
  if (!couns_id) throw new Error('Counseling ID (couns_id) is required to create a session report.');

  const endpoint = `/counsels/${couns_id}/reports`;
  // 이 API는 요청 바디가 필요 없을 수 있습니다 (서버에서 해당 세션 정보로 자동 생성).
  // 응답 타입도 실제 백엔드 명세에 따라 달라질 수 있습니다 (예: 생성된 Report 객체 전체 또는 report_id만).
  return apiClient.post<undefined, CreateSessionReportResponse>(endpoint, undefined);
};

// sendChatMessageToServer 함수는 웹소켓으로 대체되므로 여기서는 주석 처리 또는 삭제합니다.
/*
// 웹소켓 통신으로 대체된 기존 HTTP 채팅 메시지 전송 함수
export const sendChatMessageToServer = async (
  couns_id: string,
  messageData: { type: MessageType.TEXT | MessageType.VOICE; content: string }
): Promise<ChatMessage> => {
  if (!couns_id) throw new Error('Counseling ID (couns_id) is required to send a message.');
  // 웹소켓으로 변경되었으므로 이 함수는 사용되지 않습니다.
  // 만약 HTTP fallback 등이 필요하다면 다르게 구현해야 합니다.
  const endpoint = `/counsels/${couns_id}/chat`; // 경로도 웹소켓 경로와 다름
  return apiClient.post<
    { type: MessageType.TEXT | MessageType.VOICE; content: string },
    ChatMessage
  >(endpoint, messageData);
};
*/
