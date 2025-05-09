/**
 * @file features/counseling/model/hooks.ts
 * 상담(Counseling) 기능 관련 Tanstack Query 훅들을 정의합니다.
 * 이 훅들은 `entities/counseling/model/api.ts`의 API 함수들을 사용하여
 * 서버 데이터 관리(캐싱, 동기화, 업데이트 등)를 수행합니다.
 * FSD 아키텍처에 따라 `features` 레이어의 `counseling` 슬라이스 내 `model`에 위치합니다.
 */
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  fetchPastCounselingSessions,
  fetchCounselingMessages,
  createCounselingSession as apiCreateCounselingSession, // 이름 충돌 방지
  closeCounselingSession as apiCloseCounselingSession,
  deleteCounselingSession as apiDeleteCounselingSession,
  sendChatMessageToServer as apiSendChatMessageToServer,
} from '@/entities/counseling/model/api';
import { CounselingSession, ChatMessage, CounselingStatus } from '@/entities/counseling/model/types';
import { useCounselingStore } from './counselingStore'; // Zustand 스토어 임포트

// --- Query Keys ---
// Tanstack Query에서 캐시 관리를 위해 사용되는 고유 키
const counselingQueryKeys = {
  all: ['counseling'] as const, // 상담 관련 모든 쿼리의 기본 접두사
  lists: () => [...counselingQueryKeys.all, 'list'] as const, // 전체 목록
  list: (filters: { page?: number; limit?: number; status?: CounselingStatus } = {}) =>
    [...counselingQueryKeys.lists(), filters] as const, // 필터링된 목록
  details: () => [...counselingQueryKeys.all, 'detail'] as const, // 개별 상세 정보
  detail: (id: string | undefined) => [...counselingQueryKeys.details(), id] as const, // 특정 ID의 상세 정보
  messages: (id: string | undefined, filters: { page?: number; limit?: number } = {}) =>
    [...counselingQueryKeys.detail(id), 'messages', filters] as const, // 특정 세션의 메시지 목록
};

// --- Query Hooks ---

/**
 * 지난 상담 세션 목록을 조회하는 useQuery 훅입니다.
 *
 * @param {{ page?: number; limit?: number; status?: CounselingStatus }} [filters] - 목록 필터링 옵션
 * @param {object} [options] - Tanstack Query `useQuery` 옵션
 * @returns Tanstack Query의 useQueryResult 객체 (CounselingSession[] 데이터 포함)
 */
export const usePastCounselingSessionsQuery = (
  filters?: { page?: number; limit?: number; status?: CounselingStatus },
  options?: Omit<UseQueryOptions<CounselingSession[], Error, CounselingSession[], QueryKey>, 'queryKey' | 'queryFn'>
) => {
  const queryKey = counselingQueryKeys.list(filters);
  return useQuery<CounselingSession[], Error, CounselingSession[], QueryKey>({
    queryKey,
    queryFn: () => fetchPastCounselingSessions(filters),
    staleTime: 1000 * 60 * 5, // 5분 동안 stale 상태로 유지
    ...options,
  });
};

/**
 * 특정 상담 세션의 메시지 목록을 조회하는 useQuery 훅입니다.
 *
 * @param {string | undefined} sessionId - 조회할 상담 세션 ID (undefined이면 쿼리 비활성화)
 * @param {{ page?: number; limit?: number }} [filters] - 메시지 목록 필터링/페이지네이션 옵션
 * @param {object} [options] - Tanstack Query `useQuery` 옵션
 * @returns Tanstack Query의 useQueryResult 객체 (ChatMessage[] 데이터 포함)
 */
export const useCounselingMessagesQuery = (
  sessionId: string | undefined,
  filters?: { page?: number; limit?: number },
  options?: Omit<
    UseQueryOptions<ChatMessage[], Error, ChatMessage[], QueryKey>,
    'queryKey' | 'queryFn' | 'enabled' // onSuccess 제거
  >
) => {
  const queryKey = counselingQueryKeys.messages(sessionId, filters);
  // const { setMessages } = useCounselingStore(); // 데이터를 스토어에 동기화하는 로직은 컴포넌트 레벨에서 useEffect 사용 고려

  return useQuery<ChatMessage[], Error, ChatMessage[], QueryKey>({
    queryKey,
    queryFn: () => {
      if (!sessionId) return Promise.resolve([]); // sessionId 없으면 빈 배열 반환
      return fetchCounselingMessages(sessionId, filters);
    },
    enabled: !!sessionId, // sessionId가 있을 때만 쿼리 활성화
    staleTime: 1000 * 60 * 1, // 1분 동안 stale 상태로 유지
    // onSuccess: (data: ChatMessage[]) => { // v5에서는 onSuccess를 이렇게 직접 사용하지 않는 것이 일반적
    //   console.log('Fetched messages:', data);
    //   // setMessages(data);
    // },
    ...options,
  });
};

// --- Mutation Hooks ---

/**
 * 새 상담 세션을 생성하는 useMutation 훅입니다.
 *
 * @param {object} [options] - Tanstack Query `useMutation` 옵션
 * @returns Tanstack Query의 useMutationResult 객체
 */
export const useCreateCounselingSessionMutation = (
  options?: Omit<
    UseMutationOptions<CounselingSession, Error, { userId: string; initialContext?: Record<string, any> }>,
    'mutationFn' // onSuccess는 내부에서 정의하므로 외부 options에서 제외할 필요 없음
  >
) => {
  const queryClient = useQueryClient();
  const { setCurrentSessionId, resetCounselingState, setCurrentSessionStatus } = useCounselingStore();

  return useMutation<CounselingSession, Error, { userId: string; initialContext?: Record<string, any> }>({
    mutationFn: apiCreateCounselingSession,
    onSuccess: (newSession: CounselingSession) => {
      queryClient.invalidateQueries({ queryKey: counselingQueryKeys.lists() });
      resetCounselingState();
      setCurrentSessionId(newSession.id);
      setCurrentSessionStatus(newSession.status || CounselingStatus.ACTIVE);
      // TODO: 웹소켓 연결 시작 로직 호출 (useWebSocket 훅 사용)
    },
    ...options,
  });
};

/**
 * 상담 메시지를 서버로 전송하는 useMutation 훅입니다.
 * (주의: 이 훅은 사용자가 보낸 메시지를 서버에 '기록'하는 용도입니다.
 *  AI의 응답은 웹소켓을 통해 별도로 수신되어 Zustand 스토어에 추가됩니다.)
 *
 * @param {object} [options] - Tanstack Query `useMutation` 옵션
 * @returns Tanstack Query의 useMutationResult 객체
 */
export const useSendChatMessageMutation = (
  options?: Omit<UseMutationOptions<ChatMessage, Error, { type: 'voice' | 'text'; content: string }>, 'mutationFn'>
) => {
  const currentSessionId = useCounselingStore((state) => state.currentSessionId);

  return useMutation<ChatMessage, Error, { type: 'voice' | 'text'; content: string }>({
    mutationFn: (messageData) => {
      if (!currentSessionId) throw new Error('활성화된 상담 세션이 없습니다.');
      return apiSendChatMessageToServer(currentSessionId, messageData);
    },
    onSuccess: (sentMessage: ChatMessage) => {
      console.log('Message sent to server:', sentMessage);
      // 필요시 해당 세션의 메시지 목록 쿼리 무효화 (하지만 웹소켓으로 실시간 업데이트되므로 불필요할 수 있음)
      // queryClient.invalidateQueries({ queryKey: counselingQueryKeys.messages(currentSessionId) });
    },
    ...options,
  });
};

/**
 * 상담 세션을 종료하는 useMutation 훅입니다.
 *
 * @param {object} [options] - Tanstack Query `useMutation` 옵션
 * @returns Tanstack Query의 useMutationResult 객체
 */
export const useCloseCounselingSessionMutation = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const { setCurrentSessionStatus } = useCounselingStore();

  return useMutation<void, Error, string>({
    mutationFn: apiCloseCounselingSession,
    onSuccess: (_data: void, sessionId: string) => {
      queryClient.invalidateQueries({ queryKey: counselingQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: counselingQueryKeys.detail(sessionId) });
      setCurrentSessionStatus(CounselingStatus.ENDED);
      // 웹소켓 연결도 종료하거나 상태 변경
      // setWebsocketStatus('disconnected');
    },
    ...options,
  });
};

/**
 * 상담 세션을 삭제하는 useMutation 훅입니다.
 *
 * @param {object} [options] - Tanstack Query `useMutation` 옵션
 * @returns Tanstack Query의 useMutationResult 객체
 */
export const useDeleteCounselingSessionMutation = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const { resetCounselingState } = useCounselingStore();

  return useMutation<void, Error, string>({
    mutationFn: apiDeleteCounselingSession,
    onSuccess: (_data: void, sessionId: string) => {
      queryClient.invalidateQueries({ queryKey: counselingQueryKeys.lists() });
      queryClient.removeQueries({ queryKey: counselingQueryKeys.detail(sessionId) }); // 캐시에서 해당 세션 상세 정보 직접 제거
      queryClient.removeQueries({ queryKey: counselingQueryKeys.messages(sessionId) }); // 캐시에서 해당 세션 메시지 직접 제거
      resetCounselingState(); // 관련 Zustand 스토어 상태 초기화
    },
    ...options,
  });
};
