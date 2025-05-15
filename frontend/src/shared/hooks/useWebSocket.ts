/**
 * @file useWebSocket.ts
 * 웹소켓 연결 및 STOMP 프로토콜 기반 메시지 송수신을 관리하는 커스텀 React 훅입니다.
 * FSD 아키텍처에 따라 범용적인 훅이므로 `shared` 레이어의 `hooks`에 위치합니다.
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
  /** 재연결 시도 딜레이 (ms, 기본값: 5000). 0이면 자동 재연결 비활성화. */
  reconnectDelay?: number;
  /** 디버그 로그 출력 여부 */
  debug?: boolean;
  /** 현재 상담 세션 상태 (종료 여부) */
  isSessionClosed?: boolean; // props로 isClosed를 받도록 수정
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
  lastReceivedStompMessage: StompMessage | null; // WebSocket 메시지 대신 STOMP 메시지
  /** 웹소켓/STOMP 관련 에러 메시지 */
  error: string | null;
  /** 웹소켓 연결을 수동으로 시작하는 함수 */
  connect: () => void;
  /** 웹소켓 연결을 수동으로 종료하는 함수 */
  disconnect: () => void;
  /** 현재 세션이 종료되었는지 여부 (props로 받은 값) */
  isSessionClosed: boolean;
}

const DEFAULT_RECONNECT_DELAY = 5000; // 기본 재연결 딜레이

/**
 * STOMP 기반 웹소켓 통신을 위한 커스텀 훅입니다.
 *
 * @param {UseWebSocketOptions} options - 웹소켓 설정 옵션
 * @returns {UseWebSocketReturn} 웹소켓 통신을 위한 함수 및 상태
 * @example
 * const { sendUserMessage, isConnected, error } = useWebSocket({ counsId: '123', debug: true });
 */
export const useWebSocket = ({
  counsId,
  autoConnect = true,
  reconnectDelay = DEFAULT_RECONNECT_DELAY,
  debug = false,
  isSessionClosed = false, // 옵션에서 isClosed 받음
}: UseWebSocketOptions): UseWebSocketReturn => {
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<ReturnType<Client['subscribe']> | null>(null);
  const currentCounsIdRef = useRef<string | null>(counsId); // Ref를 사용하여 counsId 관리
  const [isConnected, setIsConnected] = useState(false);
  const [lastReceivedStompMessage, setLastReceivedStompMessage] = useState<StompMessage | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null); // 에러 상태명 변경 (기존 error와 혼동 방지)

  const { token } = useAuthStore();
  // counselingStore에서 필요한 상태와 액션을 가져옵니다.
  // messages 배열은 messageOrder를 계산하기 위해, addMessage는 수신 메시지 처리를 위해 필요합니다.
  const {
    messages: storeMessages, // messageOrder 계산을 위해 현재 메시지 목록을 가져옵니다.
    addMessage: addMessageToStore,
    setWebsocketStatus,
    setIsAiTyping,
    setError: setStoreError, // 스토어의 에러 설정 함수
  } = useCounselingStore();

  /**
   * 디버그 메시지를 콘솔에 로깅합니다.
   * @param {...any[]} args - 로깅할 메시지들
   */
  const log = useCallback(
    (...args: any[]) => {
      if (debug) {
        console.log(`[DamDam STOMP WebSocket - ${counsId || 'N/A'}]`, ...args);
      }
    },
    [debug, counsId]
  );

  // STOMP 메시지 본문 파싱 함수 (connect 및 onStompMessage보다 먼저 선언)
  const parseStompMessageBody = useCallback(
    (stompMessage: StompMessage): ReceivedServerMessage | null => {
      try {
        const body = JSON.parse(stompMessage.body);
        // 서버 메시지 구조에 대한 최소한의 검증 (필요에 따라 추가 검증 로직 구현)
        if (body && typeof body.message === 'string' && body.sender) {
          return body as ReceivedServerMessage;
        }
        log('수신된 STOMP 메시지 body가 예상과 다릅니다:', body);
        return null;
      } catch (e) {
        log('STOMP 메시지 body 파싱 오류:', e, 'Original body:', stompMessage.body);
        setErrorState('수신 메시지 파싱 실패');
        // setStoreError('수신 메시지 파싱 실패'); // 필요시 스토어 에러도 업데이트
        return null;
      }
    },
    [log, setErrorState]
  ); // setErrorState는 의존성으로 추가 (로컬 에러 상태 업데이트용)

  // STOMP 메시지 수신 처리 콜백 (connect보다 먼저 선언)
  const onStompMessage = useCallback(
    (stompMessage: StompMessage) => {
      if (debug) {
        log('STOMP 메시지 수신:', stompMessage.body);
      }
      setLastReceivedStompMessage(stompMessage); // 전체 STOMP 메시지 객체 저장

      const parsedBody = parseStompMessageBody(stompMessage);
      if (parsedBody) {
        if (debug) {
          log('파싱된 서버 메시지:', parsedBody);
        }

        // AI 응답 시작/종료 처리 (isAiTyping은 AI 메시지인 경우에만 해당)
        if (parsedBody.sender === SenderType.AI) {
          if (parsedBody.messageType === MessageType.TEXT && parsedBody.message === 'AI_TYPING_START') {
            setIsAiTyping(true);
            return; // 타이핑 시작 메시지는 스토어에 추가하지 않음
          }
          if (parsedBody.messageType === MessageType.TEXT && parsedBody.message === 'AI_TYPING_END') {
            setIsAiTyping(false);
            return; // 타이핑 종료 메시지는 스토어에 추가하지 않음
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
          error: undefined, // 기본값으로 undefined 설정
        };

        // AI가 보낸 메시지 내용이 "Error:"로 시작하면 에러 타입으로 간주 (기존 로직 유지 또는 개선)
        if (
          parsedBody.sender === SenderType.AI &&
          chatMessage.messageType === MessageType.TEXT &&
          parsedBody.message.startsWith('Error:')
        ) {
          chatMessage.messageType = MessageType.ERROR; // 메시지 타입을 에러로 변경
          chatMessage.error = {
            code: 'AI_RESPONSE_ERROR', // 예시 에러 코드
            message: parsedBody.message.substring(6).trim(), // "Error: " 접두어 제거
          };
        }
        // 또는 서버가 명시적으로 MessageType.ERROR와 함께 error 객체를 보낸다면 아래와 같이 처리
        else if (parsedBody.messageType === MessageType.ERROR && parsedBody.error) {
          chatMessage.messageType = MessageType.ERROR; // 이미 ERROR 타입일 것임
          chatMessage.error = parsedBody.error as ErrorPayload; // 서버에서 error 객체를 직접 제공한다고 가정
        }

        if (debug) {
          log('ChatMessage 변환 및 스토어 추가:', chatMessage);
        }
        addMessageToStore(chatMessage);
      } else {
        if (debug) {
          log('STOMP 메시지 본문 파싱 실패 또는 유효하지 않은 메시지 형식');
        }
      }
    },
    [debug, addMessageToStore, setIsAiTyping, log, parseStompMessageBody, currentCounsIdRef] // 의존성 배열에 log, parseStompMessageBody, currentCounsIdRef 추가
  );

  // STOMP 에러 처리 콜백 (connect보다 먼저 선언)
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

  const disconnect = useCallback(() => {
    if (debug) {
      log('STOMP 구독 해제 시도...', subscriptionRef.current?.id);
    }
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
        log('STOMP 구독이 성공적으로 해제되었습니다.');
      } catch (subError) {
        log('STOMP 구독 해제 중 오류 발생:', subError);
        // 여기서 추가적인 에러 처리를 할 수 있습니다.
        // 예를 들어, setStoreError나 setErrorState를 호출할 수 있지만,
        // 보통 unsubscribe 실패는 치명적인 오류는 아닐 수 있습니다.
      }
      subscriptionRef.current = null;
    }

    const handleDeactivationSuccess = () => {
      setIsConnected(false);
      setWebsocketStatus('disconnected');
      log('STOMP 연결이 성공적으로 해제되었습니다.');
    };

    const handleDeactivationError = (e: any) => {
      setIsConnected(false); // 실패 시에도 연결 상태는 false로 간주
      setWebsocketStatus('disconnected'); // 또는 'error' 상태로 설정할 수 있음
      const errorMessage = `STOMP 연결 해제 중 오류: ${e?.message || String(e)}`;
      setErrorState(errorMessage);
      setStoreError(errorMessage);
      log('STOMP 연결 해제 중 오류 발생:', e);
    };

    if (stompClientRef.current?.active) {
      log('STOMP 클라이언트 연결을 비활성화합니다.', currentCounsIdRef.current);
      stompClientRef.current.deactivate().then(handleDeactivationSuccess).catch(handleDeactivationError);
    } else {
      log('STOMP 클라이언트가 활성 상태가 아니므로 deactivation을 건너뛰니다.');
      // 이미 연결되지 않은 상태이므로 상태를 직접 업데이트
      setIsConnected(false);
      setWebsocketStatus('disconnected');
    }
  }, [debug, log, setWebsocketStatus, setErrorState, setStoreError]); // stompClientRef, subscriptionRef는 ref 객체이므로 의존성 배열에 불필요

  // 웹소켓 연결 함수 (useEffect보다 먼저 선언)
  const connect = useCallback(() => {
    if (!counsId) {
      log('상담 ID가 없어 STOMP 연결을 시도할 수 없습니다.');
      return;
    }
    if (isSessionClosed) {
      log('이미 종료된 세션이므로 STOMP 연결을 시도하지 않습니다.');
      return;
    }
    if (!token) {
      log('인증 토큰이 없어 STOMP 연결을 시도할 수 없습니다.');
      // 필요시 setErrorState 또는 setStoreError 호출
      return;
    }

    if (stompClientRef.current?.active) {
      log('이미 STOMP 클라이언트가 활성화되어 있습니다. 재연결하지 않습니다.');
      return;
    }

    log('STOMP 연결 시도 중...', `URL: ${WEBSOCKET_BASE_URL}, Host: ${STOMP_HOST}`);
    setWebsocketStatus('connecting');

    const stompClient = new Client({
      brokerURL: WEBSOCKET_BASE_URL, // 실제 WebSocket 서버 URL
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        host: STOMP_HOST, // STOMP virtual host
      },
      debug: (str) => {
        if (debug) {
          log('[STOMP LIB DEBUG]', str);
        }
      },
      reconnectDelay,
      heartbeatIncoming: 10000, // 서버로부터 10초마다 하트비트 예상
      heartbeatOutgoing: 10000, // 클라이언트가 10초마다 하트비트 전송
      onConnect: (frame: Frame) => {
        setIsConnected(true);
        setWebsocketStatus('connected');
        setErrorState(null); // 연결 성공 시 에러 상태 초기화
        setStoreError(null);
        log(`STOMP 연결 성공! Session ID: ${counsId}`, 'Frame:', frame);

        // 기존 구독 해제 (재연결 시 중복 구독 방지)
        if (subscriptionRef.current) {
          try {
            subscriptionRef.current.unsubscribe();
            log('기존 STOMP 구독 해제됨.');
          } catch (e) {
            log('기존 STOMP 구독 해제 중 오류:', e);
          }
          subscriptionRef.current = null;
        }

        // 새 구독 ID 생성
        const subscriptionId = `sub-${counsId}`;
        const receiptId = `sub-${counsId}`; // receipt은 필수는 아니지만, 구독 성공 여부 확인용으로 사용 가능
        const destination = `/sub/counsels/${counsId}/chat`;

        log(`STOMP 구독 시도. Destination: ${destination}, ID: ${subscriptionId}, Receipt: ${receiptId}`);
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
            } // 구독 시 헤더에 토큰 포함
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
        // stompClientRef.current?.deactivate(); // 에러 시 연결 비활성화
      },
      onWebSocketClose: (event: CloseEvent) => {
        log('WebSocket 연결이 닫혔습니다.', `Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`);
        setIsConnected(false);
        setWebsocketStatus('disconnected');
        // 자동 재연결은 Client 생성자의 reconnectDelay 옵션이 처리
        // 명시적으로 stompClientRef.current = null 처리하지 않음 (라이브러리가 내부적으로 관리)
        if (!event.wasClean && !stompClientRef.current?.active && reconnectDelay > 0) {
          log('비정상 종료 감지, STOMP 클라이언트가 재연결을 시도합니다.');
        } else if (event.wasClean) {
          log('정상적인 WebSocket 연결 종료.');
        }
      },
      beforeConnect: () => {
        log('STOMP 연결 직전 (beforeConnect).');
        if (!token) {
          log('토큰이 없어 연결을 중단합니다.');
          // 이 경우 stompClient.activate()를 호출하지 않도록 처리 필요 (여기서는 Client 생성자에서 바로 activate되므로 외부에서 제어)
          // connect() 함수 초반에 token 유무를 확인하므로 이 콜백까지 오지 않을 수 있음.
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
    isSessionClosed, // 의존성 배열에 isSessionClosed 추가
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
  }, [counsId, token, autoConnect, isSessionClosed, debug, connect, disconnect, log]); // log, connect, disconnect 의존성 유지
  // connect, disconnect, log 함수가 useCallback으로 올바르게 메모이징되고,
  // 이 함수들의 내부 의존성(counsId, token 등 핵심값)이 변경될 때만 재생성되어야 합니다.
  // 만약 이 함수들이 상위에서 props로 내려온다면, 상위에서도 useCallback 등으로 안정화 필요.

  /**
   * 사용자 채팅 메시지를 STOMP 브로커로 발행합니다.
   * @param {StompSendUserMessagePayload} payload - 전송할 메시지 내용 (isVoice, message, messageOrder 포함)
   */
  const sendUserMessage = useCallback(
    (payload: StompSendUserMessagePayload) => {
      if (!stompClientRef.current?.active || !currentCounsIdRef.current || isSessionClosed) {
        const errorMessage = `STOMP 클라이언트가 활성화되지 않았거나 상담 ID가 없거나 세션이 종료되어 메시지를 보낼 수 없습니다. 연결 상태: ${
          stompClientRef.current?.active
        }, 상담 ID: ${currentCounsIdRef.current}, 세션 종료: ${isSessionClosed}`;
        setErrorState(errorMessage);
        setStoreError(errorMessage); // 스토어에도 에러 상태 업데이트
        if (debug) {
          log(`sendUserMessage 호출 실패: ${errorMessage}`);
        }
        return;
      }

      // 현재 스토어에 있는 USER 메시지 개수를 세어 다음 messageOrder 결정
      const currentUserMessagesCount = storeMessages.filter((msg) => msg.sender === SenderType.USER).length;
      const nextMessageOrder = currentUserMessagesCount + 1;

      const messageToSend = {
        isVoice: payload.isVoice,
        message: payload.text, // API 명세에 따르면 서버는 'message' 필드로 내용을 기대할 수 있습니다. 로그에서는 'message' 사용.
        messageOrder: nextMessageOrder, // 수정된 messageOrder 사용
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
        // 메시지 전송 성공 시 입력 필드 초기화는 보통 UI 컴포넌트(SendMessageForm)에서 담당합니다.
        // useCounselingStore의 setNewMessageInput('')를 여기서 직접 호출할 필요는 없을 수 있습니다.
      } catch (e: any) {
        const errorMessage = `STOMP 메시지 발행 중 오류: ${e?.message || String(e)}`;
        setErrorState(errorMessage);
        setStoreError(errorMessage);
        if (debug) {
          console.error(`[DamDam STOMP WebSocket - ${currentCounsIdRef.current}] STOMP 메시지 발행 중 오류:`, e);
        }
      }
    },
    [token, debug, isSessionClosed, storeMessages, setStoreError, log] // storeMessages, setStoreError, log 의존성 추가
  );

  return {
    sendUserMessage,
    isConnected,
    lastReceivedStompMessage,
    error: errorState, // 변경된 에러 상태 반환
    connect,
    disconnect,
    isSessionClosed, // isSessionClosed 상태 반환 추가
  };
};

// 예시: 실제 서버에서 오는 메시지 타입 정의 (ReceivedServerMessage 구체화 필요)
// interface ServerChatMessagePayload {
//   chatMessage: ChatMessage;
//   // ... 기타 필드
// }
//
// interface ServerErrorPayload {
//   code: string;
//   description: string;
//   // ... 기타 필드
// }
//
// type ActualReceivedWebSocketMessage =
//   | BaseWebSocketMessage<WebSocketMessageType.RECEIVE_AI_MESSAGE, ServerChatMessagePayload>
//   | BaseWebSocketMessage<WebSocketMessageType.ERROR, ServerErrorPayload>
//   | ... ; // 기타 모든 수신 가능한 메시지 타입들
//
// // parseStompMessageBody 함수 내에서 위 ActualReceivedWebSocketMessage 타입으로 캐스팅/검증해야 합니다.
