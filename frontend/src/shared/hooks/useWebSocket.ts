/**
 * @file useWebSocket.ts
 * 웹소켓 연결 및 메시지 송수신을 관리하는 커스텀 React 훅입니다.
 * FSD 아키텍처에 따라 범용적인 훅이므로 `shared` 레이어의 `hooks`에 위치합니다.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import {
  WebSocketMessageType,
  BaseWebSocketMessage,
  ReceivedWebSocketMessage,
  SentWebSocketMessage,
  ReceiveAiChatMessagePayload,
  AiTypingStartPayload,
  AiTypingEndPayload,
  CounselingSessionStartedPayload,
  CounselingSessionEndedPayload,
  ErrorPayload,
} from '@/shared/types/websockets';
import { ChatMessage, SenderType, MessageType, CounselingStatus } from '@/entities/counseling/model/types';

/**
 * useWebSocket 훅의 설정 옵션 인터페이스
 */
interface UseWebSocketOptions {
  /** 웹소켓 서버 URL */
  url: string;
  /** 현재 상담 세션 ID (메시지 전송 시 사용) */
  sessionId?: string | null;
  /** 웹소켓 연결이 자동으로 시작되어야 하는지 여부 (기본값: true) */
  autoConnect?: boolean;
  /** 재연결 시도 횟수 (기본값: 3) */
  reconnectAttempts?: number;
  /** 재연결 시도 간격 (ms, 기본값: 3000) */
  reconnectInterval?: number;
  /** 디버그 로그 출력 여부 */
  debug?: boolean;
}

/**
 * useWebSocket 훅의 반환 값 인터페이스
 */
interface UseWebSocketReturn {
  /** 서버로 메시지를 전송하는 함수 */
  sendMessage: <T extends WebSocketMessageType>(type: T, payload: SentWebSocketMessage['payload']) => void;
  /** 현재 웹소켓 연결 상태 */
  isConnected: boolean;
  /** 마지막으로 수신된 메시지 */
  lastMessage: ReceivedWebSocketMessage | null;
  /** 웹소켓 관련 에러 객체 */
  error: Error | string | null;
  /** 웹소켓 연결을 수동으로 시작하는 함수 */
  connect: () => void;
  /** 웹소켓 연결을 수동으로 종료하는 함수 */
  disconnect: () => void;
}

const DEFAULT_RECONNECT_ATTEMPTS = 3;
const DEFAULT_RECONNECT_INTERVAL = 3000;

/**
 * 웹소켓 통신을 위한 커스텀 훅입니다.
 *
 * @param {UseWebSocketOptions} options - 웹소켓 설정 옵션
 * @returns {UseWebSocketReturn} 웹소켓 통신을 위한 함수 및 상태
 */
export const useWebSocket = ({
  url,
  sessionId,
  autoConnect = true,
  reconnectAttempts = DEFAULT_RECONNECT_ATTEMPTS,
  reconnectInterval = DEFAULT_RECONNECT_INTERVAL,
  debug = false,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const socketRef = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<ReceivedWebSocketMessage | null>(null);
  const [error, setErrorState] = useState<Error | string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Zustand 스토어 액션 가져오기
  const {
    addMessage,
    setIsAiTyping,
    setWebsocketStatus,
    setCurrentSessionId,
    setCurrentSessionStatus,
    setError: setStoreError, // 스토어 에러와 훅 내부 에러 구분
  } = useCounselingStore();

  const log = useCallback(
    (...args: any[]) => {
      if (debug) {
        console.log('[useWebSocket]', ...args);
      }
    },
    [debug]
  );

  const connect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      log('이미 연결되어 있습니다.');
      return;
    }

    log('웹소켓 연결 시도 중...', url);
    setWebsocketStatus('connecting');
    setErrorState(null);

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      log('웹소켓 연결 성공!');
      setWebsocketStatus('connected');
      setErrorState(null);
      setRetryCount(0); // 연결 성공 시 재시도 횟수 초기화
      // 연결 성공 시 자동으로 세션 시작 메시지 전송 (옵션)
      // if (sessionId) {
      //   sendMessage(WebSocketMessageType.START_COUNSELING_SESSION, { userId: 'currentUserId' /* 실제 사용자 ID */, sessionId });
      // }
    };

    socket.onmessage = (event) => {
      try {
        if (typeof event.data !== 'string') {
          log('수신된 데이터가 문자열이 아닙니다:', event.data);
          setErrorState('수신 데이터 형식 오류');
          return;
        }
        const rawMessage = JSON.parse(event.data);
        log('메시지 수신 (raw):', rawMessage);

        // 메시지 객체 및 type 속성 존재 여부 확인
        if (!rawMessage || typeof rawMessage !== 'object' || typeof rawMessage.type !== 'string') {
          log('수신된 메시지 형식이 올바르지 않거나 type 속성이 없습니다:', rawMessage);
          setErrorState('수신 메시지 형식/타입 오류');
          return;
        }

        // 이제 rawMessage.type이 string임을 확신할 수 있으므로, 이를 기반으로 타입 단언을 시도합니다.
        const messageType = rawMessage.type as WebSocketMessageType;
        const parsedMessage = rawMessage as ReceivedWebSocketMessage; // 일단 ReceivedWebSocketMessage로 단언
        setLastMessage(parsedMessage); // UI 업데이트용

        switch (messageType) {
          case WebSocketMessageType.RECEIVE_AI_MESSAGE:
          case WebSocketMessageType.RECEIVE_AI_RECOMMENDATION: {
            // 이 case 블록에 들어왔다면, parsedMessage는 ReceiveAiTextMessage 또는 ReceiveAiRecommendationMessage 타입이어야 함
            const payload = parsedMessage.payload as ReceiveAiChatMessagePayload | undefined;
            if (payload && payload.chatMessage) {
              addMessage(payload.chatMessage);
              if (payload.chatMessage.sender === SenderType.AI) {
                setIsAiTyping(false);
              }
            } else {
              log('RECEIVE_AI_MESSAGE/RECOMMENDATION 페이로드가 올바르지 않습니다.', parsedMessage);
            }
            break;
          }
          case WebSocketMessageType.AI_TYPING_START:
            setIsAiTyping(true);
            break;
          case WebSocketMessageType.AI_TYPING_END:
            setIsAiTyping(false);
            break;
          case WebSocketMessageType.COUNSELING_SESSION_STARTED: {
            const payload = parsedMessage.payload as CounselingSessionStartedPayload | undefined;
            if (payload && payload.sessionId) {
              setCurrentSessionId(payload.sessionId);
              setCurrentSessionStatus(CounselingStatus.ACTIVE);
              log('상담 세션 시작됨:', payload.sessionId);
            } else {
              log('COUNSELING_SESSION_STARTED 페이로드가 올바르지 않습니다.', parsedMessage);
            }
            break;
          }
          case WebSocketMessageType.COUNSELING_SESSION_ENDED: {
            const payload = parsedMessage.payload as CounselingSessionEndedPayload | undefined;
            const { currentSessionId: storeSessionId } = useCounselingStore.getState();
            if (payload && payload.sessionId && storeSessionId === payload.sessionId) {
              setCurrentSessionStatus(CounselingStatus.ENDED);
            }
            log('상담 세션 종료됨:', payload?.sessionId);
            break;
          }
          case WebSocketMessageType.ERROR: {
            const payload = parsedMessage.payload as ErrorPayload | undefined;
            log('서버로부터 에러 메시지 수신:', payload);
            const errorMessage = payload?.message || '알 수 없는 서버 오류';
            setErrorState(errorMessage);
            setStoreError(errorMessage);
            break;
          }
          default:
            // TypeScript는 이 default 케이스에 도달하는 `messageType`이 없다고 가정할 수 있도록
            // 모든 WebSocketMessageType 값을 case에서 처리해야 합니다. (또는 명시적 unknown 처리)
            log('알 수 없는 메시지 타입 수신:', messageType, parsedMessage);
        }
      } catch (e) {
        log('메시지 처리 중 오류 발생:', e);
        setErrorState('수신 메시지 처리 실패');
      }
    };

    socket.onerror = (event) => {
      log('웹소켓 에러 발생:', event);
      setErrorState('웹소켓 연결 오류');
      setWebsocketStatus('error');
      // 여기서 재연결 로직을 트리거할 수 있음 (onclose에서 처리)
    };

    socket.onclose = (event) => {
      log('웹소켓 연결 종료. 코드:', event.code, '이유:', event.reason);
      setWebsocketStatus('disconnected');
      socketRef.current = null;

      if (event.wasClean) {
        log('연결이 정상적으로 종료되었습니다.');
      } else {
        log('연결이 비정상적으로 끊어졌습니다. 재연결 시도...');
        if (retryCount < reconnectAttempts) {
          setTimeout(() => {
            setRetryCount(retryCount + 1);
            connect();
          }, reconnectInterval);
        } else {
          log('최대 재연결 시도 횟수 초과.');
          setErrorState('웹소켓 재연결 실패');
          setStoreError('웹소켓 연결에 실패했습니다. 새로고침하거나 나중에 다시 시도해주세요.');
        }
      }
    };
  }, [
    url,
    setWebsocketStatus,
    log,
    addMessage,
    setIsAiTyping,
    setCurrentSessionId,
    setCurrentSessionStatus,
    setStoreError,
    reconnectAttempts,
    reconnectInterval,
    retryCount,
  ]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      log('웹소켓 연결을 수동으로 종료합니다.');
      socketRef.current.close(1000, 'User requested disconnect'); // 1000: Normal Closure
      socketRef.current = null;
      setWebsocketStatus('disconnected');
    }
  }, [log, setWebsocketStatus]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    // 컴포넌트 언마운트 시 웹소켓 연결 정리
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]); // url이 변경되면 재연결을 위해 connect, disconnect도 포함

  const sendMessage = useCallback(
    <T extends WebSocketMessageType>(type: T, payload: SentWebSocketMessage['payload']) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const messageToSend: BaseWebSocketMessage<T, typeof payload> = {
          type,
          payload,
          timestamp: Date.now(),
          sessionId: sessionId || undefined, // 현재 세션 ID 포함
        };
        try {
          socketRef.current.send(JSON.stringify(messageToSend));
          log('메시지 전송:', messageToSend);
        } catch (e) {
          log('메시지 전송 실패:', e);
          setErrorState('메시지 전송 실패');
        }
      } else {
        log('웹소켓이 연결되어 있지 않아 메시지를 전송할 수 없습니다.');
        setErrorState('웹소켓 연결 끊김');
        setWebsocketStatus('disconnected'); // 연결 안됨을 명확히
        // 연결이 끊겼을 때 재연결 시도 또는 사용자 알림
        if (retryCount < reconnectAttempts) {
          log('메시지 전송 실패로 인한 재연결 시도');
          connect();
        }
      }
    },
    [sessionId, log, setWebsocketStatus, connect, retryCount, reconnectAttempts]
  );

  const isConnected = socketRef.current?.readyState === WebSocket.OPEN;

  return { sendMessage, isConnected, lastMessage, error, connect, disconnect };
};
