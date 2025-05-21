'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import { useAuthStore } from '@/app/store/authStore';
import { useFetchCounselingSessionDetail, counselingQueryKeys } from '@/entities/counseling/model/queries';
import { useWebSocket, type StompSendUserMessagePayload } from '@/features/counseling/hooks/useWebSocket';
import {
  useCloseCounselingSession,
  useCreateReportAndEndSession,
  useDeleteCounselingSession,
} from '@/entities/counseling/model/mutations';
import type { ChatMessage } from '@/entities/counseling/model/types';
import type { CounselingSession } from '@/entities/counseling/model/types';

import EditCounselingTitleButton from '@/features/counseling/ui/EditCounselingTitleButton';
import EndCounselingButton from '@/features/counseling/ui/EndCounselingButton';
import CreateSessionReportButton from '@/features/counseling/ui/CreateSessionReportButton';
import SendMessageForm from '@/features/counseling/ui/SendMessageForm';
import ChatMessageList from '@/widgets/ChatMessageList/ui/ChatMessageList';

import { Card, CardHeader, CardContent, CardFooter } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Terminal, AlertCircle, AlertTriangle, HelpCircle, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import BackButton from '@/shared/ui/BackButton';
import SessionEndModal from '@/features/counseling/ui/SessionEndModal';
import { useSTTStore } from '@/features/counseling/model/sttStore';

/** @constant {number} AUTO_SESSION_END_TIMEOUT - 사용자의 비활성 상태가 지속될 경우 자동으로 세션을 종료하는 시간 (밀리초 단위, 현재 10분). */
const AUTO_SESSION_END_TIMEOUT = 10 * 60 * 1000;

/**
 * @interface CounselingChatWindowProps
 * @description CounselingChatWindow 컴포넌트에 전달될 props 타입을 정의합니다. (현재는 props를 직접 받지 않습니다)
 */
// interface CounselingChatWindowProps {}

/**
 * @component CounselingChatWindow
 * @description AI 상담 채팅 화면의 메인 인터페이스를 구성하는 위젯 컴포넌트입니다.
 *              상담 제목 표시 및 수정, 상담 종료, 보고서 생성 버튼, 채팅 메시지 목록, 메시지 입력 폼을 포함합니다.
 *              URL 파라미터로부터 상담 ID(`couns_id`)를 받아 해당 세션의 데이터를 로드하고 웹소켓 연결을 관리합니다.
 *              또한, 사용자의 비활성 상태를 감지하여 자동으로 세션을 종료하는 기능도 포함합니다.
 * @returns {JSX.Element} CounselingChatWindow 컴포넌트의 JSX 요소.
 */
export function CounselingChatWindow() {
  // --- Core Hooks & State ---
  /** @state {string | undefined} couns_id - 현재 URL에서 추출한 상담 세션 ID. */
  const params = useParams();
  const couns_id_param = params.couns_id;
  const couns_id = Array.isArray(couns_id_param) ? couns_id_param[0] : couns_id_param;

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { token } = useAuthStore(); // Zustand 스토어에서 사용자 인증 토큰을 가져옵니다.
  const { resetSTTState } = useSTTStore(); // resetSTTState 액션 가져오기

  /** @ref {HTMLDivElement | null} chatContainerRef - 채팅 메시지 목록을 포함하는 CardContent 요소에 대한 ref. 스크롤 제어에 사용됩니다. */
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Zustand 스토어에서 상담 관련 상태 및 액션들을 가져옵니다.
  const {
    setCurrentSessionId, // 현재 활성화된 상담 세션 ID를 스토어에 설정하는 함수.
    setMessages, // 현재 세션의 메시지 목록을 스토어에 설정하는 함수.
    setIsCurrentSessionClosed, // 현재 세션의 종료 상태를 스토어에 설정하는 함수.
    currentSessionId, // 스토어에 저장된 현재 상담 세션 ID.
    messages, // 스토어에 저장된 현재 세션의 메시지 목록.
    isAiTyping, // AI가 현재 타이핑 중인지 여부.
    isCurrentSessionClosed: storeIsCurrentSessionClosed, // 스토어에 저장된 현재 세션의 종료 상태.
    lastUserActivityTime, // 현재 세션에서 마지막 사용자 활동 시간 (타임스탬프).
    setLastUserActivityTime, // 마지막 사용자 활동 시간을 스토어에 설정하는 함수.
    setIsAiTyping, // AI 타이핑 상태를 스토어에 설정하는 함수.
  } = useCounselingStore();

  /** @ref {NodeJS.Timeout | null} autoEndTimerRef - 자동 세션 종료를 위한 타이머 ID를 저장하는 ref. */
  const autoEndTimerRef = useRef<NodeJS.Timeout | null>(null);

  /** @state {boolean} isSessionEndModalOpen - 세션 종료 확인 모달 표시 여부. */
  const [isSessionEndModalOpen, setIsSessionEndModalOpen] = useState(false);

  /**
   * @function handleAuthError
   * @description 인증 관련 오류(예: 토큰 만료) 발생 시 로그인 페이지로 리디렉션하는 콜백 함수.
   */
  const handleAuthError = useCallback(() => {
    router.push('/login');
  }, [router]);

  // --- Data Fetching (Tanstack Query) ---
  /**
   * @query useFetchCounselingSessionDetail
   * @description 현재 `couns_id`에 해당하는 상담 세션의 상세 정보(세션 정보 및 메시지 목록 포함)를 서버로부터 조회합니다.
   *              `couns_id` 또는 `token`이 없을 경우 쿼리는 실행되지 않습니다.
   * @property {object | undefined} sessionDetail - 조회된 상담 세션 상세 데이터.
   * @property {boolean} isLoading - 데이터 로딩 중 상태.
   * @property {boolean} isError - 데이터 로딩 중 에러 발생 상태.
   * @property {Error | null} error - 발생한 에러 객체.
   */
  const {
    data: sessionDetail,
    isLoading,
    isError,
    error,
  } = useFetchCounselingSessionDetail(couns_id || '', {
    staleTime: 0, // 5 * 60 * 1000, // 5분 동안 캐시된 데이터를 최신으로 간주.
    gcTime: 10 * 60 * 1000, // 10분 동안 사용되지 않은 캐시 데이터는 제거.
    enabled: !!couns_id && !!token, // `couns_id`와 `token`이 모두 유효할 때만 쿼리 실행.
  });

  // --- Zustand Store Synchronization Effects ---
  /**
   * @effect URL의 `couns_id` 변경 감지 및 Zustand 스토어 (`currentSessionId`, `isCurrentSessionClosed`, `lastUserActivityTime`) 업데이트.
   *        - 새로운 `couns_id`로 변경되면, 스토어의 현재 세션 ID를 업데이트하고, 세션 종료 상태를 `false`로, 마지막 활동 시간을 현재로 초기화합니다.
   *        - 같은 `couns_id`로 돌아오거나 새로고침된 경우, 스토어의 세션 ID가 없다면 설정하고, 마지막 활동 시간이 없다면 현재로 설정합니다.
   */
  useEffect(() => {
    if (couns_id && couns_id !== currentSessionId) {
      // 다른 상담 세션으로 이동한 경우
      setCurrentSessionId(couns_id);
      setIsCurrentSessionClosed(false); // 새 세션은 기본적으로 열린 상태로 가정
      setLastUserActivityTime(Date.now()); // 새 세션 활동 시작 시간 기록
    } else if (couns_id && couns_id === currentSessionId) {
      // 같은 상담 세션에 머무르는 경우 (새로고침, 탭 전환 등)
      if (!currentSessionId && couns_id) {
        // 스토어에 ID가 없는데 URL에 ID가 있는 초기 상태
        setCurrentSessionId(couns_id);
      }
      if (!lastUserActivityTime) {
        // 마지막 활동 시간이 기록되지 않은 경우 (예: 새로고침 직후)
        setLastUserActivityTime(Date.now());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couns_id, currentSessionId, lastUserActivityTime]); // setCurrentSessionId 등은 Zustand에서 안정적이므로 제외 가능

  /**
   * @effect Tanstack Query로 `sessionDetail` 로드 성공 시 Zustand 스토어 (`messages`, `isCurrentSessionClosed`, `lastUserActivityTime`) 업데이트.
   *        - 서버로부터 받은 메시지 목록과 세션 종료 상태를 스토어에 반영합니다.
   *        - 세션이 열려있는 경우, 마지막 활동 시간을 현재로 업데이트하여 자동 종료 타이머를 리셋합니다.
   */
  useEffect(() => {
    if (sessionDetail) {
      const messagesFromServer = sessionDetail.messageList || [];
      const isClosedFromServer = sessionDetail.isClosed || false;

      setMessages(
        messagesFromServer.map(
          (msg) =>
            ({
              ...msg,
              id: msg.id || `${msg.timestamp}-${msg.messageOrder || Math.random()}`,
              counsId: sessionDetail.counsId,
            }) as ChatMessage
        )
      );

      setIsCurrentSessionClosed(isClosedFromServer);

      if (!isClosedFromServer) {
        // 세션이 서버 기준으로 열려 있다면, 사용자 활동으로 간주하고 마지막 활동 시간 업데이트
        setLastUserActivityTime(Date.now());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionDetail]); // setMessages 등은 Zustand에서 안정적이므로 제외 가능

  /**
   * @effect 상담 세션 종료 상태 변경 감지 및 STT 상태 초기화.
   *        - `storeIsCurrentSessionClosed`가 `true`로 변경되면 (즉, 세션이 종료되면),
   *          `useSTTStore`의 `resetSTTState`를 호출하여 음성 입력 관련 상태 (audioBlob 등)를 초기화합니다.
   *          이는 상담 종료 후 불필요한 STT 관련 로직 실행 (예: SendMessageForm의 STT useEffect)을 방지합니다.
   */
  useEffect(() => {
    if (storeIsCurrentSessionClosed) {
      console.log('[CounselingChatWindow] Session closed, resetting STT store state.');
      resetSTTState();
    }
  }, [storeIsCurrentSessionClosed, resetSTTState]);

  /**
   * @effect 메시지 목록 (`messages`) 또는 AI 타이핑 상태 (`isAiTyping`)가 변경될 때 채팅 스크롤을 맨 아래로 이동시킵니다.
   *         이를 통해 사용자는 항상 최신 메시지 또는 로딩 인디케이터를 볼 수 있습니다.
   */
  useEffect(() => {
    if (chatContainerRef.current) {
      // CardContent 내부의 실제 스크롤 가능한 요소(ChatMessageList의 내부 div일 수도 있음)를 찾아야 할 수 있습니다.
      // 우선 CardContent 자체를 스크ROLL 해봅니다.
      // ChatMessageList가 자체적으로 스크롤을 가지고 있다면, 해당 컴포넌트 내부에서 이 로직을 처리하거나
      // ChatMessageList 컴포넌트에 ref를 전달하여 직접 스크롤 제어해야 할 수 있습니다.
      // 여기서는 CardContent (id="chat-message-list-container")를 기준으로 합니다.
      const scrollableContainer = chatContainerRef.current; // document.getElementById('chat-message-list-container');
      if (scrollableContainer) {
        scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
      }
    }
  }, [messages, isAiTyping]);

  // --- WebSocket Connection (useWebSocket Hook) ---
  /**
   * @hook useWebSocket
   * @description 웹소켓 연결 및 STOMP 메시지 송수신을 관리하는 커스텀 훅.
   *              `couns_id`, `token`, 세션 종료 상태(`storeIsCurrentSessionClosed`)에 따라 자동 연결/해제를 시도합니다.
   *              AI 메시지 수신 시 `lastUserActivityTime`을 업데이트하여 자동 세션 종료를 방지합니다.
   */
  const {
    isConnected: isWebSocketConnected, // 현재 웹소켓 연결 상태.
    error: wsError, // 웹소켓 관련 에러 메시지.
    sendUserMessage, // 사용자가 입력한 메시지를 웹소켓으로 전송하는 함수.
    disconnect: disconnectWebSocket, // 웹소켓 연결을 수동으로 해제하는 함수.
  } = useWebSocket({
    counsId: couns_id ? couns_id : null,
    // 자동 연결 조건: 토큰 유효, 세션 ID 유효, 그리고 스토어 기준 세션이 '명시적으로 종료되지 않았을 때'
    // storeIsCurrentSessionClosed가 null (초기값) 또는 false일 때 연결 시도
    autoConnect:
      !!token && !!couns_id && (storeIsCurrentSessionClosed === null || storeIsCurrentSessionClosed === false),
    isSessionClosed: storeIsCurrentSessionClosed === null ? false : storeIsCurrentSessionClosed, // 훅 내부에 세션 상태 전달
    debug: process.env.NODE_ENV === 'development',
    onMessageReceived: () => {
      // AI로부터 메시지를 수신하면 사용자가 활동한 것으로 간주하여 마지막 활동 시간을 업데이트.
      if (storeIsCurrentSessionClosed === null || storeIsCurrentSessionClosed === false) {
        setLastUserActivityTime(Date.now());
      }
      // AI 응답 수신 시 (성공 또는 messageOrder=20 에러 포함) isAiTyping을 false로 설정
      // 이 로직은 useWebSocket 훅 내부의 onMessage 콜백에서 messageOrder를 확인 후 호출하는 것이 더 적절할 수 있으나,
      // 우선 여기서 간단히 모든 메시지 수신 시 false로 설정합니다.
      // 특정 에러(messageOrder=20)도 AI의 '응답'으로 간주하여 타이핑 상태를 해제합니다.
      setIsAiTyping(false);
    },
  });

  /**
   * @function handleSendUserMessage
   * @description `sendUserMessage`를 래핑하여 메시지 전송 시 `lastUserActivityTime`을 업데이트하고, `isAiTyping` 상태를 true로 설정하는 함수.
   * @param {StompSendUserMessagePayload} payload - 전송할 메시지 데이터.
   */
  const handleSendUserMessage = useCallback(
    (payload: StompSendUserMessagePayload) => {
      if (sendUserMessage) {
        // 사용자 메시지 전송 직전에 AI 타이핑 상태를 true로 설정합니다.
        setIsAiTyping(true);
        sendUserMessage(payload);
        setLastUserActivityTime(Date.now()); // 사용자 메시지 전송 시 활동 시간 업데이트
      }
    },
    [sendUserMessage, setLastUserActivityTime, setIsAiTyping]
  );

  /**
   * @effect 웹소켓 에러 발생 시 처리.
   *        - 콘솔에 에러를 로깅하고, 특정 에러 메시지('신뢰할 수 없는 자격증명')의 경우 `handleAuthError`를 호출합니다.
   */
  useEffect(() => {
    if (wsError) {
      console.error('WebSocket Error in CounselingChatWindow:', wsError);
      if (typeof wsError === 'string' && wsError.includes('신뢰할 수 없는 자격증명')) {
        handleAuthError();
      }
      // 추가적인 사용자 UI 피드백 (예: Toast 메시지)을 여기서 구현할 수 있습니다.
    }
  }, [wsError, handleAuthError]);

  // --- Automatic Session Ending Logic ---
  /** @constant {function} closeSessionMutation - 상담 세션을 종료하는 Tanstack Query 뮤테이션 함수. */
  const { mutate: deleteSessionMutation, isPending: isDeleteSessionPending } = useDeleteCounselingSession();
  const { mutate: createReportMutation, isPending: isCreateReportPending } = useCreateReportAndEndSession();

  /**
   * @effect 자동 세션 종료 로직을 관리하는 `useEffect`.
   *        - 조건: `couns_id`, `token` 유효, 스토어 기준 세션이 열려있음, `lastUserActivityTime` 기록 존재.
   *        - `lastUserActivityTime`으로부터 `AUTO_SESSION_END_TIMEOUT` 시간이 경과하면 세션을 자동으로 종료합니다.
   *        - 세션 종료 시 웹소켓 연결 해제 및 관련 Tanstack Query 캐시를 무효화합니다.
   *        - 의존성 배열의 값이 변경될 때마다 타이머를 재설정하거나 해제합니다.
   */
  useEffect(() => {
    /** @inner {function} clearAutoEndTimer - 설정된 자동 종료 타이머를 해제하는 내부 함수. */
    const clearAutoEndTimer = () => {
      if (autoEndTimerRef.current) {
        clearTimeout(autoEndTimerRef.current);
        autoEndTimerRef.current = null;
      }
    };

    // 자동 종료 로직 실행 조건 확인
    if (
      couns_id &&
      token &&
      (storeIsCurrentSessionClosed === null || storeIsCurrentSessionClosed === false) &&
      lastUserActivityTime
    ) {
      clearAutoEndTimer(); // 이전 타이머가 있다면 해제

      const timeSinceLastActivity = Date.now() - lastUserActivityTime;
      const remainingTime = AUTO_SESSION_END_TIMEOUT - timeSinceLastActivity;

      if (remainingTime <= 0) {
        // 이미 시간 초과, 즉시 종료 처리
        console.log(`[AutoEnd] Session ${couns_id} automatically ended due to inactivity (already expired).`);
        deleteSessionMutation(couns_id, {
          onSuccess: async () => {
            console.log(`[AutoEnd] Session ${couns_id} successfully deleted via mutation.`);
            if (disconnectWebSocket) {
              await disconnectWebSocket();
            }
            setIsCurrentSessionClosed(true); // Zustand 스토어 업데이트 (세션이 닫혔거나 삭제되었음을 의미)
            setCurrentSessionId(null); // 현재 세션 ID 초기화

            // Tanstack Query 캐시에서 해당 세션 제거
            queryClient.setQueryData<CounselingSession[]>(
              counselingQueryKeys.lists(),
              (oldData: CounselingSession[] | undefined) => {
                if (!oldData) return undefined;
                const numericCounsId = couns_id ? Number(couns_id) : NaN;
                return oldData.filter((session) => session.counsId !== numericCounsId);
              }
            );
            queryClient.removeQueries({ queryKey: counselingQueryKeys.detail(couns_id) });

            // 캐시 무효화 (이미 목록에서 제거했으므로, lists() 무효화는 선택적)
            // await queryClient.invalidateQueries({ queryKey: counselingQueryKeys.detail(couns_id) }); // 이미 removeQueries로 제거
            await queryClient.invalidateQueries({ queryKey: counselingQueryKeys.lists() });

            // 사용자가 현재 이 채팅방에 있을 경우에만 라우팅
            // 현재 URL의 couns_id와 일치하는지 확인하는 더 정확한 방법이 필요할 수 있음 (예: router.asPath)
            // 여기서는 컴포넌트 스코프의 couns_id가 유효하고, params.couns_id와 일치하는지 간단히 확인
            const currentPathCounsId = Array.isArray(params.couns_id) ? params.couns_id[0] : params.couns_id;
            if (couns_id && currentPathCounsId === couns_id) {
              router.push('/counseling'); // 자동 종료 후 상담 목록으로 이동
            }
          },
          onError: (error) => {
            console.error(`[AutoEnd] Failed to delete session ${couns_id} automatically:`, error);
          },
        });
      } else {
        // 시간 남음, 타이머 설정
        autoEndTimerRef.current = setTimeout(async () => {
          console.log(`[AutoEnd] Session ${couns_id} automatically ended due to inactivity (timer expired).`);
          deleteSessionMutation(couns_id, {
            onSuccess: async () => {
              console.log(`[AutoEnd] Session ${couns_id} successfully deleted via mutation (timer).`);
              if (disconnectWebSocket) {
                await disconnectWebSocket();
              }
              setIsCurrentSessionClosed(true); // Zustand 스토어 업데이트
              setCurrentSessionId(null); // 현재 세션 ID 초기화

              // Tanstack Query 캐시에서 해당 세션 제거
              queryClient.setQueryData<CounselingSession[]>(
                counselingQueryKeys.lists(),
                (oldData: CounselingSession[] | undefined) => {
                  if (!oldData) return undefined;
                  const numericCounsId = couns_id ? Number(couns_id) : NaN;
                  return oldData.filter((session) => session.counsId !== numericCounsId);
                }
              );
              queryClient.removeQueries({ queryKey: counselingQueryKeys.detail(couns_id) });

              // 캐시 무효화
              // await queryClient.invalidateQueries({ queryKey: counselingQueryKeys.detail(couns_id) });
              await queryClient.invalidateQueries({ queryKey: counselingQueryKeys.lists() });

              const currentPathCounsId = Array.isArray(params.couns_id) ? params.couns_id[0] : params.couns_id;
              if (couns_id && currentPathCounsId === couns_id) {
                router.push('/counseling'); // 자동 종료 후 상담 목록으로 이동
              }
            },
            onError: (error) => {
              console.error(`[AutoEnd] Failed to delete session ${couns_id} automatically (timer):`, error);
            },
          });
        }, remainingTime);
      }
    } else {
      // 자동 종료 조건 미충족 시 (예: 세션이 이미 닫혔거나, 로그아웃 등) 타이머 해제
      clearAutoEndTimer();
      if (couns_id) console.log(`[AutoEnd] Timer cleared for session ${couns_id} as conditions are not met.`);
    }

    // 컴포넌트 언마운트 또는 의존성 변경으로 effect 재실행 전 타이머 클린업
    return () => {
      clearAutoEndTimer();
      // console.log(`[AutoEnd] Cleanup: Timer cleared for session ${couns_id} due to unmount or dependency change.`);
    };
  }, [
    couns_id,
    storeIsCurrentSessionClosed,
    lastUserActivityTime,
    token,
    deleteSessionMutation,
    disconnectWebSocket,
    queryClient,
    setIsCurrentSessionClosed,
    router,
  ]);

  // --- Effects ---
  /**
   * @effect URL의 isNew 파라미터를 확인하여 새 세션인 경우 목록 캐시를 무효화합니다.
   * 또한, 웹소켓 연결을 시도하고, 세션 상세 정보를 가져옵니다.
   * couns_id가 변경될 때마다 실행됩니다.
   */
  useEffect(() => {
    if (couns_id) {
      console.log(`[ChatWindow] couns_id 변경됨: ${couns_id}. 웹소켓 연결 및 데이터 로드 시도.`);
      // ... (기존 웹소켓 연결 및 세션 상세 정보 로드 로직) ...

      // 새 세션으로 인해 페이지가 로드된 경우 목록 캐시 무효화
      const isNewSession = searchParams.get('isNew');
      if (isNewSession === 'true') {
        console.log('[ChatWindow] 새 세션으로 감지됨. 상담 목록 캐시를 무효화합니다.');
        queryClient.invalidateQueries({ queryKey: counselingQueryKeys.lists() });

        // URL에서 isNew 파라미터를 제거하고 나머지 유지
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('isNew');
        router.replace(`/counseling/${couns_id}?${newSearchParams.toString()}`, { scroll: false });
      }

      // 자동 세션 종료 타이머 설정 또는 클리어 로직 (기존 로직 유지)
      // ...
    } else {
      console.log('[ChatWindow] 유효한 couns_id가 없습니다. 웹소켓 연결 및 데이터 로드를 건너뛰고 종료합니다.');
    }
  }, [couns_id, searchParams, router, queryClient]);

  // --- Conditional Rendering Logic ---

  // 1. 인증 토큰 없는 경우 (로그인 필요)
  if (!token) {
    return (
      <Card className="w-full h-[calc(100vh-theme(space.16))] flex flex-col">
        <CardContent className="flex flex-col items-center justify-center flex-grow p-8">
          <AlertCircle className="w-16 h-16 text-orange-500 mb-6" />
          <h2 className="text-xl font-semibold mb-4">로그인이 필요합니다</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            상담 기능을 이용하려면 먼저 로그인해주세요. <br />
            만약 계정이 없다면, 회원가입 후 이용 가능합니다.
          </p>
          <Button onClick={() => router.push('/login')}>로그인 페이지로 이동</Button>
        </CardContent>
      </Card>
    );
  }

  // 2. 데이터 로딩 중 스켈레톤 UI (sessionDetail이 아직 없을 때)
  //    Tanstack Query의 isLoading은 초기 로딩 및 백그라운드 업데이트 시 모두 true가 될 수 있으므로,
  //    실제 데이터(`sessionDetail`) 존재 여부와 함께 판단하여 스켈레톤을 표시합니다.
  if (isLoading && !sessionDetail) {
    return (
      <Card className="w-full h-[calc(100vh-theme(space.16)-theme(space.16))] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <Skeleton className="h-6 w-1/2" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-20" /> {/* 버튼 크기 고려 */}
            <Skeleton className="h-8 w-28" /> {/* 레포트 버튼 크기 고려 */}
            <Skeleton className="h-8 w-20" /> {/* 버튼 크기 고려 */}
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 space-y-4 overflow-y-auto">
          {/* 채팅 메시지 스켈레톤 예시 */}
          <div className="flex items-start space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-12 w-3/4" />
            </div>
          </div>
          <div className="flex items-start justify-end space-x-3">
            <div className="space-y-1 flex-1 text-right">
              <Skeleton className="h-4 w-1/4 ml-auto" />
              <Skeleton className="h-16 w-2/3 ml-auto" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="flex items-start space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <Skeleton className="h-24 w-full" /> {/* SendMessageForm 스켈레톤 */}
        </CardFooter>
      </Card>
    );
  }

  // 3. 에러 발생 시 에러 메시지 UI
  //    `isError`는 Tanstack Query의 에러 상태입니다.
  //    `couns_id`가 있는데 `sessionDetail`이 없고 `isLoading`도 false인 경우는 데이터 로드 실패로 간주할 수 있습니다.
  if (isError || (couns_id && !sessionDetail && !isLoading)) {
    return (
      <Card className="w-full h-[calc(100vh-theme(space.16))] flex flex-col">
        <CardContent className="flex flex-col items-center justify-center flex-grow p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-6" /> {/* 아이콘 변경 */}
          <h2 className="text-xl font-semibold mb-4">상담 정보를 불러올 수 없습니다</h2>
          <Alert variant="destructive" className="max-w-md mb-8">
            <Terminal className="h-4 w-4" />
            <AlertTitle>오류 발생</AlertTitle>
            <AlertDescription className="break-all">
              {error?.message || wsError || '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/counseling')} variant="outline">
            상담 목록으로 돌아가기
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 4. 유효한 `couns_id`에도 불구하고 `sessionDetail` 객체가 없거나 필수 필드가 없는 경우
  if (!sessionDetail || typeof sessionDetail.counsId === 'undefined') {
    return (
      <Card className="w-full h-[calc(100vh-theme(space.16))] flex flex-col">
        <CardContent className="flex flex-col items-center justify-center flex-grow p-8">
          <HelpCircle className="w-16 h-16 text-yellow-500 mb-6" /> {/* 아이콘 변경 */}
          <h2 className="text-xl font-semibold mb-4">상담 세션 정보를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            요청하신 상담 세션(ID: {couns_id})에 대한 정보가 존재하지 않거나, <br />
            데이터 형식이 올바르지 않습니다. 관리자에게 문의해주세요.
          </p>
          <Button onClick={() => router.push('/counseling')} variant="outline">
            상담 목록으로 돌아가기
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --- Main Rendering Logic ---
  const currentTitle = sessionDetail.counsTitle || '상담 세션';
  // `storeIsCurrentSessionClosed`가 null (초기 상태)이면 false로 간주하여 UI를 즉시 비활성화하지 않도록 합니다.
  // 서버에서 로드된 실제 세션 상태가 반영될 때까지는 열린 것으로 가정합니다.
  const isEffectivelyClosed = storeIsCurrentSessionClosed ?? sessionDetail.isClosed ?? false;

  // 모달의 '상담만 종료하기' 버튼 클릭 시 실행될 함수
  const handleConfirmEndSession = () => {
    if (!couns_id || isDeleteSessionPending || isCreateReportPending) return;
    deleteSessionMutation(couns_id, {
      onSuccess: async () => {
        console.log('[Modal] 상담 세션 삭제 성공 (counsels/{counsId} DELETE)');
        setIsCurrentSessionClosed(true); // Zustand 스토어 업데이트
        setCurrentSessionId(null); // 현재 세션 ID 초기화
        if (disconnectWebSocket) {
          await disconnectWebSocket();
        }

        // Tanstack Query 캐시에서 해당 세션 제거
        queryClient.setQueryData<CounselingSession[]>(
          counselingQueryKeys.lists(),
          (oldData: CounselingSession[] | undefined) => {
            if (!oldData) return undefined;
            const numericCounsId = couns_id ? Number(couns_id) : NaN;
            return oldData.filter((session) => session.counsId !== numericCounsId);
          }
        );
        queryClient.removeQueries({ queryKey: counselingQueryKeys.detail(couns_id) });

        // 캐시 무효화
        // await queryClient.invalidateQueries({ queryKey: counselingQueryKeys.detail(couns_id) });
        await queryClient.invalidateQueries({ queryKey: counselingQueryKeys.lists() });

        setIsSessionEndModalOpen(false);
        router.push('/counseling');
      },
      onError: (error) => {
        console.error('[Modal] 상담 세션 삭제 실패:', error);
        setIsSessionEndModalOpen(false);
        // 에러 토스트 메시지 등 표시 가능
      },
    });
  };

  // 모달의 '레포트 발행하기' 버튼 클릭 시 실행될 함수
  const handleConfirmCreateReport = () => {
    if (!couns_id || isDeleteSessionPending || isCreateReportPending) return;
    createReportMutation(couns_id, {
      onSuccess: async (data) => {
        console.log(
          '[Modal] 레포트 생성 및 세션 종료 성공 (counsels/{counsId}/reports POST). Report ID:',
          data.sreportId
        );
        if (disconnectWebSocket) {
          await disconnectWebSocket();
        }

        // 캐시 무효화
        // await queryClient.invalidateQueries({ queryKey: ['reports'] });
        setIsSessionEndModalOpen(false);
        router.push('/reports');
      },
      onError: (error) => {
        console.error('[Modal] 레포트 생성 및 세션 종료 실패:', error);
        setIsSessionEndModalOpen(false);
        // 에러 토스트 메시지 등 표시 가능
      },
    });
  };

  return (
    <>
      {/* 최상위 Card: 화면 전체 높이 차지, 기본 배경색 지정, 내부 스크롤은 CardContent가 담당 */}
      <Card className="w-full h-full flex flex-col overflow-hidden bg-soft-ivory dark:bg-charcoal-black rounded-none shadow-none border-none">
        {/* CardHeader: 상담 제목 및 컨트롤 버튼 */}
        {/* 배경색을 white로 변경하고, 하단 그림자(shadow-sm) 추가, 기존 패딩 유지 */}
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-light-gray dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 shadow-sm">
          <div className="flex items-center flex-1 min-w-0">
            <BackButton href="/counseling" className="mr-2 flex-shrink-0 text-charcoal-black dark:text-soft-ivory" />
            <h1
              className="text-lg font-semibold truncate text-charcoal-black dark:text-soft-ivory"
              title={currentTitle}
            >
              {currentTitle}
            </h1>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* 제목 수정 버튼 */}
            <EditCounselingTitleButton counsId={couns_id!} currentTitle={currentTitle} />

            {/* 세션이 열려 있을 때만 상담 완료 버튼 표시 */}
            {couns_id && !isEffectivelyClosed && (
              <Button
                onClick={() => setIsSessionEndModalOpen(true)}
                variant="destructive"
                className="bg-tomato-red hover:bg-tomato-red/90 text-white dark:bg-pale-coral-pink dark:hover:bg-pale-coral-pink/90 dark:text-charcoal-black"
                size="sm"
                disabled={isDeleteSessionPending || isCreateReportPending}
              >
                <LogOut size={16} className="mr-2" />
                상담 종료
              </Button>
            )}
          </div>
        </CardHeader>

        {/* CardContent: 채팅 메시지 목록. flex-grow로 남은 공간 모두 차지, 내부에서 스크롤 처리. 배경색 변경 */}
        {/* p-0으로 변경하고, ChatMessageList 내부에서 패딩 및 스크롤 처리 */}
        <CardContent
          ref={chatContainerRef}
          className="flex flex-col flex-grow bg-light-gray dark:bg-gray-900 p-0 overflow-hidden scrollbar-custom"
          id="chat-message-list-container"
        >
          {/* ChatMessageList 내부에서 h-full 및 overflow-y-auto 필요 */}
          <ChatMessageList messages={messages} />
          {/* AI 답변 생성 중 로딩 인디케이터 */}
          {isAiTyping && (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-tomato-red dark:text-pale-coral-pink" />
              <span>담담이가 답변 중입니다. 잠시만 기다려주세요!</span>
            </div>
          )}
        </CardContent>

        {/* CardFooter: 메시지 입력 폼. 배경색을 CardHeader와 동일하게, 패딩 조정 */}
        <CardFooter className="p-3 border-t border-light-gray dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 z-10">
          <SendMessageForm
            currentCounsId={couns_id!}
            disabled={isEffectivelyClosed || !isWebSocketConnected || isAiTyping} // 세션 종료 또는 웹소켓 미연결 또는 AI 답변 생성 중일 때 비활성화
            isWebSocketConnected={isWebSocketConnected} // isWebSocketConnected prop 전달 추가
            sendUserMessage={handleSendUserMessage} // 래핑된 메시지 전송 함수 전달
            onUserActivity={() => setLastUserActivityTime(Date.now())} // 사용자 입력 활동 시 시간 업데이트
          />
        </CardFooter>
      </Card>

      <SessionEndModal
        isOpen={isSessionEndModalOpen}
        onClose={() => setIsSessionEndModalOpen(false)}
        onConfirmReport={handleConfirmCreateReport}
        onConfirmEnd={handleConfirmEndSession}
        isReportPending={isCreateReportPending}
        isEndPending={isDeleteSessionPending}
      />
    </>
  );
}

export default CounselingChatWindow;
