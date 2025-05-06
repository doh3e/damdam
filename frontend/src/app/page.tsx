import React from 'react';

/**
 * HomePage 컴포넌트: 애플리케이션의 루트 경로('/')에 해당하는 메인 페이지입니다.
 * 페이지 너비는 RootLayout에 의해 제어됩니다.
 * @returns {JSX.Element} 홈 페이지 엘리먼트
 */
export default function HomePage() {
  return (
    <div className="p-4">
      {/* 페이지 제목 */}
      <h1 className="text-2xl font-bold mb-4">홈 페이지</h1>
      {/* 페이지 내용 Placeholder */}
      <p>이곳은 담담 서비스의 메인 화면입니다.</p>
      {/* TODO: 실제 홈 화면 콘텐츠 구현 */}
    </div>
  );
}
