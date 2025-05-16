/**
 * @file useWebSocket.ts
 * 웹소켓 연결 및 STOMP 프로토콜 기반 메시지 송수신을 관리하는 커스텀 React 훅 (FSD 구조)
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, Frame, type IMessage as StompMessage } from '@stomp/stompjs';
import { useAuthStore } from '@/app/store/authStore';
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import { type ChatMessage, SenderType, MessageType } from '@/entities/counseling/model/types';
import { WEBSOCKET_BASE_URL, STOMP_HOST } from '@/shared/config';
import { type ReceivedServerMessage, type ErrorPayload } from '@/shared/types/websockets';

interface UseWebSocketOptions {
  counsId: string | null;
  autoConnect?: boolean;
  reconnectDelay?: number;
  debug?: boolean;
  isSessionClosed?: boolean;
}

export interface StompSendUserMessagePayload {
  messageOrder: number;
  isVoice: boolean;
  text: string;
}

interface UseWebSocketReturn {
  sendUserMessage: (payload: StompSendUserMessagePayload) => void;
  isConnected: boolean;
  lastReceivedStompMessage: StompMessage | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  isSessionClosed: boolean;
}

const DEFAULT_RECONNECT_DELAY = 5000;

export const useWebSocket = ({
  counsId,
  autoConnect = true,
  reconnectDelay = DEFAULT_RECONNECT_DELAY,
  debug = false,
  isSessionClosed = false,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<ReturnType<Client['subscribe']> | null>(null);
  const currentCounsIdRef = useRef<string | null>(counsId);
  const [isConnected, setIsConnected] = useState(false);
  const [lastReceivedStompMessage, setLastReceivedStompMessage] = useState<StompMessage | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  const { token } = useAuthStore();
  const {
    messages: storeMessages,
    addMessage: addMessageToStore,
    setWebsocketStatus,
    setIsAiTyping,
    setError: setStoreError,
  } = useCounselingStore();

  const log = useCallback(
    (...args: any[]) => {
      if (debug) {
        console.log(`[DamDam STOMP WebSocket - ${counsId || 'N/A'}]`, ...args);
      }
    },
    [debug, counsId]
  );

  // 메시지 파싱
  const parseStompMessageBody = useCallback(
    (stompMessage: StompMessage): ReceivedServerMessage | null => {
      try {
        const body = JSON.parse(stompMessage.body);
        if (body && typeof body.message === 'string' && body.sender) {
          return body as ReceivedServerMessage;
        }
        log('수신된 STOMP 메시지 body가 예상과 다릅니다:', body);
        return null;
      } catch (e) {
        log('STOMP 메시지 body 파싱 오류:', e, 'Original body:', stompMessage.body);
        setErrorState('수신 메시지 파싱 실패');
        return null;
      }
    },
    [log]
  );

  // 메시지 수신 처리
  const onStompMessage = useCallback(
    (stompMessage: StompMessage) => {
      if (debug) log('STOMP 메시지 수신:', stompMessage.body);
      setLastReceivedStompMessage(stompMessage);

      const parsedBody = parseStompMessageBody(stompMessage);
      if (parsedBody) {
        if (debug) log('파싱된 서버 메시지:', parsedBody);

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

        if (debug) log('ChatMessage 변환 및 스토어 추가:', chatMessage);
        addMessageToStore(chatMessage);
      } else {
        if (debug) log('STOMP 메시지 본문 파싱 실패 또는 유효하지 않은 메시지 형식');
      }
    },
    [debug, addMessageToStore, setIsAiTyping, log, parseStompMessageBody]
  );

  // STOMP 에러 처리
  const onStompError = useCallback(
    (frame: Frame) => {
      const errorMessage = frame.headers?.message || 'STOMP 프로토콜 오류';
      log('STOMP 프로토콜 에러 발생:', frame);
      setErrorState(`STOMP Error: ${errorMessage} (Body: ${frame.body})`);
      setStoreError(`STOMP Error: ${errorMessage}`);
      setIsConnected(false);
      setWebsocketStatus('error');
    },
    [log, setErrorState, setStoreError, setIsConnected, setWebsocketStatus]
  );

  // 구독 해제 함수
  const unsubscribeIfExists = useCallback(() => {
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
        log('STOMP 구독이 성공적으로 해제되었습니다.');
      } catch (subError) {
        log('STOMP 구독 해제 중 오류 발생:', subError);
      }
      subscriptionRef.current = null;
    }
  }, [log]);

  // 연결 해제 함수
  const disconnect = useCallback(() => {
    unsubscribeIfExists();
    const handleDeactivationSuccess = () => {
      setIsConnected(false);
      setWebsocketStatus('disconnected');
      log('STOMP 연결이 성공적으로 해제되었습니다.');
    };

    const handleDeactivationError = (e: any) => {
      setIsConnected(false);
      setWebsocketStatus('disconnected');
      const errorMessage = `STOMP 연결 해제 중 오류: ${e?.message || String(e)}`;
      setErrorState(errorMessage);
      setStoreError(errorMessage);
      log('STOMP 연결 해제 중 오류 발생:', e);
    };

    if (stompClientRef.current?.active) {
      log('STOMP 클라이언트 연결을 비활성화합니다.', currentCounsIdRef.current);
      stompClientRef.current.deactivate().then(handleDeactivationSuccess).catch(handleDeactivationError);
    } else {
      setIsConnected(false);
      setWebsocketStatus('disconnected');
    }
  }, [unsubscribeIfExists, log, setWebsocketStatus, setErrorState, setStoreError]);

  // 연결 함수
  const connect = useCallback(() => {
    if (!counsId || isSessionClosed || !token) {
      log('상담 ID, 세션 상태, 토큰 확인 필요. 연결 시도 중단.');
      return;
    }
    if (stompClientRef.current?.active) {
      log('이미 STOMP 클라이언트가 활성화되어 있습니다. 재연결하지 않습니다.');
      return;
    }

    log('STOMP 연결 시도 중...', `URL: ${WEBSOCKET_BASE_URL}, Host: ${STOMP_HOST}`);
    setWebsocketStatus('connecting');

    const stompClient = new Client({
      brokerURL: WEBSOCKET_BASE_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        host: STOMP_HOST,
      },
      debug: (str) => {
        if (debug) log('[STOMP LIB DEBUG]', str);
      },
      reconnectDelay,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: (frame: Frame) => {
        setIsConnected(true);
        setWebsocketStatus('connected');
        setErrorState(null);
        setStoreError(null);
        log(`STOMP 연결 성공! Session ID: ${counsId}`, 'Frame:', frame);

        // ✅ 기존 구독 해제 (중복 구독 방지)
        unsubscribeIfExists();

        // 새 구독 ID 생성
        const subscriptionId = `sub-${counsId}`;
        const receiptId = `sub-${counsId}`;
        const destination = `/sub/counsels/${counsId}/chat`;

        log(`STOMP 구독 시도. Destination: ${destination}, ID: ${subscriptionId}, Receipt: ${receiptId}`);

        // ✅ 중복 subscribe 방지
        if (subscriptionRef.current) {
          log('이미 구독 중입니다. 중복 구독 방지');
          return;
        }
        if (stompClientRef.current) {
          subscriptionRef.current = stompClientRef.current.subscribe(
            destination,
            (stompMessage: StompMessage) => {
              onStompMessage(stompMessage);
            },
            {
              Authorization: `Bearer ${token}`,
              id: subscriptionId,
              receipt: receiptId,
            }
          );
          log('STOMP 구독 요청됨.', `Subscription ID: ${subscriptionRef.current?.id || subscriptionId}`);
        } else {
          log('STOMP 클라이언트가 존재하지 않아 구독할 수 없습니다.');
        }
      },
      onStompError: (frame: Frame) => {
        onStompError(frame);
      },
      onWebSocketError: (event: Event) => {
        const errorMessage = 'WebSocket 연결 오류 발생';
        log(errorMessage, event);
        setErrorState(errorMessage);
        setStoreError(errorMessage);
        setIsConnected(false);
        setWebsocketStatus('error');
      },
      onWebSocketClose: (event: CloseEvent) => {
        log('WebSocket 연결이 닫혔습니다.', `Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`);
        setIsConnected(false);
        setWebsocketStatus('disconnected');
      },
      beforeConnect: () => {
        log('STOMP 연결 직전 (beforeConnect).');
        if (!token) {
          log('토큰이 없어 연결을 중단합니다.');
        }
      },
    });

    stompClientRef.current = stompClient;
    stompClient.activate();
  }, [
    counsId,
    token,
    debug,
    reconnectDelay,
    log,
    onStompMessage,
    onStompError,
    setWebsocketStatus,
    setStoreError,
    isSessionClosed,
    unsubscribeIfExists,
  ]);

  // 자동 연결/해제 로직
  useEffect(() => {
    const prevCounsId = currentCounsIdRef.current;
    currentCounsIdRef.current = counsId;

    const isActive = stompClientRef.current?.active;
    const isValidToConnect = autoConnect && counsId && token && !isSessionClosed;

    if (debug) {
      log('useEffect 실행됨', {
        counsId,
        prevCounsId,
        token: !!token,
        autoConnect,
        isSessionClosed,
        isActive,
        isValidToConnect,
      });
    }

    if (isValidToConnect) {
      if (!isActive) {
        if (debug) log('useEffect: 조건 충족, 연결되지 않음 -> connect() 호출');
        connect();
      } else if (isActive && prevCounsId !== counsId && counsId) {
        if (debug) log(`useEffect: 상담 ID 변경 (${prevCounsId} -> ${counsId}), 재연결 실행...`);
        disconnect();
        connect();
      } else {
        if (debug) log('useEffect: 이미 적절히 연결되어 있거나, ID 변경 없음. 별도 조치 없음');
      }
    } else if (isActive) {
      if (debug) log('useEffect: 연결 조건 미충족 (유효하지 않거나 세션 종료 등)이고 활성 상태 -> disconnect() 호출');
      disconnect();
    }

    return () => {
      if (debug) log(`useEffect cleanup 실행 (counsId: ${counsId}, prevCounsId: ${prevCounsId})`);
      if (stompClientRef.current?.active || stompClientRef.current?.connected) {
        if (debug) log('useEffect cleanup: 활성 연결 해제 실행...');
        disconnect();
      }
    };
  }, [counsId, token, autoConnect, isSessionClosed, debug, connect, disconnect, log]);

  // 메시지 발송
  const sendUserMessage = useCallback(
    (payload: StompSendUserMessagePayload) => {
      if (!stompClientRef.current?.active || !currentCounsIdRef.current || isSessionClosed) {
        const errorMessage = `STOMP 클라이언트가 활성화되지 않았거나 상담 ID가 없거나 세션이 종료되어 메시지를 보낼 수 없습니다. 연결 상태: ${
          stompClientRef.current?.active
        }, 상담 ID: ${currentCounsIdRef.current}, 세션 종료: ${isSessionClosed}`;
        setErrorState(errorMessage);
        setStoreError(errorMessage);
        if (debug) {
          log(`sendUserMessage 호출 실패: ${errorMessage}`);
        }
        return;
      }

      const currentUserMessagesCount = storeMessages.filter((msg) => msg.sender === SenderType.USER).length;
      const nextMessageOrder = currentUserMessagesCount + 1;

      const messageToSend = {
        isVoice: payload.isVoice,
        message: payload.text,
        messageOrder: nextMessageOrder,
      };

      const destination = `/pub/counsels/${currentCounsIdRef.current}/chat`;
      const headers = {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      };

      try {
        stompClientRef.current.publish({
          destination,
          headers,
          body: JSON.stringify(messageToSend),
        });
        if (debug) {
          log(`STOMP 메시지 발행:`, { destination, headers, body: JSON.stringify(messageToSend) });
        }
      } catch (e: any) {
        const errorMessage = `STOMP 메시지 발행 중 오류: ${e?.message || String(e)}`;
        setErrorState(errorMessage);
        setStoreError(errorMessage);
        if (debug) {
          console.error(`[DamDam STOMP WebSocket - ${currentCounsIdRef.current}] STOMP 메시지 발행 중 오류:`, e);
        }
      }
    },
    [token, debug, isSessionClosed, storeMessages, setStoreError, log]
  );

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
