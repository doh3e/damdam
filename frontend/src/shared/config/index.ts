/**
 * @file frontend/src/shared/config/index.ts
 * API 및 웹소켓 엔드포인트, 기타 전역 설정을 정의합니다.
 * FSD 아키텍처에 따라 `shared` 레이어의 `config` 슬라이스에 위치합니다.
 */

// HTTP API 기본 URL (Next.js 환경 변수를 우선적으로 사용)
export const API_BASE_URL = process.env.NEXT_PUBLIC_DAMDAM_BASE_URL || 'http://localhost:8080/api';

// 소셜 로그인 URL
export const NAVER_LOGIN_URL = process.env.NEXT_PUBLIC_NAVER_LOGIN_URL!;
export const KAKAO_LOGIN_URL = process.env.NEXT_PUBLIC_KAKAO_LOGIN_URL!;
export const GOOGLE_LOGIN_URL = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL!;

// 웹소켓 API 기본 URL (Next.js 환경 변수를 우선적으로 사용)
// 실제 배포 환경에서는 'wss://' 프로토콜을 사용하고, 로컬에서는 'ws://'를 사용합니다.
export const WEBSOCKET_BASE_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080';

// 예시: 기본 페이지 크기 상수
export const DEFAULT_PAGE_SIZE = 10;

// 예시: 로컬 스토리지 키 상수
export const THEME_STORAGE_KEY = 'damdam-theme';
export const AUTH_TOKEN_STORAGE_KEY = 'damdam-auth-token';

// 기타 필요한 전역 설정들을 이곳에 추가할 수 있습니다.
