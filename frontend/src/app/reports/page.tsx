import React from 'react';

/**
 * ReportsPage 컴포넌트: '/reports' 경로에 해당하는 나의 상담 페이지입니다.
 * (상담 레포트 목록 등을 표시)
 * 페이지 너비는 RootLayout에 의해 제어됩니다.
 * @returns {JSX.Element} 나의 상담 페이지 엘리먼트
 */
export default function ReportsPage() {
  return (
    <div className="p-4">
      {/* 페이지 제목 */}
      <h1 className="text-2xl font-bold mb-4">나의 상담 페이지</h1>
      {/* 페이지 내용 Placeholder */}
      <p>지난 상담 내역 및 분석 레포트를 확인할 수 있습니다.</p>
      {/* TODO: 실제 레포트 목록 및 상세 조회 기능 구현 */}
    </div>
  );
}
