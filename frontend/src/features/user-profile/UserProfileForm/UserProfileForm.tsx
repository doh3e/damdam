'use client';
import React, { useEffect, useState } from 'react';
import { useProfileStore } from '@/app/store/userProfileStore';
import { getUserProfile, updateUserProfile } from '@/entities/user/model/api';
import { Gender, Age, MBTI } from '@/shared/consts/enum';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { UserProfile } from '@/entities/user/model/types';

export default function UserProfileForm() {
  const {
    nickname,
    setNickname,
    age,
    setAge,
    gender,
    setGender,
    career,
    setCareer,
    mbti,
    setMbti,
    profileImage,
    setProfileImage,
    profileImageUrl,
    setProfileImageUrl,
  } = useProfileStore();

  const [preview, setPreview] = useState<string | null>(null);

  // 이미지 미리보기 URL 처리
  useEffect(() => {
    if (profileImage) {
      const url = URL.createObjectURL(profileImage);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(profileImageUrl || null);
    }
  }, [profileImage, profileImageUrl]);

  // 초기 유저 정보 불러오기
  const { data } = useQuery<UserProfile, Error>({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
  });

  useEffect(() => {
    if (data) {
      setNickname(data.nickname);
      setAge(data.age);
      setGender(data.gender);
      setCareer(data.career);
      setMbti(data.mbti);
      setProfileImageUrl(data.profileImage);
    }
  }, [data]);

  // 저장 요청
  const handleSave = async () => {
    const formData = new FormData();
    if (profileImage) formData.append('profileImage', profileImage);
    formData.append('nickname', nickname);
    formData.append('age', age);
    formData.append('gender', gender);
    formData.append('career', career);
    formData.append('mbti', mbti);

    try {
      await updateUserProfile(formData);
      alert('프로필이 성공적으로 저장되었습니다!');
    } catch (error) {
      alert('저장에 실패했습니다.');
    }
  };

  // 이미지 변경
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setProfileImage(file || null);
  };

  return (
    <form className="w-full flex flex-col gap-4">
      {/* 프로필 이미지 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">프로필 이미지</label>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-300">
            {preview ? (
              <img src={preview} alt="프로필 이미지" className="object-cover w-full h-full" />
            ) : (
              <Image src="/profile.png" alt="기본 이미지" fill className="object-cover" />
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
      </div>

      {/* 닉네임 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
          maxLength={10}
        />
      </div>

      {/* 나이 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">나이</label>
        <select
          value={age}
          onChange={(e) => setAge(e.target.value as Age)}
          className="w-full border rounded-md px-3 py-2"
        >
          {Object.entries(Age).map(([key, val]) => (
            <option key={key} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* 성별 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
          className="w-full border rounded-md px-3 py-2"
        >
          {Object.entries(Gender).map(([key, val]) => (
            <option key={key} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* 직업 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">직업</label>
        <input
          type="text"
          value={career}
          onChange={(e) => setCareer(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      {/* MBTI */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">MBTI</label>
        <select
          value={mbti}
          onChange={(e) => setMbti(e.target.value as MBTI)}
          className="w-full border rounded-md px-3 py-2"
        >
          {Object.entries(MBTI)
            .filter(([_, val]) => val !== MBTI.UNKNOWN)
            .map(([key, val]) => (
              <option key={key} value={val}>
                {val}
              </option>
            ))}
        </select>
      </div>

      {/* 저장 버튼 */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full mt-4 py-3 bg-orange-500 text-white rounded font-semibold hover:bg-orange-600"
      >
        저장하기
      </button>
    </form>
  );
}
