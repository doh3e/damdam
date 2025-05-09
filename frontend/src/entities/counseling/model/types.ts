/**
 * @file 상담(Counseling) 엔티티와 관련된 주요 데이터 구조를 정의합니다.
 * FSD 아키텍처에 따라 `entities` 레이어의 `counseling` 슬라이스 내 `model`에 위치합니다.
 */

/**
 * 메시지 발신자 유형을 정의하는 열거형(Enum)입니다.
 * - `USER`: 일반 사용자
 * - `AI`: AI 챗봇
 */
export enum SenderType {
  USER = 'user',
  AI = 'ai',
}

/**
 * AI가 추천하는 콘텐츠의 구조를 정의하는 인터페이스입니다.
 */
export interface RecommendedContent {
  /** 추천 콘텐츠의 고유 ID (옵션) */
  id?: string;
  /** 추천 콘텐츠의 제목 */
  title: string;
  /** 추천 콘텐츠로 연결되는 URL */
  url: string;
  /** 추천 콘텐츠의 간략한 설명 (옵션) */
  description?: string;
  /** 추천 콘텐츠의 썸네일 이미지 URL (옵션) */
  thumbnailUrl?: string;
}

/**
 * 채팅 메시지의 유형을 정의하는 열거형(Enum)입니다.
 * - `TEXT`: 일반 텍스트 메시지
 * - `RECOMMENDATION`: AI의 콘텐츠 추천 메시지
 * - `ERROR`: 오류 상황을 알리는 메시지
 */
export enum MessageType {
  TEXT = 'text',
  RECOMMENDATION = 'recommendation',
  ERROR = 'error',
}

/**
 * 개별 채팅 메시지의 구조를 정의하는 인터페이스입니다.
 */
export interface ChatMessage {
  /** 메시지의 고유 ID */
  id: string;
  /** 메시지가 속한 상담 세션의 ID */
  sessionId: string;
  /** 메시지 발신자 (사용자 또는 AI) */
  sender: SenderType;
  /** 메시지 유형 */
  messageType: MessageType;
  /** 메시지 텍스트 내용 (일반 텍스트 메시지인 경우) */
  text?: string;
  /** 추천 콘텐츠 목록 (AI 추천 메시지인 경우) */
  recommendations?: RecommendedContent[];
  /** 오류 메시지 내용 (오류 메시지인 경우) */
  error?: {
    code: string;
    message: string;
  };
  /** 메시지 생성 타임스탬프 (Unix epoch, milliseconds) */
  timestamp: number;
  /** 사용자의 피드백 (옵션, 예: 좋아요/싫어요) */
  feedback?: 'like' | 'dislike';
  /** AI 응답에 대한 추가 메타데이터 (옵션) */
  metadata?: Record<string, any>;
}

/**
 * 상담 세션의 상태를 정의하는 열거형(Enum)입니다.
 * - `ACTIVE`: 진행 중인 상담
 * - `ENDED`: 종료된 상담
 * - `PENDING`: 시작 대기 중인 상담 (예: AI 응답 대기)
 */
export enum CounselingStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
  PENDING = 'pending',
}

/**
 * 상담 세션의 정보를 정의하는 인터페이스입니다.
 */
export interface CounselingSession {
  /** 상담 세션의 고유 ID */
  id: string;
  /** 상담을 진행한 사용자의 ID */
  userId: string;
  /** 상담을 진행한 AI의 ID 또는 정보 (AiProfile 타입 사용 가능) */
  aiId: string; // 또는 AiProfile 타입을 사용할 수 있습니다.
  /** 상담 시작 시간 (Unix epoch, milliseconds) */
  startTime: number;
  /** 상담 종료 시간 (Unix epoch, milliseconds, 옵션) */
  endTime?: number;
  /** 현재 상담 세션의 상태 */
  status: CounselingStatus;
  /** 세션의 마지막 메시지 (옵션, 목록 화면 표시에 사용) */
  lastMessage?: Pick<ChatMessage, 'text' | 'timestamp' | 'sender'>;
  /** 상담 세션의 요약 (옵션) */
  summary?: string;
  /** 사용자가 매긴 평점 (옵션, 1~5점) */
  rating?: number;
  /** 세션 관련 태그 또는 카테고리 (옵션) */
  tags?: string[];
}
