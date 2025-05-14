'use client';
import React, { useState } from 'react';
import Image from 'next/image';
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

const personalityOptions = [
  { key: 'friendly', label: '상냥함', description: '부드럽고 따뜻한 말투로 대화합니다.' },
  { key: 'polite', label: '정중함', description: '매너 바르고 공손한 말투로 대화합니다.' },
  { key: 'strict', label: '엄격함', description: '명확하고 직설적인 말투로 대화합니다.' },
  { key: 'friendly2', label: '친근함', description: '친구처럼 편안하고 친근한 말투로 대화합니다.' },
];

export default function MyPage() {
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);
  const [darkMode, setDarkMode] = useState(false);
  const [alarmOn, setAlarmOn] = useState(true);
  const [botPersonality, setBotPersonality] = useState('friendly');
  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleBotPersonalityChange = (key: string) => {
    setBotPersonality(key);
  };

  const handleSaveUserInfo = () => {
    // TODO: API 호출하여 사용자 정보 저장
    alert('정보가 저장되었습니다.');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 내 정보 관리 */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <button onClick={() => alert('뒤로가기 구현 필요')} className="text-lg">
            ←
          </button>
          내 정보 관리
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
            <div className="flex items-center gap-x-3">
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

      {/* 앱 설정 */}
      <section>
        <h2 className="text-xl font-bold mb-4">앱 설정</h2>
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center justify-between">
            <span>다크 모드</span>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span>알림 수신</span>
            <input
              type="checkbox"
              checked={alarmOn}
              onChange={() => setAlarmOn(!alarmOn)}
              className="toggle toggle-primary"
            />
          </div>
          <div>
            <span className="font-semibold">담담이 프로필 이미지</span>
            <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-300 my-2">
              <Image src="/damdami.png" alt="담담이 프로필" fill style={{ objectFit: 'cover' }} />
              <button
                onClick={() => alert('담담이 프로필 이미지 변경 기능 구현 필요')}
                className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow"
                aria-label="담담이 프로필 이미지 변경"
              >
                ✏️
              </button>
            </div>
          </div>
          <div>
            <span className="font-semibold">담담이 성격 설정</span>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {personalityOptions.map(({ key, label, description }) => (
                <button
                  key={key}
                  onClick={() => handleBotPersonalityChange(key)}
                  className={`border rounded p-4 text-left ${
                    botPersonality === key ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                  }`}
                >
                  <div className="font-semibold">{label}</div>
                  <div className="text-sm text-gray-500 mt-1">{description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
