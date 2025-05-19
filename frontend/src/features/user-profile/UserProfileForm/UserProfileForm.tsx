'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AlertModal from '@/shared/ui/alertmodal';
import { getUserProfile, updateUserProfile } from '@/entities/user/model/api';
import { useProfileStore } from '@/app/store/userProfileStore';
import { Gender, GenderLabel, Age, AgeLabel, MBTI, MBTILabel } from '@/shared/consts/enum';

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
  const [showAlert, setShowAlert] = useState(false);
  const [showErrorAlert, setErrorAlert] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile();
        setNickname(profile.nickname);
        setAge(profile.age);
        setGender(profile.gender);
        setCareer(profile.career);
        setMbti(profile.mbti);
        setProfileImageUrl(profile.profileImage);
      } catch (err) {
        console.error('프로필 불러오기 실패', err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profileImage) {
      const url = URL.createObjectURL(profileImage);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(profileImageUrl ?? null);
    }
  }, [profileImage, profileImageUrl]);

  const handleSave = async () => {
    const formData = new FormData();
    if (profileImage) formData.append('profileImage', profileImage);
    formData.append('nickname', (nickname ?? '').trim() || '내담이');
    formData.append('age', age);
    formData.append('gender', gender);
    formData.append('career', career);
    formData.append('mbti', mbti);

    try {
      const updated = await updateUserProfile(formData);
      setNickname(updated.nickname);
      setAge(updated.age);
      setGender(updated.gender);
      setCareer(updated.career);
      setMbti(updated.mbti);
      setProfileImageUrl(updated.profileImage);
      setProfileImage(null);
      setShowAlert(true);
    } catch (e) {
      setErrorAlert(true);
    }
  };

  return (
    <form className="w-full flex flex-col gap-4">
      {/* 프로필 이미지 */}
      <div>
        <span className="font-semibold">프로필 이미지</span>
        <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-300 my-2 group">
          <Image
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setProfileImage(file);
            }}
          />
          <button
            type="button"
            onClick={() => document.getElementById('userImageInput')?.click()}
            className="absolute bottom-1.5 right-1.5 bg-white rounded-full p-1 shadow"
          >
            ✏️
          </button>
        </div>
      </div>

      {/* 닉네임 */}
      <div>
        <label className="block font-bold mb-1">닉네임</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* 나이 */}
      <div>
        <label className="block font-bold mb-1">나이</label>
        <select
          value={age || Age.UNKNOWN}
          onChange={(e) => setAge(e.target.value as Age)}
          className="w-full border rounded px-3 py-2"
        >
          {Object.entries(Age).map(([_, val]) => (
            <option key={val} value={val}>
              {AgeLabel[val as Age]}
            </option>
          ))}
        </select>
      </div>

      {/* 성별 */}
      <div>
        <label className="block font-bold mb-1">성별</label>
        <select
          value={gender || Gender.UNKNOWN}
          onChange={(e) => setGender(e.target.value as Gender)}
          className="w-full border rounded px-3 py-2"
        >
          {Object.entries(Gender).map(([_, val]) => (
            <option key={val} value={val}>
              {GenderLabel[val as Gender]}
            </option>
          ))}
        </select>
      </div>

      {/* 직업 */}
      <div>
        <label className="block font-bold mb-1">직업</label>
        <input value={career} onChange={(e) => setCareer(e.target.value)} className="w-full border rounded px-3 py-2" />
      </div>

      {/* MBTI */}
      <div>
        <label className="block font-bold mb-1">MBTI</label>
        <select
          value={mbti || MBTI.UNKNOWN}
          onChange={(e) => setMbti(e.target.value as MBTI)}
          className="w-full border rounded px-3 py-2"
        >
          {Object.entries(MBTI).map(([_, val]) => (
            <option key={val} value={val}>
              {MBTILabel[val as MBTI]}
            </option>
          ))}
        </select>
      </div>

      {/* 저장 버튼 */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full py-3 bg-orange-500 text-white font-semibold rounded hover:bg-orange-600"
      >
        저장하기
      </button>

      {showAlert && <AlertModal message="프로필이 저장되었습니다." onClose={() => setShowAlert(false)} />}
      {showErrorAlert && <AlertModal message="저장에 실패했습니다." onClose={() => setErrorAlert(false)} />}
    </form>
  );
}
