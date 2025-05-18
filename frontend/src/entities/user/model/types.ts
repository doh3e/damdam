import { Gender, Age, MBTI } from '@/shared/consts/enum';
/**
 * @file 사용자(User) 엔티티와 관련된 주요 데이터 구조를 정의합니다.
 * FSD 아키텍처에 따라 `entities` 레이어의 `user` 슬라이스 내 `model`에 위치합니다.
 */

/**
 * 일반 사용자 정보를 정의하는 인터페이스입니다.
 */
export interface User {
  /** 사용자의 고유 ID */
  id: string;
  /** 사용자 닉네임 */
  nickname: string;
  /** 사용자 이메일 주소 (옵션) */
  email?: string;
  /** 사용자 프로필 이미지 URL (옵션) */
  profileImageUrl?: string;
  // 추가적인 사용자 관련 필드들...
}

/**
 * AI 챗봇의 프로필 정보를 정의하는 인터페이스입니다.
 * 상담 화면에서 AI의 이름이나 아바타를 표시할 때 사용됩니다.
 */
export interface AiProfile {
  /** AI의 고유 ID */
  id: string;
  /** AI의 이름 (예: "담담이") */
  name: string;
  /** AI의 아바타 이미지 URL (옵션) */
  avatarUrl?: string;
  /** AI의 소개나 설명 (옵션) */
  description?: string;
  /** AI 모델 버전 정보 (옵션) */
  modelVersion?: string;
}

// 참고: 프로젝트에 이미 User 타입이 존재하고, 해당 타입에 AI를 구분하는 필드
// (예: userType: 'human' | 'ai')를 추가하는 방식도 고려할 수 있습니다.
// 이 경우, AiProfile은 User 타입의 일부 속성을 확장하거나 특정화하는 형태로 정의될 수 있습니다.

// entities/user/model/types.ts
export interface UserProfile {
  provider: string;
  nickname: string;
  email: string;
  profileImage: string;
  gender: Gender;
  age: Age;
  career: string;
  mbti: MBTI;
}
