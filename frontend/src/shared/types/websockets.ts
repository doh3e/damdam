/**
 * @file 웹소켓 통신을 위한 메시지 프로토콜 및 관련 타입을 정의합니다.
 * FSD 아키텍처에 따라 특정 도메인에 종속되지 않는 공유 타입이므로 `shared` 레이어에 위치합니다.
 */

import { ChatMessage, SenderType } from '@/entities/counseling/model/types';

/**
 * 웹소켓을 통해 클라이언트와 서버 간에 주고받는 메시지의 주요 유형을 정의하는 열거형입니다.
 */
export enum WebSocketMessageType {
  /** 사용자가 서버로 메시지를 전송할 때 사용 */
  SEND_USER_MESSAGE = 'SEND_USER_MESSAGE',
  /** 서버가 AI의 응답 메시지를 클라이언트로 전송할 때 사용 */
  RECEIVE_AI_MESSAGE = 'RECEIVE_AI_MESSAGE',
  /** 서버가 AI의 추천 콘텐츠 메시지를 클라이언트로 전송할 때 사용 */
  RECEIVE_AI_RECOMMENDATION = 'RECEIVE_AI_RECOMMENDATION',
  /** 서버가 AI가 타이핑 중임을 클라이언트로 알릴 때 사용 */
  AI_TYPING_START = 'AI_TYPING_START',
  /** 서버가 AI의 타이핑이 끝났음을 클라이언트로 알릴 때 사용 */
  AI_TYPING_END = 'AI_TYPING_END',
  /** 상담 세션 시작 요청 시 사용 */
  START_COUNSELING_SESSION = 'START_COUNSELING_SESSION',
  /** 상담 세션 성공적으로 시작되었음을 알릴 때 사용 (세션 ID 포함) */
  COUNSELING_SESSION_STARTED = 'COUNSELING_SESSION_STARTED',
  /** 상담 세션 종료 요청 시 사용 */
  END_COUNSELING_SESSION = 'END_COUNSELING_SESSION',
  /** 상담 세션이 종료되었음을 알릴 때 사용 */
  COUNSELING_SESSION_ENDED = 'COUNSELING_SESSION_ENDED',
  /** 웹소켓 연결 또는 메시지 처리 중 오류 발생 시 사용 */
  ERROR = 'ERROR',
  /** 연결 확인 또는 keep-alive 목적으로 사용 (옵션) */
  PING = 'PING',
  PONG = 'PONG',
}

/**
 * 모든 웹소켓 메시지가 공통적으로 포함하는 기본 구조입니다.
 */
export interface BaseWebSocketMessage<T extends WebSocketMessageType, P = Record<string, unknown>> {
  /** 메시지의 유형 */
  type: T;
  /** 메시지 발생 타임스탬프 (Unix epoch, milliseconds) */
  timestamp: number;
  /** 메시지 유형에 따른 실제 데이터 (페이로드) */
  payload: P;
  /** 메시지 고유 ID (옵션, 디버깅 및 추적용) */
  messageId?: string;
  /** 메시지가 속한 상담 세션 ID (옵션, 대부분의 메시지에 포함) */
  sessionId?: string;
}

// --- 페이로드 타입 정의 ---

/** `SEND_USER_MESSAGE` 메시지 타입의 페이로드 */
export interface SendUserMessagePayload {
  /** 사용자가 입력한 텍스트 메시지 */
  text: string;
}

/** `RECEIVE_AI_MESSAGE` 또는 `RECEIVE_AI_RECOMMENDATION` 메시지 타입의 페이로드 */
export interface ReceiveAiChatMessagePayload {
  /** 서버로부터 받은 AI의 채팅 메시지 객체 */
  chatMessage: ChatMessage;
}

/** `AI_TYPING_START` 메시지 타입의 페이로드 (특별한 내용 없을 수 있음) */
export interface AiTypingStartPayload {}

/** `AI_TYPING_END` 메시지 타입의 페이로드 (특별한 내용 없을 수 있음) */
export interface AiTypingEndPayload {}

/** `START_COUNSELING_SESSION` 메시지 타입의 페이로드 */
export interface StartCounselingSessionPayload {
  /** 상담을 시작하는 사용자의 ID */
  userId: string;
  /** (옵션) 사용자가 이전에 했던 설문조사 결과 ID 등 초기 컨텍스트 정보 */
  initialContext?: Record<string, any>;
}

/** `COUNSELING_SESSION_STARTED` 메시지 타입의 페이로드 */
export interface CounselingSessionStartedPayload {
  /** 새로 생성된 상담 세션의 ID */
  sessionId: string;
  /** 상담 시작 시간 */
  startTime: number;
  /** AI 프로필 정보 (옵션) */
  aiProfile?: {
    name: string;
    avatarUrl?: string;
  };
}

/** `END_COUNSELING_SESSION` 메시지 타입의 페이로드 */
export interface EndCounselingSessionPayload {
  /** 종료하려는 상담 세션 ID. 명시하지 않으면 현재 활성 세션 종료 시도. */
  sessionId?: string;
}

/** `COUNSELING_SESSION_ENDED` 메시지 타입의 페이로드 */
export interface CounselingSessionEndedPayload {
  /** 종료된 상담 세션 ID */
  sessionId: string;
  /** 상담 종료 시간 */
  endTime: number;
  /** (옵션) 간단한 종료 사유 */
  reason?: string;
}

/** `ERROR` 메시지 타입의 페이로드 */
export interface ErrorPayload {
  /** 에러 코드 (애플리케이션에서 정의한 코드 사용) */
  code: string;
  /** 사용자에게 보여줄 수 있는 에러 메시지 */
  message: string;
  /** (옵션) 개발자를 위한 상세 에러 정보 */
  details?: Record<string, any>;
}

// --- 웹소켓 메시지 타입 정의 (페이로드와 결합) ---

/** 사용자가 서버로 메시지를 보낼 때 사용하는 웹소켓 메시지 타입 */
export type SendUserMessage = BaseWebSocketMessage<WebSocketMessageType.SEND_USER_MESSAGE, SendUserMessagePayload>;

/** 서버가 AI의 일반 텍스트 응답을 클라이언트로 보낼 때 사용하는 웹소켓 메시지 타입 */
export type ReceiveAiTextMessage = BaseWebSocketMessage<
  WebSocketMessageType.RECEIVE_AI_MESSAGE,
  ReceiveAiChatMessagePayload
>;

/** 서버가 AI의 추천 콘텐츠를 클라이언트로 보낼 때 사용하는 웹소켓 메시지 타입 */
export type ReceiveAiRecommendationMessage = BaseWebSocketMessage<
  WebSocketMessageType.RECEIVE_AI_RECOMMENDATION,
  ReceiveAiChatMessagePayload
>;

/** 서버가 AI 타이핑 시작을 알릴 때 사용하는 웹소켓 메시지 타입 */
export type AiTypingStartMessage = BaseWebSocketMessage<WebSocketMessageType.AI_TYPING_START, AiTypingStartPayload>;

/** 서버가 AI 타이핑 종료를 알릴 때 사용하는 웹소켓 메시지 타입 */
export type AiTypingEndMessage = BaseWebSocketMessage<WebSocketMessageType.AI_TYPING_END, AiTypingEndPayload>;

/** 클라이언트가 상담 세션 시작을 요청할 때 사용하는 웹소켓 메시지 타입 */
export type StartCounselingSessionMessage = BaseWebSocketMessage<
  WebSocketMessageType.START_COUNSELING_SESSION,
  StartCounselingSessionPayload
>;

/** 서버가 상담 세션이 성공적으로 시작되었음을 알릴 때 사용하는 웹소켓 메시지 타입 */
export type CounselingSessionStartedMessage = BaseWebSocketMessage<
  WebSocketMessageType.COUNSELING_SESSION_STARTED,
  CounselingSessionStartedPayload
>;

/** 클라이언트가 상담 세션 종료를 요청할 때 사용하는 웹소켓 메시지 타입 */
export type EndCounselingSessionMessage = BaseWebSocketMessage<
  WebSocketMessageType.END_COUNSELING_SESSION,
  EndCounselingSessionPayload
>;

/** 서버가 상담 세션이 종료되었음을 알릴 때 사용하는 웹소켓 메시지 타입 */
export type CounselingSessionEndedMessage = BaseWebSocketMessage<
  WebSocketMessageType.COUNSELING_SESSION_ENDED,
  CounselingSessionEndedPayload
>;

/** 오류 발생 시 사용하는 웹소켓 메시지 타입 */
export type ErrorMessage = BaseWebSocketMessage<WebSocketMessageType.ERROR, ErrorPayload>;

/** 웹소켓을 통해 수신할 수 있는 모든 메시지 타입의 유니온 (클라이언트 측에서 사용) */
export type ReceivedWebSocketMessage =
  | ReceiveAiTextMessage
  | ReceiveAiRecommendationMessage
  | AiTypingStartMessage
  | AiTypingEndMessage
  | CounselingSessionStartedMessage
  | CounselingSessionEndedMessage
  | ErrorMessage;
// | PongMessage; // PING/PONG 구현 시 추가

/** 웹소켓을 통해 전송할 수 있는 모든 메시지 타입의 유니온 (클라이언트 측에서 사용) */
export type SentWebSocketMessage = SendUserMessage | StartCounselingSessionMessage | EndCounselingSessionMessage;
// | PingMessage; // PING/PONG 구현 시 추가
