'use client';
import React from 'react';

/**
 * MyPage 컴포넌트: '/mypage' 경로에 해당하는 마이페이지입니다.
 * 페이지 너비는 RootLayout에 의해 제어됩니다.
 * @returns {JSX.Element} 마이페이지 엘리먼트
 */

type UserInfo = {
  email: string;
  nickname: string;
  gender: string;
  job: string;
  mbti: string;
};

export default function MyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1>마이페이지</h1>
      {/* 내 정보 관리 */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <button onClick={() => alert('뒤로가기')} className="text-lg"></button>
        </h2>
      </section>
      {/* 페이지 내용 Placeholder */}
      <p>회원 정보 수정, 환경 설정, 문의 내역 등을 관리할 수 있습니다.</p>
      {/* TODO: 실제 마이페이지 관련 기능 구현 */}
    </div>
  );
}
