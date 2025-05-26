/**
 * @file entities/counseling/model/api.ts
 * 상담(Counseling) 엔티티 관련 API 호출 함수들을 정의합니다.
 * 이 함수들은 Tanstack Query의 queryFn 또는 mutationFn으로 사용될 수 있습니다.
 * FSD 아키텍처에 따라 `entities` 레이어의 `counseling` 슬라이스 내 `model`에 위치합니다.
 */
import { apiClient } from '@/shared/api/axiosInstance';
import { CounselingSession, ChatMessage, MessageType } from './types';
import { type ApiResponse } from '@/shared/types/api'; // ApiResponse 타입 임포트

// TypeScript 타입 정의로 변경
export type FetchPastCounselingSessionsParams = {
  page?: number;
  limit?: number;
  isClosed?: boolean; // is_closed 대신 isClosed 사용
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
  if (typeof params?.isClosed === 'boolean') queryParams.append('isClosed', params.isClosed.toString());

  const endpoint = `/counsels${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const sessions = await apiClient.get<CounselingSession[]>(endpoint);

  // 각 세션에 대해 레포트 발행 여부 필드를 초기화합니다.
  // 실제 값은 CounselingSessionCard.tsx 등에서 비동기적으로 확인 후 업데이트해야 합니다.
  // 또는 백엔드에서 이 정보를 함께 내려주는 것이 가장 좋습니다.
  return sessions.map((session) => ({
    ...session,
    hasSessionReport: false, // 임시 초기값
    hasPeriodReport: false, // 임시 초기값
  }));
};

export interface CounselingSessionWithMessages {
  /** 상담 세션 정보. API 응답에 따라 이 필드명이 sessionInfo 등이 될 수 있음 */
  session: CounselingSession; // 실제 API 응답 구조에 맞게 키 이름 확인 필요 (예: counselingData, sessionDetails 등)
  /** 해당 상담 세션의 메시지 목록. API 응답에 따라 이 필드명이 chatHistory 등이 될 수 있음 */
  messages: ChatMessage[];
}

/**
 * 특정 상담 세션의 상세 정보 및 메시지 목록을 가져오는 API 함수입니다.
 * GET /counsels/{counsId}
 * API 명세서에 따르면 "개별 상담 세션 진입, 상담 채팅 내역 보기"를 수행합니다.
 *
 * @param {string} counsId - 조회할 상담 세션의 ID
 * @param {{ page?: number; limit?: number }} [messageParams] - 메시지 페이지네이션 파라미터 (필요시 API 명세 확인)
 * @returns {Promise<CounselingSessionWithMessages>} 해당 상담 세션 정보 및 메시지 목록
 */
export const fetchCounselingSessionDetails = async (
  counsId: string
  // messageParams?: { page?: number; limit?: number } // 현재 API에서는 사용되지 않음
): Promise<CounselingSession> => {
  if (!counsId) throw new Error('Counseling ID (counsId) is required to fetch session details.');

  const endpoint = `/counsels/${counsId}`;
  // API는 CounselingDto (CounselingSession과 유사)를 직접 반환
  const sessionData = await apiClient.get<CounselingSession>(endpoint);

  // messageList 필드가 없을 경우를 대비하여 기본값 제공 (타입상으로는 필수 필드임)
  if (sessionData && typeof sessionData.messageList === 'undefined') {
    // sessionData가 null이 아닌지도 확인
    sessionData.messageList = [];
  }

  // console.log('fetchCounselingSessionDetails API responseData (processed):', sessionData);
  return sessionData;
};

// 사용자 ID는 JWT 토큰에서 추출하므로 요청 바디에서 userId 제거
export type CreateCounselingSessionPayload = {
  counsTitle?: string;
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
  // 사용자 ID는 JWT로 전달되므로, payload에서 userId 관련 로직 제거
  return apiClient.post<CreateCounselingSessionPayload | undefined, CounselingSession>('/counsels', payload);
};

/**
 * 특정 상담 세션을 종료하는 API 함수입니다. (isClosed = true로 업데이트는 백엔드에서 처리)
 * POST /counsels/{counsId}
 * 요청 바디는 필요 없으며, JWT 인증 토큰과 경로 파라미터의 counsId를 사용합니다.
 *
 * @param {string} counsId - 종료할 상담 세션의 ID
 * @returns {Promise<void>} 성공 여부 (백엔드 응답에 따라 수정 가능, 예: 업데이트된 CounselingSession)
 */
export const closeCounselingSession = async (counsId: string): Promise<void> => {
  if (!counsId) throw new Error('Counseling ID (counsId) is required to close the session.');
  const endpoint = `/counsels/${counsId}`;
  // 요청 바디 불필요, isClosed 설정은 백엔드 담당
  // 백엔드가 업데이트된 세션 정보를 반환하지 않는다고 가정하고 Promise<void>로 변경
  return apiClient.post<undefined, void>(endpoint, undefined);
};

/**
 * 특정 상담 세션을 삭제하는 API 함수입니다.
 * DELETE /counsels/{counsId}
 *
 * @param {string} counsId - 삭제할 상담 세션의 ID
 * @returns {Promise<void>}
 */
export const deleteCounselingSession = async (counsId: string): Promise<void> => {
  if (!counsId) throw new Error('Counseling ID (counsId) is required to delete the session.');
  const endpoint = `/counsels/${counsId}`;
  return apiClient.delete(endpoint);
};

export type UpdateCounselingTitlePayload = {
  counsTitle: string;
};

/**
 * 특정 상담 세션의 제목을 수정하는 API 함수입니다.
 * PATCH /counsels/{counsId}
 *
 * @param {string} counsId - 제목을 수정할 상담 세션의 ID
 * @param {UpdateCounselingTitlePayload} payload - 변경할 제목 정보
 * @returns {Promise<CounselingSession>} 수정된 상담 세션 정보
 */
export const updateCounselingTitle = async (
  counsId: string,
  payload: UpdateCounselingTitlePayload
): Promise<CounselingSession> => {
  if (!counsId) throw new Error('Counseling ID (counsId) is required to update the title.');
  if (!payload || !payload.counsTitle) throw new Error('New title (counsTitle) is required.');

  const endpoint = `/counsels/${counsId}`;
  return apiClient.patch<UpdateCounselingTitlePayload, CounselingSession>(endpoint, payload);
};

export type CreateSessionReportResponse = {
  reportId: string; // ERD `session_report.s_report_id` (INT) 와 타입 일치 필요, 여기서는 string으로 가정
  message?: string; // 성공 또는 정보 메시지 (옵션)
};

/**
 * 특정 상담 세션에 대한 개별 레포트를 발행하는 API 함수입니다.
 * POST /counsels/{counsId}/reports
 *
 * @param {string} counsId - 레포트를 발행할 상담 세션의 ID
 * @returns {Promise<CreateSessionReportResponse>} 발행된 레포트 정보
 */
export const createSessionReport = async (counsId: string): Promise<CreateSessionReportResponse> => {
  if (!counsId) throw new Error('Counseling ID (counsId) is required to create a session report.');

  const endpoint = `/counsels/${counsId}/reports`;
  // 이 API는 요청 바디가 필요 없을 수 있습니다 (서버에서 해당 세션 정보로 자동 생성).
  // 응답 타입도 실제 백엔드 명세에 따라 달라질 수 있습니다 (예: 생성된 Report 객체 전체 또는 reportId만).
  return apiClient.post<undefined, CreateSessionReportResponse>(endpoint, undefined);
};

/**
 * 지정된 상담 세션에 대한 레포트를 생성하고 해당 세션을 종료합니다.
 *
 * @param {string} counsId - 레포트를 생성하고 종료할 상담 세션의 ID.
 * @returns {Promise<{ sreportId: number }>} 성공 시 생성된 레포트 ID를 포함하는 객체를 반환합니다.
 * @throws {Error} API 요청 실패 시 에러를 발생시킵니다.
 */
export const createReportAndEndSession = async (counsId: string): Promise<{ sreportId: number }> => {
  if (!counsId) {
    throw new Error('레포트 생성 및 세션 종료를 위한 상담 ID가 제공되지 않았습니다.');
  }
  const endpoint = `/counsels/${counsId}/reports`;
  // console.log(`API 요청: POST ${endpoint}`);
  // apiClient.post<TRequest, TResponse>(url, data)
  // TRequest (요청 본문 타입)는 undefined, TResponse (응답 본문 타입)는 { sreportId: number }
  // data (요청 본문 값)는 undefined
  // apiClient.post는 응답 인터셉터에 의해 Promise<TResponse> (즉, Promise<{ sreportId: number }>)를 반환합니다.
  const responseData = await apiClient.post<undefined, { sreportId: number }>(endpoint, undefined);
  // console.log('createReportAndEndSession API responseData:', responseData);
  return responseData;
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

// --- Helper functions to check report existence (Ideally should be in report entity) ---

/**
 * @typedef {object} ReportListItem - 레포트 목록 아이템
 * @property {number} [counsId] - (세션 레포트용) 관련 상담 ID
 * @property {string} createdAt - 생성 일시
 * @property {number} [sreportId] - (세션 레포트용) 세션 레포트 ID
 * @property {string} [sreportTitle] - (세션 레포트용) 세션 레포트 제목
 * @property {string} [startDate] - (기간별 레포트용) 시작일
 * @property {string} [endDate] - (기간별 레포트용) 종료일
 * @property {number} [preportId] - (기간별 레포트용) 기간별 레포트 ID
 * @property {string} [preportTitle] - (기간별 레포트용) 기간별 레포트 제목
 */
type ReportListItem = {
  counsId?: number;
  createdAt: string;
  sreportId?: number;
  sreportTitle?: string;
  startDate?: string;
  endDate?: string;
  preportId?: number;
  preportTitle?: string;
};

/**
 * 특정 상담 세션에 대한 세션 레포트가 존재하는지 확인합니다.
 * GET /reports?category=session
 * @param {number} counsId - 확인할 상담 세션의 ID
 * @returns {Promise<boolean>} 세션 레포트 존재 여부
 */
export const checkSessionReportExists = async (counsId: number): Promise<boolean> => {
  if (!counsId) return false;
  try {
    // API 응답 타입을 ReportListItem 배열로 지정합니다.
    const response = await apiClient.get<ReportListItem[]>(`/reports?category=session`);
    // 응답 데이터가 배열이고, 그 안에 counsId가 일치하는 항목이 있는지 확인합니다.
    return Array.isArray(response) && response.some((report) => report.counsId === counsId);
  } catch (error) {
    console.error(`Error checking session report for counsId ${counsId}:`, error);
    return false; // 에러 발생 시 false 반환
  }
};

/**
 * 특정 상담 세션과 관련된 기간별 레포트가 존재하는지 확인합니다.
 * GET /reports?category=period
 * 중요: 현재 API 명세로는 기간별 레포트와 특정 상담 세션을 직접 연결할 수 없습니다.
 * 이 함수는 counsId를 사용하지 않으며, 실제 로직은 백엔드 API 변경 또는 추가 정보가 필요합니다.
 * 여기서는 임시로 항상 false를 반환하도록 합니다.
 * @param {number} counsId - 확인할 상담 세션의 ID (현재 사용되지 않음)
 * @returns {Promise<boolean>} 기간별 레포트 존재 여부 (현재 항상 false)
 */
export const checkPeriodReportExistsForSession = async (counsId: number): Promise<boolean> => {
  // counsId를 사용하지 않음을 명시 (ESLint 경고 방지)
  console.warn(
    'checkPeriodReportExistsForSession called with counsId ' +
      counsId +
      ', but current API cannot link period reports to specific sessions directly.'
  );
  try {
    // 참고: 이 API 호출은 특정 세션과 직접 연결되지 않습니다.
    // 실제로는 이 API 응답을 바탕으로 해당 counsId와 관련된 기간별 레포트가 있는지 판별하는 로직이 필요합니다.
    // 예를 들어, 기간별 레포트가 특정 기간 내의 모든 상담을 포함한다면,
    // 해당 counsId의 상담이 그 기간에 포함되는지 등을 확인해야 합니다.
    // 현재는 API 명세만으로는 구현이 불가능하여 false를 반환합니다.
    // const response = await apiClient.get<ReportListItem[]>(`/reports?category=period`);
    // console.log('Period reports fetched (not linked to specific session):', response);
    return false; // 임시로 항상 false 반환
  } catch (error) {
    console.error(`Error checking period report (not linked to counsId ${counsId}):`, error);
    return false;
  }
};
