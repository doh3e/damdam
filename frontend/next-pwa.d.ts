/**
 * @file next-pwa 모듈에 대한 타입 선언 파일입니다.
 * @types/next-pwa 패키지를 사용하지 않을 경우, TypeScript 컴파일러에게
 * next-pwa 모듈의 존재와 기본적인 형태를 알려주기 위해 사용됩니다.
 */

declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  /**
   * next-pwa 플러그인의 설정 옵션 타입을 정의합니다.
   * 실제 next-pwa의 모든 옵션을 포함하지 않을 수 있으며, 필요한 주요 옵션 위주로 정의합니다.
   * 정확한 전체 타입은 next-pwa 공식 문서나 소스 코드를 참고해야 합니다.
   */
  export interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: any[]; // 실제로는 Workbox의 RuntimeCaching[] 타입이지만, 간략화를 위해 any[] 사용
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
      data?: string;
    };
    buildExcludes?: RegExp[];
    swSrc?: string;
    [key: string]: any; // 기타 다른 옵션들을 허용하기 위함
  }

  /**
   * next-pwa의 메인 함수 타입입니다.
   * PWA 설정을 받아 Next.js 설정을 반환하는 함수를 생성합니다.
   * @param pwaConfig PWA 설정 객체
   * @returns Next.js 설정을 받아 최종 설정을 반환하는 함수
   */
  export default function withPWA(pwaConfig: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}
