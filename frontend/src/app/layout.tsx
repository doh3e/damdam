import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_KR } from 'next/font/google';
// 전역 스타일시트를 가져옵니다. Tailwind CSS 설정이 여기에 포함됩니다.
import '@/app/styles/globals.css';
// FSD 구조에 따라 shared/lib에서 유틸리티 함수를 가져옵니다.
import { cn } from '@/shared/lib/utils';
import { Header } from '@/widgets/Header'; // Header 위젯 가져오기
import { BottomNavigation } from '@/widgets/BottomNavigation'; // BottomNavigation 위젯 가져오기
import QueryClientProviders from './providers/QueryClientProviders';
import { ThemeProvider } from './providers/ThemeProvider';

// Google Fonts에서 Inter 폰트를 사용합니다. (선택 사항, 다른 폰트로 변경 가능)
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const nonoSans = Noto_Sans_KR({ subsets: ['latin'], variable: '--font-sans' });
/**
 * 애플리케이션의 메타데이터를 정의합니다. 검색 엔진 최적화(SEO) 및 탭 제목 등에 사용됩니다.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata
 */
export const metadata: Metadata = {
  title: '담담 (DAMDAM) - AI 심리상담 챗봇 서비스',
  description: '언제 어디서나 편안하게 대화하며 마음의 짐을 덜어낼 수 있는 AI 심리상담 서비스',
  manifest: '/manifest.json', // manifest.json 경로 추가
  icons: {
    // 선호하는 아이콘 추가 (예: apple-touch-icon)
    // apple: '/icons/icon-192x192.png', // 예시 경로, 실제 아이콘 경로로 수정해주세요.
  },
  // PWA 관련 추가 메타 태그 (필요시)
  applicationName: '담담',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '담담이',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    // 소셜 공유 시 정보
    type: 'website',
    siteName: '담담이',
    title: { template: '%s | 담담이', default: '담담이 - AI 심리상담 챗봇' },
    description: '언제 어디서나 편안하게 대화하며 마음의 짐을 덜어낼 수 있는 AI 심리상담 챗봇',
    // images: [{ url: '/icons/icon-512x512.png' }], // 대표 이미지, 실제 경로로 수정해주세요.
  },
  twitter: {
    // 트위터 카드
    card: 'summary_large_image', // 큰 이미지 카드 사용 권장
    title: { template: '%s | 담담이', default: '담담이 - AI 마음상담 챗봇' },
    description: '언제 어디서나 편안하게 대화하며 마음의 짐을 덜어낼 수 있는 AI 심리상담 챗봇',
    // images: ['/icons/icon-512x512.png'], // 대표 이미지, 실제 경로로 수정해주세요.
  },
};

export const viewport: Viewport = {
  themeColor: '#fae9de', // manifest.json의 theme_color와 일치 권장
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // 확대 방지
  userScalable: false, // 확대 방지
};

/**
 * RootLayout 컴포넌트: 모든 페이지를 감싸는 최상위 레이아웃입니다.
 * HTML, Body 태그 및 공통 UI 요소(헤더, 네비게이션 바 등)를 정의합니다.
 *
 * @param {Readonly<{ children: React.ReactNode }>} props - 레이아웃이 감싸는 자식 요소(페이지 컴포넌트)
 * @returns {JSX.Element} 루트 레이아웃 엘리먼트
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head />
      {/* Next.js가 자동으로 head 태그 내용을 관리 (metadata, viewport 객체 활용) */}
      <body className={cn('min-h-screen bg-muted font-sans antialiased', nonoSans.variable)}>
        {/* === 앱 전체 뷰 컨테이너 === */}
        {/* h-screen으로 높이 고정, overflow-hidden으로 내부 스크롤 제한 */}
        <div className="mx-auto flex h-screen max-w-screen-sm flex-col overflow-hidden bg-background shadow-md">
          {/* === 헤더 영역 === */}
          <Header />
          {/* === 메인 콘텐츠 영역 === */}
          {/* flex-1으로 남은 공간 채우고, overflow-y-auto로 자체 스크롤 */}
          {/* globals.css에 정의된 커스텀 스크롤바 스타일 적용 (페일 코랄 핑크) */}
          <main className="flex-1 overflow-y-auto scrollbar-custom">
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <QueryClientProviders>{children}</QueryClientProviders>
            </ThemeProvider>
          </main>
          {/* === 하단 네비게이션 바 영역 === */}
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
