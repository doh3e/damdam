import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProfileForm from './ProfileForm';

export default function ProfilePage() {
  return (
    <div className="flex flex-col justify-center items-center py-3">
      {/* 환영합니다 카드 */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center">
        {/* 로고 및 환영문구 */}
        <div className="flex items-center space-x-2">
          <Image src="/pixeldamdam.png" alt="담담 로고" width={36} height={36} className="mb-2 ml-2" />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">반가워요!</h1>
        </div>
        <p className="text-sm text-gray-500">담담이가 기다리고 있었어요! 함께 마음을 나눠보아요</p>

        {/* 회원정보 입력 안내 */}
        <div className="mt-4 w-full px-3 py-4 rounded bg-yellow-50">
          <h2 className="text-base underline underline-offset-4 font-semibold text-gray-800 mb-2">
            회원정보 입력 안내
          </h2>
          <p className="text-sm text-gray-600">
            담담이와 더 편하게 대화할 수 있도록 <strong>기본정보</strong>를 <br />
            설정할 수 있어요! 원하는 항목만 <strong>선택적으로 설정</strong>하거나 <strong>건너뛰기</strong>하실 수
            있어요! <br />
            <strong>마이페이지</strong>에서 언제든 다시 수정해 보세요!
          </p>
        </div>

        {/* 회원정보 입력 폼 */}
        <ProfileForm />

        {/* 회원정보 입력 버튼 */}
        <div className="w-full flex flex-col gap-3 mt-4">
          <Link
            href="/signup/welcome"
            className="py-3 rounded-xl text-center font-semibold text-white bg-[#e24b4b] hover:scale-103 transition duration-300"
          >
            저장하기
          </Link>
          <Link
            href="/signup/welcome"
            className="py-3 rounded-xl text-center font-semibold bg-gray-200 hover:scale-103 transition duration-300"
          >
            건너뛰기
          </Link>
        </div>
      </div>
    </div>
  );
}
