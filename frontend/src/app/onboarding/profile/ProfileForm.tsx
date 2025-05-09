'use client';
import React, { useState } from 'react';
import { Gender, Age, MBTI } from '@/shared/consts/enum';
import Image from 'next/image';

export default function ProfileInputPage() {
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [age, setAge] = useState<Age | ''>('');
  const [mbti, setMbti] = useState<MBTI | ''>('');
  const [career, setCareer] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const genderOptions = [
    { value: Gender.UNKOWN, label: '선택 안함' },
    { value: Gender.MALE, label: '남성' },
    { value: Gender.FEMALE, label: '여성' },
    { value: Gender.OTHER, label: '기타' },
  ];

  const ageOptions = [
    { value: Age.UNKNOWN, label: '선택 안함' },
    { value: Age.UNDER_TEN, label: '10세 미만' },
    { value: Age.TEENS, label: '10대' },
    { value: Age.TWENTIES, label: '20대' },
    { value: Age.THIRTIES, label: '30대' },
    { value: Age.FORTIES, label: '40대' },
    { value: Age.FIFTIES, label: '50대' },
    { value: Age.SIXTIES, label: '60대' },
    { value: Age.SEVENTIES, label: '70대' },
    { value: Age.EIGHTIES, label: '80대' },
    { value: Age.NINETIES, label: '90대' },
    { value: Age.HUNDRED_UP, label: '100세 이상' },
  ];

  const mbtiOptions = Object.values(MBTI)
    .filter((v) => v !== MBTI.UNKNOWN)
    .map((v) => ({ value: v, label: v }));

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    } else {
      setProfileImage(null);
      setProfilePreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <form className="w-full max-w-md p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* 닉네임 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 설정해볼까요?"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
            maxLength={10}
          />
        </div>
        {/* 나이 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">나이</label>
          <select
            value={age}
            onChange={(a) => setAge(a.target.value as Age)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            {ageOptions.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        {/* 성별 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
          <div className="flex gap-2">
            {genderOptions.map((g) => (
              <button
                type="button"
                key={g.value}
                className={`px-4 py-2 rounded-full border ${gender === g.value ? 'bg-orange-100 border-orange-400' : 'bg-gray-50 border-gray-200'}`}
                onClick={() => setGender(g.value)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        {/* 직업 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">직업</label>
          <input
            type="text"
            value={career}
            onChange={(e) => setCareer(e.target.value)}
            placeholder="직업(군)을 입력해주세요!"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
            maxLength={10}
          />
        </div>

        {/* MBTI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">MBTI</label>
          <select
            value={mbti}
            onChange={(e) => setMbti(e.target.value as MBTI)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="UNKOWN">선택안함</option>
            {mbtiOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.value}
              </option>
            ))}
          </select>
        </div>
        {/* 프로필이미지 */}
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">프로필 이미지</label>
          {profilePreview ? (
            <img src={profilePreview} alt="프로필 미리보기" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="relative w-20 h-20">
              <Image src="/profile.png" alt="기본 프로필 이미지" fill className="object-contain" />
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleProfileImageChange} className="mt-1" />
        </div>
      </form>
    </div>
  );
}
