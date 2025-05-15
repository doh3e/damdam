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
 * - `VOICE`: 음성 메시지
 * - `ERROR`: 오류 상황을 알리는 메시지
 */
export enum MessageType {
  TEXT = 'text',
  RECOMMENDATION = 'recommendation',
  VOICE = 'voice',
  ERROR = 'error',
}

/**
 * 개별 채팅 메시지의 구조를 정의하는 인터페이스입니다.
 * ERD에 따르면 chat_messages 테이블은 없으나, 웹소켓/API 응답으로 이 구조를 예상합니다.
 */
export interface ChatMessage {
  /** 메시지의 고유 ID (서버 또는 클라이언트에서 생성) */
  id: string;
  /** 메시지가 속한 상담 세션의 ID (`counsId`) */
  counsId: string;
  /** 메시지 발신자 (사용자 또는 AI) */
  sender: SenderType;
  /** 메시지 유형 */
  messageType: MessageType;
  /** 메시지 내용 (텍스트 또는 음성 파일 경로/데이터) */
  content: string;
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
 * 상담 세션의 상태를 UI/로직 레벨에서 명확히 구분하기 위한 열거형입니다.
 * 실제 데이터는 `isClosed` (boolean)으로 관리됩니다.
 * - `ACTIVE`: 진행 중 (isClosed = false)
 * - `ENDED`: 종료됨 (isClosed = true)
 */
export enum CounselingDisplayStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

/**
 * 상담 세션의 정보를 정의하는 인터페이스입니다.
 * ERD의 `counseling` 테이블과 API 명세서를 기반으로 합니다.
 */
export interface CounselingSession {
  /** 상담 세션의 고유 ID (ERD: `couns_id`) */
  counsId: string;
  /** 상담을 진행한 사용자의 ID (ERD: `user_id`) */
  userId: string;
  /** 상담 세션의 제목 (ERD: `couns_title`) */
  counsTitle: string;
  /** AI 프로필 정보 (옵션, 필요시 구체화) */
  aiProfile?: {
    name: string;
    avatarUrl?: string;
  };
  /** 상담 생성 시간 (ERD: `created_at`, ISO 문자열 또는 number 타입으로 통일 필요) */
  createdAt: string | number;
  /** 상담 최종 업데이트 시간 (ERD: `updated_at`, ISO 문자열 또는 number 타입으로 통일 필요) */
  updatedAt: string | number;
  /** 상담 종료 여부 (ERD: `is_closed`) */
  isClosed: boolean;
  /** 세션의 마지막 메시지 (옵션, API 응답에 따라 추가/제외) */
  lastMessage?: Pick<ChatMessage, 'content' | 'timestamp' | 'sender'>;
  /** 상담 세션의 요약 (옵션, 필요시 Report 엔티티와 연계) */
  summary?: string;
  /** 사용자가 매긴 평점 (옵션, 1~5점, 별도 테이블/필드 필요시 추가) */
  rating?: number;
  /** 세션 관련 태그 또는 카테고리 (옵션) */
  tags?: string[];
}
