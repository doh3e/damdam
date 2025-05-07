/**
 * @file Next.js 애플리케이션의 설정을 구성합니다.
 * next-pwa 플러그인을 사용하여 PWA(Progressive Web App) 기능을 통합합니다.
 * @see https://nextjs.org/docs/api-reference/next.config.js/introduction
 * @see https://www.npmjs.com/package/next-pwa
 */

import type { NextConfig } from 'next';
// @types/next-pwa를 사용하지 않으므로, PWAConfig 타입 import는 제거합니다.
// PWA 설정 객체의 타입은 'any'로 지정하거나, 필요한 경우 직접 인터페이스를 정의할 수 있습니다.

import withPWAConstructor from 'next-pwa';

/**
 * Next.js의 기본 설정을 정의합니다.
 * @type {NextConfig}
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * 여기에 프로젝트별 Next.js 추가 설정을 작성할 수 있습니다.
   * 예: images, env, webpack, i18n (국제화를 사용하지 않을 경우 i18n: null 또는 생략)
   * 현 프로젝트에서는 i18n을 사용하지 않으므로 명시적으로 null 처리하거나 생략합니다.
   */
  // experimental: {
  //   useLightningcss: false, // lightningcss 비활성화
  // },
};

/**
 * next-pwa 플러그인의 설정을 정의합니다.
 * PWA 관련 동작(서비스 워커 생성, 캐싱 전략 등)을 제어합니다.
 * @see https://www.npmjs.com/package/next-pwa#configuration
 * @type {any} // @types/next-pwa를 사용하지 않으므로 'any'로 타입 지정
 */
const pwaConfig: any = {
  /**
   * 서비스 워커 파일 및 관련 파일들이 생성될 목적지 디렉토리입니다.
   * @default "public"
   */
  dest: 'public',
  /**
   * 브라우저에 서비스 워커를 자동으로 등록할지 여부를 결정합니다.
   * true로 설정 시, 클라이언트 사이드에서 서비스 워커 등록 코드가 자동 주입됩니다.
   * @default true
   */
  register: true,
  /**
   * 새로운 서비스 워커가 설치될 때, 이전 서비스 워커의 제어가 끝날 때까지 기다리지 않고 즉시 활성화할지 여부를 결정합니다.
   * @default true
   */
  skipWaiting: true,
  /**
   * 특정 환경(예: 개발 환경)에서 PWA 기능을 비활성화합니다.
   * 개발 중 서비스 워커 캐싱으로 인한 불편을 줄일 수 있습니다.
   * @default false
   */
  disable: process.env.NODE_ENV === 'development',
  /**
   * 런타임 캐싱 전략을 정의합니다. Workbox의 캐싱 전략을 사용합니다.
   * @see https://developer.chrome.com/docs/workbox/modules/workbox-strategies
   */
  runtimeCaching: [
    {
      // API 요청 캐싱: 네트워크 우선, 실패 시 캐시 사용
      urlPattern: new RegExp('^https?.*/api/.*', 'i'), // 실제 API 경로에 맞게 수정 필요
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7일
        },
        networkTimeoutSeconds: 10, // 네트워크 요청 타임아웃 (초)
      },
    },
    {
      // 페이지 및 주요 정적 자원(HTML, CSS, JS, WebManifest): StaleWhileRevalidate 권장
      // 캐시에서 먼저 제공 후, 백그라운드에서 네트워크를 통해 업데이트
      urlPattern: new RegExp('\\.(?:html|css|js|woff2|webmanifest)$', 'i'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources-cache',
        expiration: {
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30일
        },
      },
    },
    {
      // 이미지 파일 캐싱: 캐시 우선, 없으면 네트워크 요청 후 캐싱
      urlPattern: new RegExp('\\.(?:png|jpg|jpeg|svg|gif|ico|webp)$', 'i'),
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 200, // 최대 캐시 항목 수
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30일
        },
      },
    },
    {
      // 외부 폰트(예: Google Fonts) 캐싱: 캐시 우선
      urlPattern: new RegExp('^https://fonts\\.(?:googleapis|gstatic)\\.com/.*', 'i'),
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10, // 자주 변경되지 않으므로 적은 수의 항목 캐시
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1년
        },
      },
    },
  ],
  /**
   * (선택 사항) 오프라인 시 보여줄 대체 페이지 설정입니다.
   * 해당 경로에 실제 정적 파일이 존재해야 합니다.
   * @example fallbacks: { document: '/offline.html' }
   */
  // fallbacks: {
  //   document: '/offline.html', // 예시: public/_offline.html 파일 필요
  //   // image: '/static/images/offline.png',
  //   // font: '/static/fonts/offline.woff2',
  // },
  /**
   * (선택 사항) 서비스 워커의 프리캐싱 목록에서 제외할 파일 패턴입니다.
   * @example buildExcludes: [/middleware-manifest\.json$/]
   */
  // buildExcludes: [/middleware-manifest\.json$/],
  /**
   * (선택 사항) 커스텀 서비스 워커 파일을 사용하고자 할 때 해당 파일의 경로를 지정합니다.
   * next-pwa는 이 파일을 기반으로 최종 서비스 워커를 빌드합니다.
   * @example swSrc: 'src/sw.js'
   */
  // swSrc: 'src/custom-sw.js',
};

/**
 * next-pwa 플러그인을 사용하여 PWA 설정을 Next.js 설정과 병합합니다.
 */
const withPWA = withPWAConstructor(pwaConfig);

/**
 * 최종 Next.js 설정을 내보냅니다.
 * PWA 기능이 통합된 NextConfig 객체입니다.
 * 타입 호환성 문제를 해결하기 위해 타입 단언을 사용합니다.
 */
export default withPWA(nextConfig as any) as NextConfig;
// 또는 좀 더 간단하게:
// export default withPWA(nextConfig as any);
