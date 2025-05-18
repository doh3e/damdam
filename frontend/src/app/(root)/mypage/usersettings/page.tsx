'use client';
import React from 'react';
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
      </section>
    </div>
  );
}
