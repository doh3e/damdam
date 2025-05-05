import type { Metadata } from "next";
import { Inter } from "next/font/google";
// 전역 스타일시트를 가져옵니다. Tailwind CSS 설정이 여기에 포함됩니다.
import "@/app/styles/globals.css";
// FSD 구조에 따라 shared/lib에서 유틸리티 함수를 가져옵니다.
import { cn } from "@/shared/lib/utils";

// Google Fonts에서 Inter 폰트를 사용합니다. (선택 사항, 다른 폰트로 변경 가능)
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

/**
 * 애플리케이션의 메타데이터를 정의합니다. 검색 엔진 최적화(SEO) 및 탭 제목 등에 사용됩니다.
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata
 */
export const metadata: Metadata = {
  title: "담담 (DAMDAM) - AI 심리상담 챗봇 서비스",
  description:
    "언제 어디서나 편안하게 대화하며 마음의 짐을 덜어낼 수 있는 AI 심리상담 서비스",
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
      {/*
        cn 함수: Tailwind CSS 클래스를 병합하고 조건부 스타일링을 쉽게 하기 위한 유틸리티입니다.
        Inter 폰트를 적용하고, 기본 배경색/글자색을 설정합니다.
        'antialiased'는 폰트 렌더링을 부드럽게 합니다.
      */}
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        {/* 앱 전체를 포함하는 flex 컨테이너 */}
        <div className="flex min-h-screen flex-col">
          {/* === 헤더 영역 === */}
          {/* TODO: 여기에 Header 위젯 컴포넌트를 추가합니다. (다음 단계에서 구현) */}
          <header className="sticky top-0 z-50 border-b bg-background p-4 text-center font-bold">
            (임시 헤더 Placeholder)
          </header>

          {/* === 메인 콘텐츠 영역 === */}
          {/*
            flex-1: 헤더와 하단 네비를 제외한 나머지 공간을 모두 차지하도록 합니다.
            자식 컴포넌트(각 페이지)가 이 안에 렌더링됩니다.
          */}
          <main className="flex-1">{children}</main>

          {/* === 하단 네비게이션 바 영역 === */}
          {/* TODO: 여기에 BottomNavigation 위젯 컴포넌트를 추가합니다. (추후 단계에서 구현) */}
          <nav className="sticky bottom-0 z-50 border-t bg-background p-4 text-center font-bold">
            (임시 하단 네비게이션 Placeholder)
          </nav>
        </div>
      </body>
    </html>
  );
}
