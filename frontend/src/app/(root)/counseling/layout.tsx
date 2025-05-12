import React from 'react';

/**
 * 상담 관련 페이지들의 공통 레이아웃 컴포넌트입니다.
 * 경로: /counseling/* (이 레이아웃은 해당 패턴의 모든 페이지에 적용됩니다)
 *
 * FSD 아키텍처에서 `app` 레이어의 레이아웃 컴포넌트에 해당합니다.
 * Next.js App Router는 이 `layout.tsx` 파일을 해당 세그먼트와 그 자식 세그먼트들을 위한
 * UI 쉘(shell)로 사용합니다. 이 레이아웃은 페이지가 변경되어도 상태를 유지하고, 리렌더링되지 않습니다.
 *
 * @param {object} props - 컴포넌트 프로퍼티
 * @param {React.ReactNode} props.children - Next.js가 주입하는 페이지 또는 중첩 레이아웃 콘텐츠
 * @returns {JSX.Element} 상담 섹션 레이아웃
 */
const CounselingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      {/* 
        향후 이 레이아웃에 상담 섹션 전용 헤더, 네비게이션 바, 푸터 등이 추가될 수 있습니다.
        예를 들어, 상담 중임을 나타내는 특별한 헤더나, 상담 관련 메뉴를 포함하는 사이드바 등입니다.
        현재는 기본적인 구조만 제공하며, children을 통해 실제 페이지 내용이 렌더링됩니다.
      */}
      <div className="flex-grow container mx-auto p-4">{children}</div>
      {/* 예시: 상담 섹션 전용 푸터 */}
      {/* 
      <footer className="bg-muted p-4 text-center text-muted-foreground text-sm">
        담담 AI 상담 서비스 - 상담 섹션
      </footer> 
      */}
    </main>
  );
};

export default CounselingLayout;
