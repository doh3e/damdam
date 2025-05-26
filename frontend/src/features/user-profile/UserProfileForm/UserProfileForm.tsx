'use client';
import React, { useEffect, useState } from 'react';
import { useProfileStore } from '@/app/store/userProfileStore';
import { getUserProfile, updateUserProfile } from '@/entities/user/model/api';
import { Gender, GenderLabel, Age, AgeLabel, MBTI, MBTILabel } from '@/shared/consts/enum';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import AlertModal from '@/shared/ui/alertmodal';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UserProfileForm() {
  const {
    nickname,
    age,
    gender,
    career,
    mbti,
    profileImage,
    profileImageUrl,
    setProfile,
    setProfileImage,
    setProfileImageUrl,
    setAge,
    setGender,
    setCareer,
    setMbti,
  } = useProfileStore();

  const [preview, setPreview] = useState<string | null>(null); // 미리보기 이미지
  const [showAlert, setShowAlert] = useState(false); // 성공 모달
  const [showErrorAlert, setErrorAlert] = useState(false); // 실패 모달
  const queryClient = useQueryClient(); // react-query 캐시 조작 객체

  // 서버에서 유저 정보 가져오기 GET
  const { data } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
  });

  // zustand 상태에 저장(초기화)
  useEffect(() => {
    if (data) {
      setProfile({
        nickname: data.nickname ?? '내담이',
        age: data.age ?? Age.UNKNOWN,
        gender: data.gender ?? Gender.UNKNOWN,
        career: data.career ?? '',
        mbti: data.mbti ?? MBTI.UNKNOWN,
        profileImageUrl: data.profileImage ?? null,
      });
    }
  }, [data, setProfile]);

  // 이미지 미리보기
  useEffect(() => {
    if (profileImage) {
      const url = URL.createObjectURL(profileImage);
      setPreview(url);
      return () => URL.revokeObjectURL(url); // 메모리 해제
    }
    const base64 = typeof window !== 'undefined' ? localStorage.getItem('profile-image-preview') : null;
    if (base64) setPreview(base64);
    else if (profileImageUrl) setPreview(profileImageUrl);
    else setPreview('/profile.png'); // 기본 이미지
  }, [profileImage, profileImageUrl]);

  // 저장 처리 PATCH
  const handleSave = async () => {
    try {
      if (!nickname.trim()) {
        alert('닉네임을 입력해주세요.');
        return;
      }

      const formData = new FormData();
      if (profileImage) formData.append('profileImage', profileImage);
      formData.append('nickname', nickname.trim());
      formData.append('age', age);
      formData.append('gender', gender);
      formData.append('career', career);
      formData.append('mbti', mbti);

      // 서버에 PATCH 요청
      await updateUserProfile(formData);
      await queryClient.invalidateQueries({ queryKey: ['userProfile'] }); // react-query 캐시 무효화 → 자동 GET

      setProfileImage(null); // 업로드한 이미지 초기화
      if (typeof window !== 'undefined') {
        localStorage.removeItem('profile-image-preview');
      }

      // 성공 모달
      setShowAlert(true);
    } catch (error) {
      console.error('프로필 저장 에러:', error);
      setErrorAlert(true); // 실패 모달
    }
  };

  return (
    <form className="w-full flex flex-col gap-4">
      <div>
        {/* 프로필 사진 */}
        <span className="font-semibold">프로필 이미지</span>
        <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-300 my-2 group">
          <Image
            key={preview}
            src={preview || '/profile.png'}
            alt="프로필 이미지"
            fill
            className="object-cover cursor-pointer"
            onClick={() => document.getElementById('userImageInput')?.click()}
          />
          <input
            type="file"
            id="userImageInput"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                setProfileImage(file);
                const base64 = await fileToBase64(file);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('profile-image-preview', base64);
                }
              }
            }}
          />
          <button
            type="button"
            onClick={() => document.getElementById('userImageInput')?.click()}
            className="absolute bottom-1.5 right-1.5 bg-white rounded-full p-1 shadow hover:scale-105 transition"
            aria-label="프로필 이미지 변경"
          >
            ✏️
          </button>
        </div>
      </div>

      {/* 닉네임 */}
      <div>
        <label className="block text-lg font-bold text-gray-700 mb-1">닉네임</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => useProfileStore.getState().setNickname(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
          maxLength={10}
        />
      </div>

      {/* 나이 */}
      <div>
        <label className="block text-lg font-bold text-gray-700 mb-1">나이</label>
        <select
          value={age}
          onChange={(e) => setAge(e.target.value as Age)}
          className="w-full border rounded-md px-3 py-2"
        >
          {Object.entries(Age).map(([key, val]) => (
            <option key={key} value={val}>
              {AgeLabel[val as Age]}
            </option>
          ))}
        </select>
      </div>

      {/* 성별 */}
      <div>
        <label className="block text-lg font-bold text-gray-700 mb-1">성별</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
          className="w-full border rounded-md px-3 py-2"
        >
          {Object.entries(Gender).map(([key, val]) => (
            <option key={key} value={val}>
              {GenderLabel[val as Gender]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-lg font-bold text-gray-700 mb-1">직업</label>
        <input
          type="text"
          value={career}
          onChange={(e) => setCareer(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-lg font-bold text-gray-700 mb-1">MBTI</label>
        <select
          value={mbti}
          onChange={(e) => setMbti(e.target.value as MBTI)}
          className="w-full border rounded-md px-3 py-2"
        >
          {Object.entries(MBTI).map(([key, val]) => (
            <option key={key} value={val}>
              {MBTILabel[val as MBTI]}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full mt-4 py-3 bg-orange-500 text-white rounded font-semibold hover:bg-orange-600"
      >
        저장하기
      </button>

      {/* 모달 */}
      {showAlert && <AlertModal message="성공적으로 저장되었습니다!" onClose={() => setShowAlert(false)} />}
      {showErrorAlert && <AlertModal message="저장에 실패하였습니다." onClose={() => setErrorAlert(false)} />}
    </form>
  );
}
