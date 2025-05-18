'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import UserProfileForm from '@/features/user-profile/UserProfileForm/UserProfileForm';

export default function UserSettingsPage() {
  return (
    <div className="p-4 space-y-6 flex flex-col items-center">
      <section className="bg-white w-full max-w-xl rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-5">
          <button onClick={() => (window.location.href = '/mypage')} className="text-lg">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          내 정보 관리
        </h2>
        {/* 프로필 입력 폼 */}
        <UserProfileForm />

        {/* 저장 버튼 */}
        <button
          className="mt-6 bg-orange-500 text-white w-full py-3 rounded font-semibold"
          onClick={() => {
            // TODO: PATCH 요청 추가
            alert('저장 로직 작성 필요!');
          }}
        >
          저장하기
        </button>
      </section>
    </div>
  );
}
