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
  const currentCounsIdRef = useRef<string | null>(counsId); // useEffect에서 이전 counsId 비교용

  const [isConnected, setIsConnected] = useState(false);
  const [lastReceivedStompMessage, setLastReceivedStompMessage] = useState<StompMessage | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  const connectingRef = useRef(false); // 연결 시도 중 상태 플래그
  const disconnectingRef = useRef(false); // 연결 해제 시도 중 상태 플래그

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
        console.log(`[DamDam STOMP WebSocket - ${currentCounsIdRef.current || 'N/A'}]`, ...args);
      }
    },
    [debug] // currentCounsIdRef는 ref이므로 의존성 불필요
  );

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
          // onStompMessage 호출 시점의 currentCounsIdRef.current는 해당 구독이 생성된 counsId를 가리켜야 함.
          // stompClient가 재사용되거나 counsId가 매우 빠르게 변경되는 극단적인 경우를 대비해 메시지 자체에 counsId가 있다면 그걸 사용.
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

        log('ChatMessage 변환 및 스토어 추가:', chatMessage);
        addMessageToStore(chatMessage);
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
      } else if ('headers' in frameOrError) {
        // STOMP Frame
        errorMessage = frameOrError.headers?.message || 'STOMP 프로토콜 오류';
        log(`STOMP 프로토콜 에러 (${type}):`, frameOrError.headers, frameOrError.body);
      } else {
        // WebSocket Event or other error
        errorMessage = `WebSocket 오류 (${type})`;
        log(`WebSocket 오류 (${type}):`, frameOrError);
      }

      setErrorState(errorMessage);
      setStoreError(errorMessage);
      setIsConnected(false);
      setWebsocketStatus('error');
      connectingRef.current = false;
      // disconnectingRef는 disconnect 함수에서 관리
    },
    [log, setStoreError] // setErrorState, setIsConnected, setWebsocketStatus는 상태 변경 함수라 의존성 불필요
  );

  const disconnect = useCallback(async (): Promise<void> => {
    if (disconnectingRef.current || !stompClientRef.current) {
      log('이미 연결 해제 중이거나 STOMP 클라이언트가 없습니다.', {
        isDisconnecting: disconnectingRef.current,
        hasClient: !!stompClientRef.current,
      });
      // 클라이언트가 아예 없으면 상태 강제 업데이트 (이미 해제된 것으로 간주)
      if (!stompClientRef.current) {
        setIsConnected(false);
        setWebsocketStatus('disconnected');
        connectingRef.current = false; // 연결 시도 중이었다면 그것도 취소
      }
      return;
    }

    disconnectingRef.current = true;
    log('STOMP 연결 해제 시도...', `(구독 ID: ${subscriptionRef.current?.id})`);

    if (subscriptionRef.current) {
      try {
        // 구독 해제 시 헤더가 필요하다면 추가 (보통은 불필요)
        subscriptionRef.current.unsubscribe();
        log('STOMP 구독이 성공적으로 해제되었습니다.');
      } catch (subError) {
        log('STOMP 구독 해제 중 오류 발생:', subError);
        // 구독 해제 실패는 치명적이지 않을 수 있으므로 계속 진행
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
        handleStompError(errMsg, 'websocket'); // 에러 처리 함수 사용
      }
    } else {
      log('STOMP 클라이언트가 활성 상태가 아니므로 deactivate를 건너뛰니다.');
    }

    stompClientRef.current = null; // 클라이언트 참조 완전히 제거
    setIsConnected(false);
    setWebsocketStatus('disconnected');
    connectingRef.current = false; // 연결 시도 중이었다면 그것도 취소
    disconnectingRef.current = false;
    log('STOMP 연결 해제 완료됨.');
  }, [log, handleStompError]); // 의존성 배열에 handleStompError 추가

  const connect = useCallback(async (): Promise<void> => {
    const currentCid = currentCounsIdRef.current; // 현재 ref 값 (이 함수가 생성될 때의 counsId)

    if (!currentCid) {
      log('상담 ID가 없어 연결을 시도할 수 없습니다.');
      return;
    }
    if (isSessionClosed) {
      log('이미 종료된 세션이므로 연결을 시도하지 않습니다.');
      return;
    }
    if (!token) {
      log('인증 토큰이 없어 연결을 시도할 수 없습니다.');
      return;
    }

    if (connectingRef.current) {
      log('이미 연결 시도 중입니다. 중복 호출 방지.');
      return;
    }
    if (stompClientRef.current?.active && isConnected) {
      log('이미 STOMP 클라이언트가 활성화 및 연결되어 있습니다.');
      return;
    }

    connectingRef.current = true;
    log('STOMP 연결 시도 중...', `Target counsId: ${currentCid}`);
    setWebsocketStatus('connecting');
    setErrorState(null); // 새 연결 시도 시 이전 에러 초기화
    setStoreError(null);

    // 기존 클라이언트가 있다면 확실히 정리 후 진행 (disconnect는 내부적으로 disconnectingRef 사용)
    if (stompClientRef.current) {
      log('기존 STOMP 클라이언트 인스턴스가 존재하여 disconnect 먼저 호출');
      await disconnect(); // 이전 연결 및 상태 완전 정리
    }

    // disconnect 후에도 여전히 연결 시도 중이라면 (예: disconnect가 빠르게 실패)
    if (!connectingRef.current) {
      log('disconnect 과정에서 connectingRef가 false로 변경되어 연결 중단.');
      return;
    }

    const newStompClient = new Client({
      brokerURL: WEBSOCKET_BASE_URL,
      connectHeaders: { Authorization: `Bearer ${token}`, host: STOMP_HOST },
      debug: (str) => {
        if (debug) log('[STOMP LIB DEBUG]', str);
      },
      reconnectDelay, // 생성자 옵션 (기본값 0으로 설정됨)
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: (frame: Frame) => {
        setIsConnected(true);
        setWebsocketStatus('connected');
        connectingRef.current = false;
        log(`STOMP 연결 성공! Session ID: ${currentCid}`, 'Frame:', frame);

        if (subscriptionRef.current) {
          try {
            subscriptionRef.current.unsubscribe();
            log('onConnect: 중복 방지 - 기존 STOMP 구독 해제됨.');
          } catch (e) {
            log('onConnect: 기존 STOMP 구독 해제 중 오류:', e);
          }
          subscriptionRef.current = null;
        }

        // onConnect 시점의 currentCounsIdRef.current가 구독 대상 ID가 되어야 함.
        const актуальныйCounsId = currentCounsIdRef.current;
        if (!актуальныйCounsId) {
          log('onConnect: 구독 시점에 counsId가 없습니다. 구독하지 않습니다.');
          // 연결은 되었으나 구독 실패. 이 경우 disconnect 처리 필요할 수 있음.
          disconnect(); // 구독 실패 시 연결 유지 의미 없음
          return;
        }

        const subscriptionId = `sub-${актуальныйCounsId}-${Date.now()}`;
        const destination = `/sub/counsels/${актуальныйCounsId}/chat`;
        log(`STOMP 구독 시도. Dest: ${destination}, ID: ${subscriptionId}`);

        if (newStompClient.active) {
          subscriptionRef.current = newStompClient.subscribe(destination, onStompMessage, {
            id: subscriptionId,
            Authorization: `Bearer ${token}`,
          });
          log('STOMP 구독 성공.', `Sub ID: ${subscriptionRef.current?.id}`);
        } else {
          log('onConnect: STOMP 클라이언트가 활성 상태가 아니어서 구독할 수 없습니다.');
          connectingRef.current = false; // 확실히
          // 구독 실패시 연결 해제
          disconnect();
        }
      },
      onStompError: (frame: Frame) => handleStompError(frame, 'stomp'),
      onWebSocketError: (event: Event) => handleStompError(event, 'websocket'),
      onWebSocketClose: (event: CloseEvent) => {
        log('WebSocket 연결이 닫혔습니다.', `Code: ${event.code}, Reason: ${event.reason}, Clean: ${event.wasClean}`);
        setIsConnected(false);
        setWebsocketStatus('disconnected');
        connectingRef.current = false; // 연결 시도 중이었다면 해제

        if (!event.wasClean && !disconnectingRef.current) {
          // 비정상 종료이고, 우리가 직접 disconnect한 게 아니라면
          log('비정상적인 WebSocket 연결 종료. 외부 요인 가능성.');
          // reconnectDelay가 0이므로 라이브러리가 자동 재연결 시도 안함.
          // 필요시 여기서 에러 상태를 설정하거나, 상위 useEffect가 재연결을 결정하도록 함.
          setErrorState('WebSocket 연결이 비정상적으로 종료되었습니다.');
          setStoreError('WebSocket 연결이 비정상적으로 종료되었습니다.');
        }
      },
      beforeConnect: () => {
        log('STOMP 연결 직전 (beforeConnect).');
        if (!token) {
          log('토큰이 없어 연결을 중단합니다 (beforeConnect).');
          throw new Error('No token for STOMP connection'); // 연결 시도 중단
        }
      },
    });

    stompClientRef.current = newStompClient;
    try {
      newStompClient.activate();
    } catch (activationError: any) {
      const errMsg = `STOMP 클라이언트 활성화 중 즉각적인 오류 발생: ${activationError?.message || activationError}`;
      handleStompError(errMsg, 'activation');
      stompClientRef.current = null; // 실패 시 참조 제거
    }
  }, [
    // currentCounsIdRef는 ref이므로 의존성 배열에 넣지 않음. 대신 함수 내부에서 사용.
    // props로 받는 counsId, isSessionClosed, token 등은 useEffect에서 관리하며,
    // 이 함수(connect)는 해당 값들이 변경될 때 재생성되므로 최신 값을 사용.
    token,
    isSessionClosed,
    debug,
    reconnectDelay, // 이 값들은 거의 변경되지 않거나 고정값
    log,
    onStompMessage,
    handleStompError,
    disconnect, // 내부 콜백 및 함수들
  ]);

  useEffect(() => {
    const prevCounsId = currentCounsIdRef.current;
    currentCounsIdRef.current = counsId; // 현재 counsId prop 값을 ref에 업데이트

    const clientCurrentlyActive = stompClientRef.current?.active || false;
    const shouldConnect = autoConnect && counsId && token && !isSessionClosed;

    log('useEffect 실행:', {
      counsId,
      prevCounsId,
      shouldConnect,
      clientCurrentlyActive,
      isConnected,
      isConnecting: connectingRef.current,
      isDisconnecting: disconnectingRef.current,
    });

    if (shouldConnect) {
      // 상담 ID가 실제로 변경되었을 때 (이전 ID가 있었고 현재 ID와 다름)
      if (prevCounsId && prevCounsId !== counsId) {
        log(`useEffect: 상담 ID 변경 (${prevCounsId} -> ${counsId}). 재연결 로직 실행.`);
        // disconnect는 async 함수, connect도 async 함수
        // disconnect().then(() => {
        //   // disconnect 후에도 여전히 현재 counsId에 대한 연결이 필요하면 connect
        //   if (currentCounsIdRef.current === counsId && !connectingRef.current && !disconnectingRef.current) {
        //     log('useEffect: ID 변경 후 connect 호출');
        //     connect();
        //   }
        // });
        // 위의 then 체인보다, connect 함수 내부에서 이전 연결을 정리하도록 위임하는 것이 더 깔끔할 수 있음.
        // connect 함수는 이미 시작 부분에서 기존 연결(stompClientRef.current)이 있으면 disconnect하도록 수정됨.
        if (!connectingRef.current && !disconnectingRef.current) {
          connect();
        } else {
          log('useEffect: ID 변경, 그러나 현재 연결/해제 작업 중이므로 connect 호출 보류.');
        }
      }
      // 연결되어야 하는데, 현재 연결되어 있지 않고, 시도 중도 아닐 때
      else if (!clientCurrentlyActive && !isConnected && !connectingRef.current && !disconnectingRef.current) {
        log('useEffect: 조건 충족, 연결 안됨 -> connect() 호출');
        connect();
      } else {
        log('useEffect: 이미 연결/해제 작업 중이거나, 이미 연결되어 있거나, ID 변경 없음. 추가 connect 호출 안함.');
      }
    } else {
      // 연결되면 안 되는 경우
      if ((clientCurrentlyActive || isConnected) && !disconnectingRef.current) {
        log('useEffect: 연결 조건 미충족 및 현재 연결됨 -> disconnect() 호출');
        disconnect();
      } else {
        log('useEffect: 연결 조건 미충족, 이미 연결 해제 중이거나 연결되지 않음. 추가 disconnect 호출 안함.');
      }
    }

    // 컴포넌트 언마운트 시 또는 주요 의존성 변경 전 cleanup
    return () => {
      log(`useEffect cleanup 실행 ( 당시 counsId: ${counsId} )`);
      // 이미 해제 중이 아니라면, 그리고 클라이언트가 존재한다면 해제 시도
      if (stompClientRef.current && !disconnectingRef.current) {
        log('useEffect cleanup: 연결된 클라이언트가 있어 disconnect() 호출');
        disconnect(); // 이 disconnect는 disconnectingRef.current를 true로 설정
      } else {
        log('useEffect cleanup: 해제할 클라이언트 없거나 이미 해제 중.');
      }
    };
    // autoConnect, token, debug, reconnectDelay는 거의 변하지 않으므로, 주 의존성은 counsId, isSessionClosed.
    // connect, disconnect, log, handleStompError는 useCallback으로 메모이즈 되었으므로, 내부 의존성이 변경될 때만 바뀜.
  }, [counsId, isSessionClosed, autoConnect, token, debug, reconnectDelay, connect, disconnect, log, isConnected]);
  // isConnected를 의존성에 추가하여, isConnected 상태 변경 시에도 useEffect가 재평가되도록 함.

  const sendUserMessage = useCallback(
    (payload: StompSendUserMessagePayload) => {
      if (!stompClientRef.current?.active || !currentCounsIdRef.current || isSessionClosed) {
        const errorMessage = `STOMP 클라이언트가 활성화되지 않았거나 상담 ID가 없거나 세션이 종료되어 메시지를 보낼 수 없습니다. 연결 상태: ${
          stompClientRef.current?.active
        }, 상담 ID: ${currentCounsIdRef.current}, 세션 종료: ${isSessionClosed}`;
        setErrorState(errorMessage);
        setStoreError(errorMessage);
        log(`sendUserMessage 호출 실패: ${errorMessage}`);
        return;
      }

      const currentUserMessagesCount = storeMessages.filter((msg) => msg.sender === SenderType.USER).length;
      const nextMessageOrder = currentUserMessagesCount + 1;

      const messageToSend = {
        isVoice: payload.isVoice,
        message: payload.text,
        messageOrder: nextMessageOrder, // messageOrder 사용 유지
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
        log(`STOMP 메시지 발행:`, { destination, body: messageToSend });
      } catch (e: any) {
        const errorMessage = `STOMP 메시지 발행 중 오류: ${e?.message || String(e)}`;
        setErrorState(errorMessage);
        setStoreError(errorMessage);
        log(`STOMP 메시지 발행 중 오류:`, e);
      }
    },
    [token, debug, isSessionClosed, storeMessages, setStoreError, log] // currentCounsIdRef는 ref
  );

  log(`[useWebSocket TOP LEVEL EXEC] counsId: ${counsId}, HookInstanceID: ${Math.random().toString(36).substring(2)}`);

  return {
    sendUserMessage,
    isConnected,
    lastReceivedStompMessage,
    error: errorState,
    connect,
    disconnect,
    isSessionClosed, // prop으로 받은 isSessionClosed 상태 반환
  };
};
