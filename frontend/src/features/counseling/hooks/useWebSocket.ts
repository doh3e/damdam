/**
 * @file features/counseling/hooks/useWebSocket.ts
 * 웹소켓 연결 및 STOMP 프로토콜 기반 메시지 송수신을 관리하는 커스텀 React 훅입니다.
 * FSD 아키텍처에 따라 상담 기능에 특화된 훅이므로 `features/counseling` 레이어의 `hooks`에 위치합니다.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, Frame, type IMessage as StompMessage } from '@stomp/stompjs';
import { useAuthStore } from '@/app/store/authStore';
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import { type ChatMessage, SenderType, MessageType } from '@/entities/counseling/model/types';
import { WEBSOCKET_BASE_URL, STOMP_HOST } from '@/shared/config';
import { type ReceivedServerMessage, type ErrorPayload } from '@/shared/types/websockets';

/**
 * useWebSocket 훅의 설정 옵션 인터페이스
 */
interface UseWebSocketOptions {
  /** 현재 상담 세션 ID (`couns_id`). 이 ID를 기반으로 구독 및 발행 대상이 동적으로 생성됩니다. */
  counsId: string | null;
  /** 웹소켓 연결이 자동으로 시작되어야 하는지 여부 (기본값: true). `counsId`가 있을 때만 자동 연결. */
  autoConnect?: boolean;
  /** 재연결 시도 딜레이 (ms, 기본값: 0 - 자동 재연결 비활성화). 이 훅은 수동 제어를 우선합니다. */
  reconnectDelay?: number;
  /** 디버그 로그 출력 여부 */
  debug?: boolean;
  /** 현재 상담 세션 상태 (종료 여부) */
  isSessionClosed?: boolean;
}

/**
 * sendUserMessage 함수에 전달될 페이로드 타입
 * 기존 SendUserMessagePayload에서 messageOrder 추가
 */
export interface StompSendUserMessagePayload {
  /** 채팅 순서 번호 */
  messageOrder: number;
  /** 음성 메시지 여부 */
  isVoice: boolean;
  /** 채팅 내용 */
  text: string;
}

/**
 * useWebSocket 훅의 반환 값 인터페이스
 */
interface UseWebSocketReturn {
  /** 서버로 사용자 채팅 메시지를 전송하는 함수 */
  sendUserMessage: (payload: StompSendUserMessagePayload) => void;
  /** 현재 웹소켓 연결 상태 */
  isConnected: boolean;
  /** 마지막으로 수신된 STOMP 메시지 객체 (디버깅 또는 특정 UI 로직에 사용 가능) */
  lastReceivedStompMessage: StompMessage | null;
  /** 웹소켓/STOMP 관련 에러 메시지 */
  error: string | null;
  /** 웹소켓 연결을 수동으로 시작하는 함수 */
  connect: () => Promise<void>;
  /** 웹소켓 연결을 수동으로 종료하는 함수 */
  disconnect: () => Promise<void>;
  /** 현재 세션이 종료되었는지 여부 (props로 받은 값) */
  isSessionClosed: boolean;
}

/**
 * STOMP 기반 웹소켓 통신을 위한 커스텀 훅입니다.
 *
 * @param {UseWebSocketOptions} options - 웹소켓 설정 옵션
 * @returns {UseWebSocketReturn} 웹소켓 통신을 위한 함수 및 상태
 */
export const useWebSocket = ({
  counsId,
  autoConnect = true,
  reconnectDelay = 0, // 기본값을 0으로 하여 자동 재연결 비활성화
  debug = false,
  isSessionClosed = false,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<ReturnType<Client['subscribe']> | null>(null);
  const currentCounsIdRef = useRef<string | null>(counsId);
  const hookInstanceIdRef = useRef(Math.random().toString(36).substring(2, 12)); // 훅 인스턴스별 ID

  const [isConnected, setIsConnected] = useState(false);
  const [lastReceivedStompMessage, setLastReceivedStompMessage] = useState<StompMessage | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  const connectingRef = useRef(false);
  const disconnectingRef = useRef(false);
  const prevCounsIdRef = useRef<string | null>(null); // 이전 counsId 추적

  const { token } = useAuthStore();
  const {
    addMessage: addMessageToStore,
    setWebsocketStatus,
    setIsAiTyping,
    setError: setStoreError,
  } = useCounselingStore();

  const log = useCallback(
    (...args: any[]) => {
      if (debug) {
        console.log(`[DamDam STOMP - ${currentCounsIdRef.current || 'N/A'} - ${hookInstanceIdRef.current}]`, ...args);
      }
    },
    [debug] // currentCounsIdRef, hookInstanceIdRef는 ref이므로 의존성 배열에 불필요
  );

  const parseStompMessageBody = useCallback(
    (stompMessage: StompMessage): ReceivedServerMessage | null => {
      try {
        const body = JSON.parse(stompMessage.body);
        if (body && body.sender) {
          return body as ReceivedServerMessage;
        }
        log('수신된 STOMP 메시지 body 구조가 예상과 다릅니다:', body);
        return null;
      } catch (e) {
        log('STOMP 메시지 body 파싱 오류:', e, 'Original body:', stompMessage.body);
        setErrorState('수신 메시지 파싱 실패');
        return null;
      }
    },
    [log]
  );

  const onStompMessage = useCallback(
    (stompMessage: StompMessage) => {
      log('STOMP 메시지 수신:', stompMessage.body);
      setLastReceivedStompMessage(stompMessage);

      const parsedBody = parseStompMessageBody(stompMessage);
      if (parsedBody) {
        log('파싱된 서버 메시지:', parsedBody);

        if (parsedBody.sender === SenderType.AI) {
          if (parsedBody.messageType === MessageType.TEXT && parsedBody.message === 'AI_TYPING_START') {
            setIsAiTyping(true);
            return;
          }
          if (parsedBody.messageType === MessageType.TEXT && parsedBody.message === 'AI_TYPING_END') {
            setIsAiTyping(false);
            return;
          }
        }

        const chatMessage: ChatMessage = {
          id: parsedBody.id || `${Date.now()}-${parsedBody.messageOrder || Math.random()}`,
          counsId: currentCounsIdRef.current!,
          sender: parsedBody.sender as SenderType,
          messageType: parsedBody.messageType || MessageType.TEXT,
          content: parsedBody.message,
          timestamp:
            typeof parsedBody.timestamp === 'string' ? new Date(parsedBody.timestamp).getTime() : parsedBody.timestamp,
          recommendations:
            parsedBody.sender === SenderType.AI && parsedBody.messageType === MessageType.RECOMMENDATION
              ? (parsedBody as any).recommendations || []
              : undefined,
          error: undefined,
        };

        if (
          parsedBody.sender === SenderType.AI &&
          chatMessage.messageType === MessageType.TEXT &&
          typeof parsedBody.message === 'string' &&
          parsedBody.message.startsWith('Error:')
        ) {
          chatMessage.messageType = MessageType.ERROR;
          chatMessage.error = {
            code: 'AI_RESPONSE_ERROR',
            message: parsedBody.message.substring(6).trim(),
          };
        } else if (parsedBody.messageType === MessageType.ERROR && parsedBody.error) {
          chatMessage.messageType = MessageType.ERROR;
          chatMessage.error = parsedBody.error as ErrorPayload;
        }

        if (chatMessage.sender === SenderType.AI || chatMessage.messageType === MessageType.ERROR) {
          log('ChatMessage 변환 (AI 또는 에러) 및 스토어 추가:', chatMessage);
          addMessageToStore(chatMessage);
        } else if (chatMessage.sender === SenderType.USER) {
          log('사용자 메시지 수신 (STOMP 구독 통해) - 스토어에 중복 추가 방지:', chatMessage);
        } else {
          log('알 수 없는 sender 타입의 메시지 수신:', chatMessage);
        }
      } else {
        log('STOMP 메시지 본문 파싱 실패 또는 유효하지 않은 메시지 형식');
      }
    },
    [log, parseStompMessageBody, addMessageToStore, setIsAiTyping]
  );

  const handleStompError = useCallback(
    (frameOrError: Frame | Event | string, type: 'stomp' | 'websocket' | 'activation' = 'stomp') => {
      let errorMessage = '알 수 없는 오류';
      if (typeof frameOrError === 'string') {
        errorMessage = frameOrError;
      } else if (frameOrError instanceof Event) {
        errorMessage = `WebSocket 오류 (${type}): 연결 실패 또는 소켓 오류`;
        log(`WebSocket 오류 (${type}):`, frameOrError);
      } else if ('headers' in frameOrError) {
        errorMessage = frameOrError.headers?.message || 'STOMP 프로토콜 오류';
        log(`STOMP 프로토콜 에러 (${type}):`, frameOrError.headers, frameOrError.body);
      } else {
        errorMessage = `예상치 못한 오류 (${type}): ${String(frameOrError)}`;
        log(`예상치 못한 오류 (${type}):`, frameOrError);
      }

      log(`에러 발생: ${errorMessage}`);
      setErrorState(errorMessage);
      if (setStoreError) setStoreError(errorMessage);
      setIsConnected(false);
      if (setWebsocketStatus) setWebsocketStatus('error');
      connectingRef.current = false;
    },
    [log, setStoreError, setWebsocketStatus]
  );

  const disconnect = useCallback(async (): Promise<void> => {
    log('disconnect 함수 호출됨', {
      isDisconnecting: disconnectingRef.current,
      hasClient: !!stompClientRef.current,
      isClientActive: stompClientRef.current?.active,
    });

    if (disconnectingRef.current) {
      log('이미 연결 해제 작업 진행 중입니다.');
      return;
    }

    if (!stompClientRef.current) {
      log('STOMP 클라이언트가 존재하지 않습니다.');
      setIsConnected(false);
      if (setWebsocketStatus) setWebsocketStatus('disconnected');
      connectingRef.current = false;
      return;
    }

    disconnectingRef.current = true;
    log('STOMP 연결 해제 시도...', `(구독 ID: ${subscriptionRef.current?.id})`);

    if (subscriptionRef.current) {
      try {
        log(`구독 해제 시도: ${subscriptionRef.current.id}`);
        subscriptionRef.current.unsubscribe();
        log('STOMP 구독이 성공적으로 해제되었습니다.');
      } catch (subError) {
        log('STOMP 구독 해제 중 오류 발생:', subError);
      }
      subscriptionRef.current = null;
    }

    if (stompClientRef.current?.active) {
      log('stompClient.deactivate() 호출 시도');
      try {
        await stompClientRef.current.deactivate();
        log('STOMP 클라이언트가 성공적으로 비활성화되었습니다.');
      } catch (e: any) {
        const errMsg = `STOMP 연결 해제(deactivate) 중 오류: ${e?.message || String(e)}`;
        handleStompError(errMsg, 'websocket');
      }
    } else {
      log('STOMP 클라이언트가 활성 상태가 아니므로 deactivate를 건너뛰니다.');
    }

    stompClientRef.current = null;
    setIsConnected(false);
    if (setWebsocketStatus) setWebsocketStatus('disconnected');
    connectingRef.current = false;
    disconnectingRef.current = false;
    log('STOMP 연결 해제 완료됨.');
  }, [log, handleStompError, setWebsocketStatus]);

  const connect = useCallback(async (): Promise<void> => {
    log('connect 함수 호출됨', {
      counsId: currentCounsIdRef.current,
      isConnecting: connectingRef.current,
      isClientActive: stompClientRef.current?.active,
    });

    if (!currentCounsIdRef.current) {
      log('counsId가 없어 연결을 시도할 수 없습니다.');
      setErrorState('상담 ID가 없어 연결할 수 없습니다.');
      return;
    }

    if (connectingRef.current) {
      log('이미 연결 시도 중입니다.');
      return;
    }

    if (stompClientRef.current && stompClientRef.current.active) {
      log('이미 STOMP 클라이언트가 활성 상태입니다. 추가 연결 시도를 하지 않습니다.');
      if (!isConnected) setIsConnected(true);
      if (useCounselingStore.getState().websocketStatus !== 'connected') {
        if (setWebsocketStatus) setWebsocketStatus('connected');
      }
      return;
    }

    connectingRef.current = true;
    setErrorState(null);
    if (setWebsocketStatus) setWebsocketStatus('connecting');
    log('STOMP 연결 시도 중...', `Target counsId: ${currentCounsIdRef.current}`);

    const client = new Client({
      brokerURL: WEBSOCKET_BASE_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        ...(STOMP_HOST && { host: STOMP_HOST }),
      },
      reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        log('[STOMP LIB DEBUG]', str);
      },
      beforeConnect: () => {
        log('STOMP 연결 직전 (beforeConnect).');
        if (stompClientRef.current && !stompClientRef.current.active) {
          log('beforeConnect: 이전 비활성 클라이언트 참조 제거.');
          stompClientRef.current = null;
        }
      },
      onConnect: (frame: Frame) => {
        log('STOMP 연결 성공!', frame);
        stompClientRef.current = client;
        setIsConnected(true);
        if (setWebsocketStatus) setWebsocketStatus('connected');
        connectingRef.current = false;

        const destination = `/topic/counsels/${currentCounsIdRef.current}`;
        log(`구독 시도: ${destination}`);

        if (subscriptionRef.current) {
          log(`기존 구독 (${subscriptionRef.current.id}) 해제 시도`);
          try {
            subscriptionRef.current.unsubscribe();
          } catch (unsubError) {
            log('기존 구독 해제 중 오류:', unsubError);
          }
          subscriptionRef.current = null;
        }

        subscriptionRef.current = client.subscribe(destination, onStompMessage, {
          id: `sub-${currentCounsIdRef.current}-${Date.now()}`,
        });
        log(`구독 완료: ${destination}, 구독 ID: ${subscriptionRef.current.id}`);
      },
      onStompError: (frame: Frame) => {
        handleStompError(frame, 'stomp');
      },
      onWebSocketError: (event: Event) => {
        handleStompError(event, 'websocket');
      },
      onWebSocketClose: (event: CloseEvent) => {
        log('WebSocket 연결이 닫혔습니다.', event);
        if (!disconnectingRef.current) {
          const errorMessage = `WebSocket 연결이 예기치 않게 종료되었습니다. (코드: ${event.code}, 사유: ${event.reason || 'N/A'})`;
          handleStompError(errorMessage, 'websocket');
        }
      },
    });

    try {
      log('client.activate() 호출 시도');
      client.activate();
    } catch (activationError) {
      log('STOMP 클라이언트 활성화 중 즉각적인 오류 발생:', activationError);
      handleStompError(String(activationError), 'activation');
    }
  }, [token, reconnectDelay, log, onStompMessage, handleStompError, setWebsocketStatus]);

  const sendUserMessage = useCallback(
    (payload: StompSendUserMessagePayload) => {
      if (!stompClientRef.current || !stompClientRef.current.active || !isConnected) {
        log('STOMP 클라이언트가 연결되지 않았거나 활성 상태가 아닙니다. 메시지 전송 불가.');
        setErrorState('연결되지 않아 메시지를 보낼 수 없습니다.');
        return;
      }
      if (!currentCounsIdRef.current) {
        log('counsId가 없어 메시지를 전송할 수 없습니다.');
        setErrorState('상담 ID가 없어 메시지를 보낼 수 없습니다.');
        return;
      }

      const destination = `/app/counsels/${currentCounsIdRef.current}/messages`;
      const body = JSON.stringify({
        messageOrder: payload.messageOrder,
        message: payload.text,
        isVoice: payload.isVoice,
      });

      try {
        log(`STOMP 메시지 발행 시도: ${destination}, body: ${body}`);
        stompClientRef.current.publish({
          destination,
          body,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        log('STOMP 메시지 발행 성공.');

        const optimisticMessage: ChatMessage = {
          id: `local-${Date.now()}-${payload.messageOrder}`,
          counsId: currentCounsIdRef.current,
          sender: SenderType.USER,
          messageType: payload.isVoice ? MessageType.VOICE : MessageType.TEXT,
          content: payload.text,
          timestamp: Date.now(),
          isLoading: true,
        };
        addMessageToStore(optimisticMessage);
        log('사용자 메시지 (Optimistic) 스토어 추가:', optimisticMessage);
      } catch (e: any) {
        const errMsg = `메시지 전송 중 오류: ${e?.message || String(e)}`;
        log(errMsg);
        setErrorState(errMsg);
      }
    },
    [isConnected, token, log, addMessageToStore]
  );

  useEffect(() => {
    if (counsId !== currentCounsIdRef.current) {
      log(
        `useEffect: counsId prop 변경 감지. 이전 Ref: ${currentCounsIdRef.current}, 새 prop: ${counsId}. Ref 업데이트.`
      );
      currentCounsIdRef.current = counsId;
    }

    const shouldConnect = autoConnect && !!currentCounsIdRef.current && !isSessionClosed;

    log('useEffect 실행 (의존성 변경 또는 초기 마운트):', {
      counsId: currentCounsIdRef.current,
      prevCounsId: prevCounsIdRef.current,
      shouldConnect,
      isConnecting: connectingRef.current,
      isDisconnecting: disconnectingRef.current,
      actualIsConnected: isConnected,
      isClientActive: stompClientRef.current?.active,
      isSessionClosed,
      tokenExists: !!token,
    });

    if (shouldConnect) {
      if (currentCounsIdRef.current !== prevCounsIdRef.current || !isConnected) {
        if (connectingRef.current || disconnectingRef.current) {
          log('useEffect: 이미 연결 또는 해제 작업 진행 중. 추가 작업 안 함.');
        } else {
          log('useEffect: 조건 충족 (ID 변경 또는 미연결) -> 이전 연결 해제 후 새 연결 시도');
          (async () => {
            if (
              prevCounsIdRef.current &&
              prevCounsIdRef.current !== currentCounsIdRef.current &&
              stompClientRef.current?.active
            ) {
              log(
                `useEffect: counsId 변경(${prevCounsIdRef.current} -> ${currentCounsIdRef.current})으로 인한 기존 연결 해제 시도.`
              );
              await disconnect();
            }
            log('useEffect: connect() 호출 준비.');
            await connect();
          })();
        }
      } else {
        log('useEffect: ID 변경 없고 이미 연결된 상태. 추가 connect 호출 안 함.');
      }
    } else {
      if (isConnected || (stompClientRef.current && stompClientRef.current.active)) {
        if (!disconnectingRef.current) {
          log('useEffect: 연결 조건 false인데 연결되어 있음 -> disconnect() 호출');
          disconnect();
        } else {
          log('useEffect: 연결 조건 false, 이미 연결 해제 작업 중.');
        }
      } else {
        log('useEffect: 연결 조건 false, 연결되어 있지도 않음. 별도 작업 없음.');
      }
    }

    if (prevCounsIdRef.current !== currentCounsIdRef.current) {
      prevCounsIdRef.current = currentCounsIdRef.current;
      log(`useEffect: prevCounsIdRef 업데이트됨 -> ${prevCounsIdRef.current}`);
    }

    return () => {
      const counsIdAtCleanup = currentCounsIdRef.current;
      log(`useEffect cleanup 실행 (캡처된 counsId: ${counsIdAtCleanup}, HookInstanceId: ${hookInstanceIdRef.current})`);
      if (!connectingRef.current && !disconnectingRef.current && stompClientRef.current?.active) {
        log('useEffect cleanup: 활성 클라이언트 존재 및 특정 작업 중 아님 -> disconnect() 호출');
        disconnect();
      } else {
        log('useEffect cleanup: 연결/해제 작업 중이거나, 클라이언트 없거나 비활성. disconnect 호출 안 함.');
      }
    };
  }, [counsId, autoConnect, isSessionClosed, token, connect, disconnect]);

  return {
    sendUserMessage,
    isConnected,
    lastReceivedStompMessage,
    error: errorState,
    connect,
    disconnect,
    isSessionClosed,
  };
};
