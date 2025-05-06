import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// 전역 스타일시트를 가져옵니다. Tailwind CSS 설정이 여기에 포함됩니다.
import '@/app/styles/globals.css';
// FSD 구조에 따라 shared/lib에서 유틸리티 함수를 가져옵니다.
import { cn } from '@/shared/lib/utils';
import { Header } from '@/widgets/Header'; // Header 위젯 가져오기
import { BottomNavigation } from '@/widgets/BottomNavigation'; // BottomNavigation 위젯 가져오기

// Google Fonts에서 Inter 폰트를 사용합니다. (선택 사항, 다른 폰트로 변경 가능)
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

/**
 * 애플리케이션의 메타데이터를 정의합니다. 검색 엔진 최적화(SEO) 및 탭 제목 등에 사용됩니다.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata
 */
export const metadata: Metadata = {
  title: '담담 (DAMDAM) - AI 심리상담 챗봇 서비스',
  description: '언제 어디서나 편안하게 대화하며 마음의 짐을 덜어낼 수 있는 AI 심리상담 서비스',
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
      <body className={cn('min-h-screen bg-muted font-sans antialiased', inter.variable)}>
        {/* === 앱 전체 뷰 컨테이너 === */}
        <div className="mx-auto flex min-h-screen max-w-screen-sm flex-col bg-background shadow-md">
          {/* === 헤더 영역 === */}
          <Header />

          {/* === 메인 콘텐츠 영역 === */}
          <main className="flex-1">{children}</main>

          {/* === 하단 네비게이션 바 영역 === */}
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
