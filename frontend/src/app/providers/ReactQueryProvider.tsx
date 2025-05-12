/**
 * @file ReactQueryProvider.tsx
 * Tanstack Query (React Query)를 애플리케이션에 제공하기 위한 Provider 컴포넌트입니다.
 * FSD 아키텍처에 따라 `app` 레이어의 `providers`에 위치합니다.
 * 이 컴포넌트는 애플리케이션의 최상위 (예: `app/layout.tsx`)에서 사용되어야 합니다.
 */
'use client'; // 클라이언트 컴포넌트로 명시 (QueryClientProvider는 클라이언트 사이드에서 동작)

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // 개발자 도구 (선택 사항)

/**
 * ReactQueryProvider 컴포넌트의 Props 인터페이스
 */
interface ReactQueryProviderProps {
  children: React.ReactNode;
}

/**
 * Tanstack Query의 QueryClientProvider를 설정하고 자식 컴포넌트들에게 제공합니다.
 *
 * @param {ReactQueryProviderProps} props - 컴포넌트 프로퍼티
 * @returns {JSX.Element} QueryClientProvider로 감싸진 자식 컴포넌트들
 */
const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({ children }) => {
  // QueryClient 인스턴스 생성.
  // useState를 사용하여 클라이언트 사이드에서 단 한번만 생성되도록 보장합니다.
  // (Next.js의 서버 컴포넌트 환경과의 호환성 및 엄격 모드에서의 중복 생성을 방지하기 위함)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 기본 쿼리 옵션 설정 (애플리케이션 전역 적용)
            staleTime: 1000 * 60 * 5, // 5분 (데이터가 stale 상태로 간주되기까지의 시간)
            refetchOnWindowFocus: false, // 창 포커스 시 자동 refetch 비활성화 (선택적)
            retry: 1, // 쿼리 실패 시 재시도 횟수
          },
          mutations: {
            // 기본 뮤테이션 옵션 설정
            retry: 0, // 뮤테이션 실패 시 기본적으로 재시도 안 함
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query 개발자 도구 (개발 환경에서만 활성화하는 것이 좋음) */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
