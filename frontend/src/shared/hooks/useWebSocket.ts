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
  ReceiveAiChatMessagePayload,
  CounselingSessionStartedPayload,
  CounselingSessionEndedPayload,
  ErrorPayload,
  SendUserMessagePayload, // 사용자 메시지 전송을 위한 페이로드 타입
} from '@/shared/types/websockets';
import { ChatMessage, SenderType, MessageType } from '@/entities/counseling/model/types';
import { WEBSOCKET_BASE_URL } from '@/shared/config'; // 웹소켓 기본 URL 임포트

/**
 * useWebSocket 훅의 설정 옵션 인터페이스
 */
interface UseWebSocketOptions {
  /** 현재 상담 세션 ID (`couns_id`). 이 ID를 기반으로 웹소켓 URL이 동적으로 생성됩니다. */
  counsId: string | null;
  /** 웹소켓 연결이 자동으로 시작되어야 하는지 여부 (기본값: true). `counsId`가 있을 때만 자동 연결. */
  autoConnect?: boolean;
  /** 재연결 시도 횟수 (기본값: 3) */
  reconnectAttempts?: number;
  /** 재연결 시도 간격 (ms, 기본값: 3000) */
  reconnectInterval?: number;
  /** 디버그 로그 출력 여부 */
  debug?: boolean;
  /** 웹소켓 연결 시 전달할 인증 토큰 (옵션) */
  authToken?: string | null;
}

/**
 * useWebSocket 훅의 반환 값 인터페이스
 */
interface UseWebSocketReturn {
  /** 서버로 사용자 채팅 메시지를 전송하는 함수 */
  sendUserMessage: (payload: SendUserMessagePayload) => void; // SendUserMessagePayload['payload'] 대신 SendUserMessagePayload 직접 사용
  /** 현재 웹소켓 연결 상태 */
  isConnected: boolean;
  /** 마지막으로 수신된 메시지 (디버깅 또는 특정 UI 로직에 사용 가능) */
  lastReceivedMessage: ReceivedWebSocketMessage | null;
  /** 웹소켓 관련 에러 객체 또는 메시지 */
  error: string | null;
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
  counsId,
  autoConnect = true,
  reconnectAttempts = DEFAULT_RECONNECT_ATTEMPTS,
  reconnectInterval = DEFAULT_RECONNECT_INTERVAL,
  debug = false,
  authToken = null,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const socketRef = useRef<WebSocket | null>(null);
  const [lastReceivedMessage, setLastReceivedMessage] = useState<ReceivedWebSocketMessage | null>(null);
  const [error, setErrorState] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Zustand 스토어 액션 가져오기
  const {
    addMessage,
    setIsAiTyping,
    setWebsocketStatus,
    setCurrentSessionId,
    setIsCurrentSessionClosed,
    setError: setStoreError,
  } = useCounselingStore();

  const log = useCallback(
    (...args: any[]) => {
      if (debug) {
        console.log('[DamDam WebSocket]', ...args);
      }
    },
    [debug]
  );

  const connect = useCallback(() => {
    if (!counsId) {
      log('counsId가 제공되지 않아 웹소켓을 연결할 수 없습니다.');
      setWebsocketStatus('idle');
      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      log('이미 연결되어 있습니다.', counsId);
      return;
    }

    let socketUrl = `${WEBSOCKET_BASE_URL}/counsels/${counsId}/chat`;
    if (authToken) {
      socketUrl += `?token=${authToken}`;
      log('인증 토큰과 함께 웹소켓 연결 시도 중...', socketUrl);
    } else {
      log('웹소켓 연결 시도 중...', socketUrl);
    }

    setWebsocketStatus('connecting');
    setErrorState(null);
    setStoreError(null);

    try {
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        log('웹소켓 연결 성공! Session ID:', counsId);
        setWebsocketStatus('connected');
        setErrorState(null);
        setRetryCount(0);
        setIsCurrentSessionClosed(false);
      };

      socket.onmessage = (event) => {
        try {
          if (typeof event.data !== 'string') {
            log('수신된 데이터가 문자열이 아닙니다:', event.data);
            setErrorState('수신 데이터 형식 오류');
            return;
          }
          // JSON 파싱 후 타입을 명시적으로 ReceivedWebSocketMessage로 지정
          const rawMessage = JSON.parse(event.data) as ReceivedWebSocketMessage;
          log('메시지 수신:', rawMessage);

          // rawMessage.type이 WebSocketMessageType 중 하나인지 확인 (타입 가드 역할도 겸함)
          if (
            !rawMessage ||
            typeof rawMessage.type !== 'string' ||
            !Object.values(WebSocketMessageType).includes(rawMessage.type as WebSocketMessageType)
          ) {
            log('수신된 메시지 형식이 올바르지 않거나 type 속성이 유효하지 않습니다:', rawMessage);
            setErrorState('수신 메시지 형식/타입 오류');
            return;
          }

          setLastReceivedMessage(rawMessage);
          const messageType = rawMessage.type as WebSocketMessageType; // 여기서 단언

          switch (
            messageType // 단언된 messageType 사용
          ) {
            case WebSocketMessageType.RECEIVE_AI_MESSAGE:
            case WebSocketMessageType.RECEIVE_AI_RECOMMENDATION: {
              const payload = rawMessage.payload as ReceiveAiChatMessagePayload | undefined;
              if (payload?.chatMessage) {
                addMessage(payload.chatMessage);
                if (payload.chatMessage.sender === SenderType.AI) {
                  setIsAiTyping(false);
                }
              } else {
                log('RECEIVE_AI_MESSAGE 페이로드가 올바르지 않습니다.', rawMessage);
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
              const payload = rawMessage.payload as CounselingSessionStartedPayload | undefined;
              if (payload?.sessionId === counsId) {
                setCurrentSessionId(payload.sessionId);
                setIsCurrentSessionClosed(false);
                log('상담 세션 시작됨 (서버 이벤트):', payload.sessionId);
              } else {
                log('다른 세션에 대한 시작 이벤트 수신 또는 페이로드 오류', rawMessage);
              }
              break;
            }
            case WebSocketMessageType.COUNSELING_SESSION_ENDED: {
              const payload = rawMessage.payload as CounselingSessionEndedPayload | undefined;
              if (payload?.sessionId === counsId) {
                setIsCurrentSessionClosed(true);
                log('상담 세션 종료됨 (서버 이벤트):', payload.sessionId);
              } else {
                log('다른 세션에 대한 종료 이벤트 수신 또는 페이로드 오류', rawMessage);
              }
              break;
            }
            case WebSocketMessageType.ERROR: {
              const payload = rawMessage.payload as ErrorPayload | undefined;
              const errorMessage = payload?.message || '알 수 없는 웹소켓 서버 오류';
              log('웹소켓 서버 에러:', errorMessage, rawMessage);
              setErrorState(errorMessage);
              setStoreError(errorMessage);
              break;
            }
            default: // 철저한 타입 검사를 위해 default에서 never 타입 체크 (선택적)
              // const _exhaustiveCheck: never = messageType;
              log('알 수 없는 메시지 타입 수신:', messageType, rawMessage);
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
      };

      socket.onclose = (event) => {
        log('웹소켓 연결 종료. 코드:', event.code, '이유:', event.reason, '정상 종료:', event.wasClean);
        setWebsocketStatus('disconnected');
        socketRef.current = null;

        if (!event.wasClean && autoConnect && counsId) {
          if (retryCount < reconnectAttempts) {
            log(`재연결 시도 (${retryCount + 1}/${reconnectAttempts})...`, reconnectInterval, 'ms 후');
            setTimeout(() => {
              setRetryCount(retryCount + 1);
              connect();
            }, reconnectInterval);
          } else {
            log('최대 재연결 시도 횟수 초과.');
            const finalError = '웹소켓 재연결에 최종 실패했습니다.';
            setErrorState(finalError);
            setStoreError(finalError);
          }
        }
      };
    } catch (err) {
      log('WebSocket 생성자에서 오류 발생:', err);
      setErrorState('웹소켓 초기화 실패');
      setWebsocketStatus('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    counsId,
    authToken,
    autoConnect,
    reconnectAttempts, // connect 함수 내부에서 retryCount를 직접 핸들링하므로 의존성 배열에서 제외 가능
    reconnectInterval,
    // log, // log 함수는 debug에만 의존하므로, 최적화를 위해 분리 가능 (또는 외부 정의)
    // setWebsocketStatus, setIsAiTyping, addMessage, setCurrentSessionId, setIsCurrentSessionClosed, setStoreError, // Zustand 액션들은 일반적으로 안정적이므로 의존성 배열에서 제외 가능
    // --> 하지만 명시적으로 모든 외부 스코프 의존성을 넣어주는 것이 규칙에 더 부합할 수 있음. 우선은 유지.
    // --> connect 함수를 useCallback의 의존성 배열에서 제거하고 useEffect 내부에서 직접 호출하는 패턴도 고려 가능.
    // 현재 상태에서는 connect 함수를 useCallback으로 감쌌으므로, 그 의존성을 명시하는 것이 원칙.
    debug, // log 함수의 의존성
    useCounselingStore, // 스토어 자체보다는 개별 액션을 넣는 것이 더 정밀하지만, 일단 스토어 전체를 넣는 방식도 흔함.
    // 정확히는 get()이나 subscribe()를 사용하지 않는다면, 반환된 액션 함수들은 안정적(stable) 참조를 가짐.
  ]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      log('웹소켓 연결을 수동으로 종료합니다.', counsId);
      socketRef.current.close(1000, 'User requested disconnect');
    }
  }, [log, counsId]);

  useEffect(() => {
    if (autoConnect && counsId) {
      connect();
    }
    // 컴포넌트 언마운트 시 웹소켓 연결 정리
    return () => {
      disconnect();
    };
  }, [autoConnect, counsId, connect, disconnect]); // connect, disconnect를 의존성 배열에 추가

  const sendUserMessage = useCallback(
    (payload: SendUserMessagePayload) => {
      // 파라미터 타입 수정
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const messageToSend: BaseWebSocketMessage<WebSocketMessageType.SEND_USER_MESSAGE, SendUserMessagePayload> = {
          type: WebSocketMessageType.SEND_USER_MESSAGE,
          payload,
          timestamp: Date.now(),
        };
        try {
          socketRef.current.send(JSON.stringify(messageToSend));
          log('사용자 메시지 전송:', messageToSend);
        } catch (e) {
          log('메시지 전송 실패:', e);
          setErrorState('메시지 전송 실패');
        }
      } else {
        log('웹소켓이 연결되어 있지 않아 사용자 메시지를 전송할 수 없습니다.');
        setErrorState('웹소켓 연결 끊김 (메시지 전송 시도)');
      }
    },
    [log] // counsId는 connect/disconnect에서 이미 관리되므로 직접적인 의존성 필요X
  );

  const isConnected = socketRef.current?.readyState === WebSocket.OPEN;

  return { sendUserMessage, isConnected, lastReceivedMessage, error, connect, disconnect };
};
