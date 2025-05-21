/**
 * @file Next.js 애플리케이션의 설정을 구성합니다.
 * @see https://nextjs.org/docs/api-reference/next.config.js/introduction
 */

import type { NextConfig } from 'next';

/**
 * Next.js의 기본 설정을 정의합니다.
 * @type {NextConfig}
 */
const nextConfig: NextConfig = {
  reactStrictMode: false,
  /**
   * 여기에 프로젝트별 Next.js 추가 설정을 작성할 수 있습니다.
   * 예: images, env, webpack, i18n (국제화를 사용하지 않을 경우 i18n: null 또는 생략)
   */
  experimental: {
    forceSwcTransforms: true, // SWC 변환 강제 활성화
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'damdam-counseling-bucket.s3.ap-northeast-2.amazonaws.com',
      },
    ],
  },
  async headers() {
    // cross-origin isolation을 위한 헤더 추가
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

/**
 * 최종 Next.js 설정을 내보냅니다.
 */
export default nextConfig;
