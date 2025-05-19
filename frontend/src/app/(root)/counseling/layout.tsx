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
  // RootLayout의 <main> 스타일이 적용되도록 특별한 래퍼 없이 children을 반환합니다.
  return <>{children}</>;
};

export default CounselingLayout;
