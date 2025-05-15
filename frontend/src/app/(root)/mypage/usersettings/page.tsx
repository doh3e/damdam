'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
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

const defaultUserInfo: UserInfo = {
  email: 'user@example.com',
  nickname: '내담이',
  gender: '남성',
  job: '미입력',
  mbti: '미입력',
};

export default function UserSettingsPage() {
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveUserInfo = () => {
    // TODO: API 호출하여 사용자 정보 저장
    alert('정보가 저장되었습니다.');
  };

  return (
    <div className="p-4 space-y-6 flex flex-col items-center">
      {/* 내 정보 관리 */}
      <section className="bg-white w-full max-w-xl mx-auto rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-5">
          <button onClick={() => (window.location.href = '/mypage')} className="text-lg">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          나의 정보 관리
        </h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-300">
            <Image src="/damdami.png" alt="프로필 이미지" fill style={{ objectFit: 'cover' }} />
            <button
              onClick={() => alert('프로필 이미지 변경 기능 구현 필요')}
              className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow"
              aria-label="프로필 이미지 변경"
            >
              ✏️
            </button>
          </div>
          <div>
            <div className="flex items-center">
              <img src="/naver.png" alt="네이버로그인" width={24} height={24} />
              <div className="mb-2 font-semibold">jun002@naver.com</div>
            </div>
            <div className="text-gray-500">내담이</div>
          </div>
        </div>
        <form className="grid grid-cols-2 gap-4 max-w-xl">
          <label className="flex flex-col">
            닉네임
            <input
              type="text"
              value={defaultUserInfo.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              className="border rounded px-3 py-2"
            />
          </label>
          <label className="flex flex-col">
            성별
            <select
              value={defaultUserInfo.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option>남성</option>
              <option>여성</option>
              <option>기타</option>
            </select>
          </label>
          <label className="flex flex-col">
            직업
            <input
              type="text"
              value={defaultUserInfo.job}
              onChange={(e) => handleInputChange('job', e.target.value)}
              className="border rounded px-3 py-2"
            />
          </label>
          <label className="flex flex-col">
            MBTI
            <input
              type="text"
              value={defaultUserInfo.mbti}
              onChange={(e) => handleInputChange('mbti', e.target.value)}
              className="border rounded px-3 py-2"
            />
          </label>
        </form>
        <button
          onClick={handleSaveUserInfo}
          className="mt-6 bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          정보 수정
        </button>
      </section>
    </div>
  );
}
