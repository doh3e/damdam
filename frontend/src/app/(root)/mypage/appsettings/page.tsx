'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { apiClient } from '@/shared/api/axiosInstance';
import { useSettingsStore } from '@/app/store/userSettingStore';
import { Switch } from '@/shared/ui/switch';
import AlertModal from '@/shared/ui/alertmodal';
import { useRouter } from 'next/navigation';

const personalityOptions = [
  { key: 'kind', label: '상냥함', description: '부드럽고 따뜻한 말투로 대화합니다.' },
  { key: 'polite', label: '정중함', description: '매너 바르고 공손한 말투로 대화합니다.' },
  { key: 'strict', label: '엄격함', description: '명확하고 직설적인 말투로 대화합니다.' },
  { key: 'friendly', label: '친근함', description: '친구처럼 편안하고 친근한 말투로 대화합니다.' },
];

export default function AppSettingsPage() {
  const router = useRouter();
  const {
    isDarkmode,
    isAlarm,
    botImageUrl,
    botImageFile,
    botCustom,
    setIsDarkmode,
    setIsAlarm,
    setBotImageUrl,
    setBotImageFile,
    setBotCustom,
    setNickname,
    setEmail,
  } = useSettingsStore();

  const [preview, setPreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // 초기 설정 불러오기
  const fetchSettings = async () => {
    try {
      const data = await apiClient.get<{
        nickname: string;
        email: string;
        isDarkmode: boolean;
        isAlarm: boolean;
        botImage: string;
        botCustom: string;
      }>('/users/setting');

      // zustand 저장
      setNickname(data.nickname);
      setEmail(data.email);
      setIsDarkmode(data.isDarkmode);
      setIsAlarm(data.isAlarm);
      setBotImageUrl(data.botImage);

      if (!data.botCustom) {
        setBotCustom('kind');
        await updateSettings({ botCustom: 'kind' });
      } else {
        setBotCustom(data.botCustom);
      }
    } catch (err) {
      console.error('설정 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // 이미지 미리보기
  useEffect(() => {
    if (botImageFile) {
      const url = URL.createObjectURL(botImageFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(botImageUrl || '/profile.png');
    }
  }, [botImageFile, botImageUrl]);

  // 설정 자동 저장
  const updateSettings = async (extra?: Record<string, string | boolean>, extraImageFile?: File | null) => {
    const formData = new FormData(); // formdata 생성

    // extra에 값이 있으면 그걸 우선 사용, 없으면 상태값 사용
    formData.append('isDarkmode', String(extra?.isDarkmode ?? isDarkmode));
    formData.append('isAlarm', String(extra?.isAlarm ?? isAlarm));

    if (extraImageFile) {
      formData.append('botImage', extraImageFile); // 직접 받은 파일 우선
    } else if (botImageFile) {
      formData.append('botImage', botImageFile);
    }

    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        if (!['isDarkmode', 'isAlarm'].includes(key)) {
          formData.set(key, String(value));
        }
      });
    }

    // 콘솔로 FormData 전체 출력
    console.log('--- FormData 전송 내용 ---');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File] name=${value.name}, type=${value.type}, size=${value.size} bytes`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    try {
      await apiClient.patch<FormData, void>('/users/setting', formData);
      setBotImageFile(null); // 저장 후 초기화
      await fetchSettings();
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
          <button onClick={() => router.push('/mypage')} className="text-lg">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          앱 설정
        </h2>

        <div className="space-y-6">
          {/* 다크 모드 */}
          <div className="flex items-center justify-between">
            <span className="text-base">다크 모드</span>
            <Switch
              checked={isDarkmode}
              onCheckedChange={async (checked) => {
                setIsDarkmode(checked);
                await updateSettings({ isDarkmode: checked });
              }}
            />
          </div>

          {/* 알림 수신 */}
          <div className="flex items-center justify-between">
            <span className="text-base">알림 수신</span>
            <Switch
              checked={isAlarm}
              onCheckedChange={async (checked) => {
                setIsAlarm(checked);
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
                unoptimized // 외부 S3 이미지일 경우 필수
                onClick={() => document.getElementById('botImageInput')?.click()}
              />

              <input
                type="file"
                id="botImageInput"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await updateSettings(undefined, file);
                    setBotImageFile(null);
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
                    setBotCustom(key);
                    await updateSettings({ botCustom: key });
                  }}
                  className={`border rounded p-4 text-left ${
                    botCustom === key ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                  }`}
                >
                  <div className="font-semibold">{label}</div>
                  <div className="text-sm text-gray-500 mt-1">{description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 알림 모달 */}
          {showSuccess && <AlertModal message="설정이 저장되었습니다!" onClose={() => setShowSuccess(false)} />}
          {showError && <AlertModal message="설정 저장에 실패했습니다." onClose={() => setShowError(false)} />}
        </div>
      </section>
    </div>
  );
}
