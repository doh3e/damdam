/**
 * @file features/counseling/hooks/useWebSocket.ts
 * 웹소켓 연결 및 STOMP 프로토콜 기반 메시지 송수신을 관리하는 커스텀 React 훅입니다.
 * FSD 아키텍처에 따라 상담 기능에 특화된 훅이므로 `features/counseling` 슬라이스 내 `hooks`에 위치합니다.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, Frame, type IMessage as StompMessage, type StompSubscription } from '@stomp/stompjs';
import { useAuthStore } from '@/app/store/authStore';
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import { type ChatMessage, SenderType, MessageType } from '@/entities/counseling/model/types';
import { WEBSOCKET_BASE_URL, STOMP_HOST } from '@/shared/config';
import { type ReceivedServerMessage, type ErrorPayload } from '@/shared/types/websockets';

/**
 * @interface UseWebSocketOptions
 * @description useWebSocket 훅의 설정 옵션을 정의합니다.
 */
interface UseWebSocketOptions {
  /**
   * @property {string | null} counsId - 현재 상담 세션 ID.
   * 이 ID를 기반으로 STOMP 구독 및 발행 대상이 동적으로 생성됩니다.
   * `null`인 경우 연결 시도 또는 메시지 전송이 제한될 수 있습니다.
   */
  counsId: string | null;
  /**
   * @property {boolean} [autoConnect=true] - 웹소켓 연결을 자동으로 시작할지 여부.
   * `counsId`와 인증 토큰이 유효하고, 세션이 닫히지 않았을 때만 자동 연결을 시도합니다.
   */
  autoConnect?: boolean;
  /**
   * @property {number} [reconnectDelay=0] - 연결 실패 시 재연결 시도 딜레이 (밀리초 단위).
   * 기본값은 0으로, 자동 재연결을 시도하지 않음을 의미합니다 (수동 제어 우선).
   * STOMP 클라이언트 자체의 재연결 옵션과 별개로 훅 레벨에서 관리할 수 있습니다.
   */
  reconnectDelay?: number;
  /**
   * @property {boolean} [debug=false] - 디버그 로그를 콘솔에 출력할지 여부.
   * 개발 환경에서 상세한 웹소켓 통신 과정을 확인하는 데 유용합니다.
   */
  debug?: boolean;
  /**
   * @property {boolean} [isSessionClosed=false] - 현재 상담 세션이 종료되었는지 여부.
   * 세션이 종료된 경우 웹소켓 자동 연결을 시도하지 않거나, 메시지 수신/발신을 제한할 수 있습니다.
   */
  isSessionClosed?: boolean;
  /**
   * @property {(message: ReceivedServerMessage | ChatMessage) => void} [onMessageReceived] - 웹소켓을 통해 메시지를 수신했을 때 호출될 콜백 함수.
   * AI가 보낸 메시지 또는 에러 메시지 수신 시 호출됩니다. (사용자 메시지는 중복 처리를 위해 제외)
   * 이 콜백은 주로 UI 업데이트나 추가적인 클라이언트 로직 처리에 사용됩니다.
   */
  onMessageReceived?: (message: ReceivedServerMessage | ChatMessage) => void;
}

/**
 * @interface StompSendUserMessagePayload
 * @description 사용자가 서버로 채팅 메시지를 전송할 때 사용하는 STOMP 페이로드 타입입니다.
 */
export interface StompSendUserMessagePayload {
  /**
   * @property {number} messageOrder - 해당 상담 세션 내 사용자 메시지의 순서 번호.
   * 메시지 정렬 및 중복 방지에 사용될 수 있습니다.
   */
  messageOrder: number;
  /**
   * @property {boolean} isVoice - 해당 메시지가 음성 메시지인지 여부.
   * 음성 메시지 처리 로직에 사용됩니다.
   */
  isVoice: boolean;
  /**
   * @property {string} text - 전송할 메시지의 텍스트 내용.
   */
  text: string;
}

/**
 * @interface UseWebSocketReturn
 * @description useWebSocket 훅이 반환하는 객체의 타입을 정의합니다.
 * 웹소켓 연결 관리, 메시지 송수신, 상태 정보 등을 포함합니다.
 */
interface UseWebSocketReturn {
  /**
   * @property {(payload: StompSendUserMessagePayload) => void} sendUserMessage - 서버로 사용자 채팅 메시지를 전송하는 함수.
   * STOMP 프로토콜을 사용하여 지정된 대상(`destination`)으로 메시지를 발행합니다.
   */
  sendUserMessage: (payload: StompSendUserMessagePayload) => void;
  /**
   * @property {boolean} isConnected - 현재 웹소켓이 서버와 성공적으로 연결되었는지 여부.
   * UI에서 연결 상태를 표시하거나, 연결 기반 로직을 제어하는 데 사용됩니다.
   */
  isConnected: boolean;
  /**
   * @property {StompMessage | null} lastReceivedStompMessage - 마지막으로 수신된 원시 STOMP 메시지 객체.
   * 디버깅 또는 특정 고급 UI 로직(예: 메시지 수신 상태 표시)에 사용될 수 있습니다.
   */
  lastReceivedStompMessage: StompMessage | null;
  /**
   * @property {string | null} error - 웹소켓 또는 STOMP 통신 중 발생한 마지막 에러 메시지.
   * 에러 발생 시 사용자에게 알림을 표시하거나, 오류 복구 로직을 트리거하는 데 사용됩니다.
   */
  error: string | null;
  /**
   * @property {() => Promise<void>} connect - 웹소켓 연결을 수동으로 시작하는 함수.
   * `autoConnect`가 `false`이거나, 특정 조건에서 재연결이 필요할 때 사용합니다.
   * 연결 시도 중이거나 이미 연결된 경우 중복 실행되지 않습니다.
   */
  connect: () => Promise<void>;
  /**
   * @property {() => Promise<void>} disconnect - 웹소켓 연결을 수동으로 종료하는 함수.
   * 사용자가 상담을 종료하거나, 컴포넌트가 언마운트될 때 호출됩니다.
   * 연결 해제 시도 중이거나 이미 해제된 경우 중복 실행되지 않습니다.
   */
  disconnect: () => Promise<void>;
}

/**
 * @hook useWebSocket
 * @description STOMP 기반 웹소켓 통신을 위한 커스텀 React 훅입니다.
 * 상담 세션 ID(`counsId`)를 기반으로 동적인 구독 및 발행 경로를 설정하며,
 * 인증 토큰을 사용하여 STOMP 연결 헤더를 구성합니다.
 * 메시지 송수신, 연결 상태 관리, 오류 처리 등의 기능을 제공합니다.
 *
 * @param {UseWebSocketOptions} options - 웹소켓 설정을 위한 옵션 객체.
 * @returns {UseWebSocketReturn} 웹소KET 통신 관리 함수 및 상태를 포함하는 객체.
 */
export const useWebSocket = ({
  counsId,
  autoConnect = true,
  reconnectDelay = 0,
  debug = false,
  isSessionClosed = false,
  onMessageReceived,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const currentCounsIdRef = useRef<string | null>(counsId);
  const hookInstanceIdRef = useRef(Math.random().toString(36).substring(2, 12));

  const [isConnected, setIsConnected] = useState(false);
  const [lastReceivedStompMessage, setLastReceivedStompMessage] = useState<StompMessage | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  const connectingRef = useRef(false);
  const disconnectingRef = useRef(false);

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
        console.log(
          `[DamDam STOMP - ID: ${currentCounsIdRef.current || 'N/A'} - Inst: ${hookInstanceIdRef.current}]`,
          ...args
        );
      }
    },
    [debug]
  );

  const parseStompMessageBody = useCallback(
    (stompMessage: StompMessage): ReceivedServerMessage | null => {
      try {
        const body = JSON.parse(stompMessage.body);
        if (body && typeof body.sender !== 'undefined' && typeof body.message !== 'undefined') {
          return body as ReceivedServerMessage;
        }
        log('STOMP 메시지 body 구조가 예상과 다릅니다 (누락된 필드):', body);
        return null;
      } catch (e) {
        log('STOMP 메시지 body 파싱 오류:', e, '원본 body:', stompMessage.body);
        setErrorState('수신 메시지 파싱 실패');
        if (setStoreError) setStoreError('수신 메시지 파싱 실패');
        return null;
      }
    },
    [log, setStoreError]
  );

  const onStompMessage = useCallback(
    (stompMessage: StompMessage) => {
      log('STOMP 메세지 수신 Headers:', stompMessage.headers);
      log('STOMP 메시지 수신 Body:', stompMessage.body);
      setLastReceivedStompMessage(stompMessage);

      const parsedBody = parseStompMessageBody(stompMessage);
      if (!parsedBody) {
        log('STOMP 메시지 본문 파싱 실패 또는 유효하지 않은 메시지 형식, 처리를 중단합니다.');
        return;
      }

      log('파싱된 서버 메시지:', parsedBody);

      if (parsedBody.sender === SenderType.AI) {
        if (parsedBody.messageType === MessageType.TEXT && parsedBody.message === 'AI_TYPING_START') {
          setIsAiTyping(true);
          log('AI 타이핑 시작 감지');
          return;
        }
        if (parsedBody.messageType === MessageType.TEXT && parsedBody.message === 'AI_TYPING_END') {
          setIsAiTyping(false);
          log('AI 타이핑 종료 감지');
          return;
        }
      }

      const chatMessage: ChatMessage = {
        id: parsedBody.id || `${Date.now()}-${parsedBody.messageOrder || Math.random().toString(36).substring(2)}`,
        counsId: currentCounsIdRef.current!,
        sender: parsedBody.sender as SenderType,
        messageType: parsedBody.messageType || MessageType.TEXT,
        message: parsedBody.message,
        timestamp:
          typeof parsedBody.timestamp === 'string'
            ? parsedBody.timestamp
            : new Date(parsedBody.timestamp).toISOString(),
        tokenCount: parsedBody.tokenCount || 0,
        messageOrder: parsedBody.messageOrder || 0,
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
        log('[onStompMessage] ChatMessage 변환 (AI 또는 에러) 및 스토어 추가:', chatMessage);
        addMessageToStore(chatMessage);
        if (onMessageReceived) {
          log(
            '[onStompMessage] onMessageReceived 콜백 호출 시작, 전달 데이터:',
            parsedBody.sender === SenderType.USER ? parsedBody : chatMessage
          );
          onMessageReceived(parsedBody.sender === SenderType.USER ? parsedBody : chatMessage);
          log('[onStompMessage] onMessageReceived 콜백 호출 완료.');
        }
      } else if (chatMessage.sender === SenderType.USER) {
        log('[onStompMessage] 사용자 메시지 STOMP 구독 통해 수신 (스토어 중복 추가 방지 필요):', chatMessage);
      } else {
        log('[onStompMessage] 알 수 없는 sender 타입 또는 처리되지 않은 메시지:', chatMessage);
      }
    },
    [log, parseStompMessageBody, addMessageToStore, setIsAiTyping, onMessageReceived]
  );

  const handleStompError = useCallback(
    (frameOrError: Frame | Event | string, type: 'stomp' | 'websocket' | 'activation' = 'stomp') => {
      let errorMessage = '알 수 없는 웹소켓 오류가 발생했습니다.';

      if (typeof frameOrError === 'string') {
        errorMessage = frameOrError;
      } else if (frameOrError instanceof Event) {
        errorMessage = `웹소켓 연결 오류 (${type})`;
        log(`웹소켓 네이티브 오류 (${type}):`, frameOrError);
      } else if (
        frameOrError &&
        typeof frameOrError === 'object' &&
        'headers' in frameOrError &&
        'command' in frameOrError &&
        (frameOrError as Frame).command === 'ERROR'
      ) {
        const stompErrorFrame = frameOrError as Frame;
        errorMessage = stompErrorFrame.headers.message || `STOMP 프로토콜 오류 (${type})`;
        log(`STOMP 프로토콜 에러 프레임 (${type}):`, stompErrorFrame.headers, stompErrorFrame.body);
      } else {
        errorMessage = `예상치 못한 오류 객체 (${type}): ${String(frameOrError)}`;
        log(`예상치 못한 오류 객체 (${type}):`, frameOrError);
      }

      log(`최종 에러 메시지: ${errorMessage}`);
      setErrorState(errorMessage);
      if (setStoreError) setStoreError(errorMessage);

      setIsConnected(false);
      if (setWebsocketStatus) setWebsocketStatus('error');

      connectingRef.current = false;
    },
    [log, setStoreError, setWebsocketStatus]
  );

  const disconnect = useCallback(async (): Promise<void> => {
    log('STOMP 연결 해제 요청 시작...', {
      isDisconnecting: disconnectingRef.current,
      isClientActive: stompClientRef.current?.active,
      counsId: currentCounsIdRef.current,
    });

    if (disconnectingRef.current || !stompClientRef.current || !stompClientRef.current.active) {
      log(
        disconnectingRef.current
          ? '이미 연결 해제 작업 진행 중입니다. 추가 호출 무시.'
          : !stompClientRef.current
            ? 'STOMP 클라이언트가 존재하지 않습니다. 해제 작업 불필요.'
            : 'STOMP 클라이언트가 활성 상태가 아닙니다. 추가 해제 안 함.'
      );
      if (!stompClientRef.current || !stompClientRef.current.active) {
        setIsConnected(false);
        if (setWebsocketStatus) setWebsocketStatus('disconnected');
        disconnectingRef.current = false;
      }
      return;
    }

    disconnectingRef.current = true;
    if (setWebsocketStatus) setWebsocketStatus('disconnected');

    if (subscriptionRef.current) {
      try {
        log('STOMP 구독 해지 시도...', subscriptionRef.current.id);
        subscriptionRef.current.unsubscribe();
        log('STOMP 구독 해지 성공 (로컬).');
      } catch (subError) {
        log('STOMP 구독 해지 중 오류 발생:', subError);
      } finally {
        subscriptionRef.current = null;
      }
    }

    try {
      log('STOMP 클라이언트 비활성화 시도...');
      await stompClientRef.current.deactivate();
      log('STOMP 클라이언트 비활성화 요청 성공 (실제 완료는 onWebSocketClose 또는 에러 콜백에서 확인).');
    } catch (deactivateError) {
      log('STOMP 클라이언트 비활성화 중 오류:', deactivateError);
      handleStompError(deactivateError instanceof Error ? deactivateError.message : String(deactivateError), 'stomp');
    } finally {
      setIsConnected(false);
      connectingRef.current = false;
      disconnectingRef.current = false;
      log('STOMP 연결 해제 작업(disconnect 함수) 완료.');
    }
  }, [log, handleStompError, setWebsocketStatus]);

  const connect = useCallback(async (): Promise<void> => {
    log('STOMP 연결 요청 시작...', {
      isConnecting: connectingRef.current,
      isConnected: stompClientRef.current?.active,
      counsId: currentCounsIdRef.current,
      hasToken: !!token,
      isSessionEffectivelyClosed: isSessionClosed,
    });

    if (
      connectingRef.current ||
      stompClientRef.current?.active ||
      !currentCounsIdRef.current ||
      !token ||
      isSessionClosed
    ) {
      log(
        connectingRef.current
          ? '이미 연결 작업 진행 중입니다.'
          : stompClientRef.current?.active
            ? '이미 연결되어 있습니다.'
            : !currentCounsIdRef.current
              ? '상담 ID가 없어 연결할 수 없습니다.'
              : !token
                ? '인증 토큰이 없어 연결할 수 없습니다.'
                : isSessionClosed
                  ? '세션이 종료되어 연결하지 않습니다.'
                  : '연결을 진행하지 않는 조건 충족.'
      );
      if (stompClientRef.current?.active && !isConnected) setIsConnected(true);
      else if (!stompClientRef.current?.active && isConnected) setIsConnected(false);
      return;
    }

    connectingRef.current = true;
    setErrorState(null);
    if (setStoreError) setStoreError(null);
    if (setWebsocketStatus) setWebsocketStatus('connecting');

    log(`STOMP 클라이언트 생성 및 연결 시도: ${WEBSOCKET_BASE_URL}`);

    const client = new Client({
      brokerURL: WEBSOCKET_BASE_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        host: STOMP_HOST,
      },
      debug: (str) => log(`[STOMP Lib Debug] ${str}`),
      reconnectDelay: reconnectDelay > 0 ? reconnectDelay : 0,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: (frame: Frame) => {
        log('STOMP 연결 성공:', frame);
        setIsConnected(true);
        if (setWebsocketStatus) setWebsocketStatus('connected');
        connectingRef.current = false;

        const destination = `/sub/counsels/${currentCounsIdRef.current}/chat`;
        log(`구독 시도: ${destination}`);
        try {
          if (subscriptionRef.current) {
            log('기존 구독 존재, 해제 시도:', subscriptionRef.current.id);
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
          }
          subscriptionRef.current = client.subscribe(destination, onStompMessage, {
            id: `sub-${currentCounsIdRef.current}`,
            receipt: `sub-${currentCounsIdRef.current}`,
          });
          log('STOMP 구독 성공, 구독 ID:', subscriptionRef.current.id);
        } catch (subError) {
          log('STOMP 구독 중 오류 발생:', subError);
          handleStompError(subError instanceof Error ? subError.message : String(subError), 'stomp');
        }
      },
      onStompError: (frame: Frame) => {
        log('STOMP 프로토콜 오류 발생 (onStompError):', frame.headers, frame.body);
        handleStompError(frame, 'stomp');
      },
      onWebSocketError: (event: Event) => {
        log('웹소켓 네이티브 오류 발생 (onWebSocketError):', event);
        handleStompError(event, 'websocket');
      },
      onWebSocketClose: (event: CloseEvent) => {
        log('웹소켓 연결 종료됨 (onWebSocketClose):', event);
        if (!disconnectingRef.current) {
          handleStompError(`웹소켓 비정상 종료 (코드: ${event.code}, 사유: ${event.reason || 'N/A'})`, 'websocket');
        }
        setIsConnected(false);
        if (setWebsocketStatus) setWebsocketStatus('disconnected');
        connectingRef.current = false;
      },
    });

    stompClientRef.current = client;

    try {
      log('STOMP 클라이언트 활성화 (activate) 호출...');
      client.activate();
    } catch (activationError) {
      log('STOMP 클라이언트 활성화(activate) 중 동기적 오류:', activationError);
      handleStompError(
        activationError instanceof Error ? activationError.message : String(activationError),
        'activation'
      );
      connectingRef.current = false;
    }
  }, [
    token,
    reconnectDelay,
    log,
    onStompMessage,
    handleStompError,
    setWebsocketStatus,
    setStoreError,
    isSessionClosed,
  ]);

  const sendUserMessage = useCallback(
    (payload: StompSendUserMessagePayload) => {
      if (!stompClientRef.current?.active || !isConnected) {
        log('STOMP 클라이언트가 연결되지 않아 메시지를 전송할 수 없습니다.', {
          active: stompClientRef.current?.active,
          isConnected,
        });
        setErrorState('연결되지 않음');
        if (setStoreError) setStoreError('웹소켓이 연결되지 않았습니다. 메시지를 보낼 수 없습니다.');
        return;
      }
      if (!currentCounsIdRef.current) {
        log('상담 ID가 없어 메시지를 전송할 수 없습니다.');
        setErrorState('상담 ID 없음');
        if (setStoreError) setStoreError('현재 상담 세션 ID가 설정되지 않았습니다.');
        return;
      }
      if (isSessionClosed) {
        log('종료된 상담 세션에는 메시지를 전송할 수 없습니다.');
        setErrorState('종료된 세션');
        if (setStoreError) setStoreError('이미 종료된 상담입니다.');
        return;
      }

      const destination = `/pub/counsels/${currentCounsIdRef.current}/chat`;
      const body = JSON.stringify({
        messageOrder: payload.messageOrder,
        isVoice: payload.isVoice,
        message: payload.text,
      });

      try {
        log(`STOMP 메시지 발행 시도: ${destination}`, body);
        stompClientRef.current.publish({
          destination,
          body,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        log('STOMP 메시지 발행 성공.');

        const optimisticMessage: ChatMessage = {
          id: `optimistic-${Date.now()}-${payload.messageOrder}`,
          counsId: currentCounsIdRef.current,
          sender: SenderType.USER,
          messageType: MessageType.TEXT,
          message: payload.text,
          timestamp: new Date().toISOString(),
          tokenCount: 0,
          messageOrder: payload.messageOrder,
          isVoice: payload.isVoice,
        };
        log('Optimistic update로 사용자 메시지 스토어에 추가:', optimisticMessage);
        addMessageToStore(optimisticMessage);
      } catch (publishError) {
        log('STOMP 메시지 발행 중 오류:', publishError);
        const errorMessage = publishError instanceof Error ? publishError.message : String(publishError);
        setErrorState(`메시지 발행 실패: ${errorMessage}`);
        if (setStoreError) setStoreError(`메시지 전송에 실패했습니다: ${errorMessage}`);
      }
    },
    [isConnected, log, addMessageToStore, setStoreError, isSessionClosed, token]
  );

  useEffect(() => {
    const prevCounsId = currentCounsIdRef.current;
    log(
      `counsId 또는 주요 의존성 변경 감지: 이전 counsId '${prevCounsId}', 새 counsId '${counsId}'. ` +
        `연결상태: ${stompClientRef.current && typeof stompClientRef.current.active !== 'undefined' ? stompClientRef.current.active : 'N/A (또는 해제됨)'}, ` +
        `클라이언트 활성: ${stompClientRef.current && typeof stompClientRef.current.active !== 'undefined' ? stompClientRef.current.active : 'N/A (또는 해제됨)'}`
    );

    if (counsId !== prevCounsId) {
      currentCounsIdRef.current = counsId;
      log(`상담 ID 변경됨: from ${prevCounsId} to ${counsId}. 기존 연결 해제 및 재연결 준비.`);

      const disconnectPromise =
        stompClientRef.current?.active || connectingRef.current ? disconnect() : Promise.resolve();

      disconnectPromise.finally(() => {
        if (counsId && token && autoConnect && !isSessionClosed) {
          log('이전 연결 해제/없음 확인 후, 새 ID로 자동 연결 시작.');
          connect();
        } else {
          log('이전 연결 해제/없음 확인. 자동 연결 조건 미충족.');
        }
      });
    } else {
      // counsId는 그대로지만, 다른 의존성(token, autoConnect, isSessionClosed) 변경으로 인한 연결 상태 변경
      if (
        autoConnect &&
        counsId &&
        token &&
        !isSessionClosed &&
        !stompClientRef.current?.active &&
        !connectingRef.current
      ) {
        log('counsId는 동일하나, 자동 연결 조건 충족 및 미연결 상태. 연결 시도.');
        connect();
      } else if (
        (!autoConnect || !token || isSessionClosed) &&
        stompClientRef.current?.active &&
        !disconnectingRef.current
      ) {
        log('counsId는 동일하나, 연결 해제 조건 충족 및 연결 상태. 연결 해제 시도.');
        disconnect();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counsId, token, autoConnect, isSessionClosed, log]); // connect, disconnect, isConnected 제거

  useEffect(() => {
    return () => {
      log('useWebSocket 훅 언마운트. 연결 해제 시도.');
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log]); // disconnect 함수가 안정적이라면 의존성에서 제거 가능

  return {
    sendUserMessage,
    isConnected,
    lastReceivedStompMessage,
    error: errorState,
    connect,
    disconnect,
  };
};
