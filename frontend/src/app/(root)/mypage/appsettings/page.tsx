'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '@/shared/api/axiosInstance';
import { useSettingsStore } from '@/app/store/userSettingStore';
import { Switch } from '@/shared/ui/switch';
import AlertModal from '@/shared/ui/alertmodal';

const personalityOptions = [
  { key: 'kind', label: '상냥함', description: '부드럽고 따뜻한 말투로 대화합니다.' },
  { key: 'polite', label: '정중함', description: '매너 바르고 공손한 말투로 대화합니다.' },
  { key: 'strict', label: '엄격함', description: '명확하고 직설적인 말투로 대화합니다.' },
  { key: 'friendly', label: '친근함', description: '친구처럼 편안하고 친근한 말투로 대화합니다.' },
];

export default function AppSettingsPage() {
  const { darkMode, alarmOn, botImage, botPersonality, setDarkMode, setAlarmOn, setBotImage, setBotPersonality } =
    useSettingsStore();

  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // 최초 설정 불러오기
  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get('/users/setting');
      const data = res.data;
      setDarkMode(data.isDarkmode);
      setAlarmOn(data.isAlarm);
      setBotImage(data.botImage); // 서버에서 받은 URL(string)으로 설정
    } catch (err) {
      console.error('설정 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // 이미지 미리보기 처리
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof botImage === 'string') {
      setPreview(botImage); // 서버 URL 사용
    } else {
      setPreview(null);
    }
  }, [imageFile, botImage]);

  // 서버 저장 (FormData 사용)
  const updateSettings = async (extra?: Record<string, string | boolean>) => {
    const formData = new FormData();

    // 신규 이미지 파일 추가
    if (imageFile) {
      formData.append('botImage', imageFile);
    }

    // 기본 설정값 추가
    formData.append('isDarkmode', String(darkMode));
    formData.append('isAlarm', String(alarmOn));
    formData.append('botCustom', botPersonality);

    // 추가 파라미터 처리
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    try {
      await axiosInstance.patch('/users/setting', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchSettings(); // 저장 후 최신 데이터 다시 불러오기
      setShowSuccess(true);
    } catch (err) {
      console.error('설정 저장 실패:', err);
      setShowError(true);
    }
  };

  return (
    <div className="p-4 space-y-6 flex flex-col items-center">
      <section className="bg-white w-full max-w-xl mx-auto rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-5">
          <button onClick={() => (window.location.href = '/mypage')} className="text-lg">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          앱 설정
        </h2>

        <div className="space-y-6">
          {/* 다크 모드 */}
          <div className="flex items-center justify-between">
            <span className="text-base">다크 모드</span>
            <Switch
              checked={darkMode}
              onCheckedChange={async (checked) => {
                setDarkMode(checked);
                await updateSettings({ isDarkmode: checked });
              }}
            />
          </div>

          {/* 알림 수신 */}
          <div className="flex items-center justify-between">
            <span className="text-base">알림 수신</span>
            <Switch
              checked={alarmOn}
              onCheckedChange={async (checked) => {
                setAlarmOn(checked);
                await updateSettings({ isAlarm: checked });
              }}
            />
          </div>

          {/* 프로필 이미지 */}
          <div>
            <span className="font-semibold">담담이 프로필 이미지</span>
            <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-300 my-2 group">
              <Image
                src={preview || '/profile.png'}
                alt="담담이 프로필"
                fill
                className="object-cover cursor-pointer"
                onClick={() => document.getElementById('botImageInput')?.click()}
              />

              <input
                type="file"
                id="botImageInput"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file); // File 객체 저장 (Zustand에는 저장하지 않음)
                    updateSettings({}); // 바로 저장
                  }
                }}
              />

              <button
                type="button"
                onClick={() => document.getElementById('botImageInput')?.click()}
                className="absolute bottom-1.5 right-1.5 bg-white rounded-full p-1 shadow hover:scale-105 transition"
                aria-label="담담이 프로필 이미지 변경"
              >
                ✏️
              </button>
            </div>
          </div>

          {/* 성격 선택 */}
          <div>
            <span className="font-semibold">담담이 성격 설정</span>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {personalityOptions.map(({ key, label, description }) => (
                <button
                  key={key}
                  onClick={async () => {
                    setBotPersonality(key);
                    await updateSettings({ botCustom: key });
                  }}
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
          {/* alert 모달 */}
          {showSuccess && <AlertModal message="설정이 저장되었습니다!" onClose={() => setShowSuccess(false)} />}
          {showError && <AlertModal message="설정 저장에 실패했습니다." onClose={() => setShowError(false)} />}
        </div>
      </section>
    </div>
  );
}
