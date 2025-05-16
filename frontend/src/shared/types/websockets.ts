/**
 * @file 웹소켓 통신을 위한 메시지 프로토콜 및 관련 타입을 정의합니다.
 * FSD 아키텍처에 따라 특정 도메인에 종속되지 않는 공유 타입이므로 `shared` 레이어에 위치합니다.
 */

import { type MessageType, type RecommendedContent, SenderType } from '@/entities/counseling/model/types';

/**
 * 서버로부터 수신되는 웹소켓 메시지의 기본 형태입니다.
 * 백엔드는 현재 type 필드 없이 메시지 내용을 직접 전달합니다.
 * 이 타입은 서버가 보내는 JSON 구조를 나타냅니다.
 */
export interface ReceivedServerMessage {
  /** 메시지를 보낸 주체 (USER 또는 AI) */
  sender: SenderType;
  /** (옵션) 음성 메시지 여부 */
  isVoice?: boolean;
  /** (옵션) 메시지 순서 (사용자 메시지 echo 시 포함될 수 있음) */
  messageOrder?: number;
  /** 실제 메시지 내용 */
  message: string; // 서버는 'message' 필드로 내용을 줌
  /** 메시지 타임스탬프 (ISO 문자열 또는 숫자) */
  timestamp: string | number;
  /** (옵션) 메시지 ID (서버에서 생성 시) */
  id?: string;
  /** (옵션) 메시지 타입 (서버에서 ChatMessage의 MessageType을 준다면 활용) */
  messageType?: MessageType;
  /** (옵션) AI 추천 콘텐츠 (messageType이 RECOMMENDATION일 때) */
  recommendations?: RecommendedContent[];
  /** (옵션) 서버에서 에러 발생 시 전달되는 에러 정보 */
  error?: ErrorPayload;
  // AI 응답 시 추가될 수 있는 필드들 (예: 감정 분석 결과 등)
  // sentiment?: any;
}

/** `ERROR` 메시지 타입의 페이로드 (클라이언트 내부 오류 표현용으로 사용 가능) */
export interface ErrorPayload {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// 기존의 다른 페이로드 및 메시지 타입 정의들은 현재 명세에 맞지 않으므로 제거하거나 주석 처리합니다.
// 예를 들어, ReceiveAiChatMessagePayload, CounselingSessionStartedPayload 등은
// 서버가 type 필드를 포함한 구조화된 메시지를 보내지 않으므로 직접 사용되지 않습니다.
// SendUserMessagePayload는 StompSendUserMessagePayload로 useWebSocket.ts에 이미 정의되어 있고,
// 이는 STOMP 발행 시 body에 들어가는 내용이므로 유지될 수 있습니다.
