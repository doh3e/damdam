import React from 'react';

/**
 * CounselingPage 컴포넌트: '/counseling' 경로에 해당하는 상담하기 페이지입니다.
 * @returns {JSX.Element} 상담하기 페이지 엘리먼트
 */
export default function CounselingPage() {
  return (
    <div className="container mx-auto p-4">
      {/* 페이지 제목 */}
      <h1 className="text-2xl font-bold mb-4">상담하기 페이지</h1>
      {/* 페이지 내용 Placeholder */}
      <p>여기에서 새로운 AI 상담을 시작하거나 진행 중인 상담 목록을 볼 수 있습니다.</p>
      {/* TODO: 실제 상담 관련 기능 구현 */}
    </div>
  );
}
