'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
const personalityOptions = [
  { key: 'friendly', label: '상냥함', description: '부드럽고 따뜻한 말투로 대화합니다.' },
  { key: 'polite', label: '정중함', description: '매너 바르고 공손한 말투로 대화합니다.' },
  { key: 'strict', label: '엄격함', description: '명확하고 직설적인 말투로 대화합니다.' },
  { key: 'friendly2', label: '친근함', description: '친구처럼 편안하고 친근한 말투로 대화합니다.' },
];

export default function AppSettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [alarmOn, setAlarmOn] = useState(true);
  const [botPersonality, setBotPersonality] = useState('friendly');
  const handleBotPersonalityChange = (key: string) => {
    setBotPersonality(key);
  };
  return (
    <div className="p-4 space-y-6 flex flex-col items-center">
      {/* 앱 설정 */}
      <section className="bg-white w-full max-w-xl mx-auto rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-5">
          <button onClick={() => (window.location.href = '/mypage')} className="text-lg">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          앱 설정
        </h2>

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
                className="absolute bottom-2 right-2 bg-white rounded-full p-0.5 shadow"
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
