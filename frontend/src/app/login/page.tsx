'use client';

import React from 'react';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex flex-col justify-center items-center py-12">
      {/* 로그인 카드 */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center">
        {/* 로고 및 서비스명 */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/damdami.png" // 실제 로고 경로로 교체
            alt="담담 로고"
            width={48}
            height={48}
            className="mb-2"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">담담 (DAMDAM)</h1>
          <p className="text-sm text-gray-500">AI 심리상담 챗봇 서비스</p>
        </div>

        {/* 안내 문구 */}
        <div className="w-full mb-6">
          <p className="text-center text-base text-gray-700 font-medium">소셜 계정으로 간편하게 로그인하세요</p>
        </div>

        {/* 소셜 로그인 버튼 */}
        <div className="w-full flex flex-col gap-3">
          <a
            href="http://localhost:8080/oauth2/authorization/naver"
            className="flex items-center justify-center py-3 rounded-xl font-semibold text-white bg-[#03C75A] hover:bg-[#02b152] transition"
          >
            <Image src="/naver.png" alt="네이버" width={24} height={24} className="mr-2" />
            네이버로 로그인
          </a>
          <a
            href="http://localhost:8080/oauth2/authorization/kakao"
            className="flex items-center justify-center py-3 rounded-xl font-semibold text-gray-900 bg-[#FEE500] hover:bg-yellow-300 transition"
          >
            <Image src="/kakao.png" alt="카카오" width={24} height={24} className="mr-2" />
            카카오로 로그인
          </a>
          <a
            href="http://localhost:8080/oauth2/authorization/google"
            className="flex items-center justify-center py-3 rounded-xl font-semibold text-white bg-[#EA4335] hover:bg-[#d93025] transition"
          >
            <Image src="/google.png" alt="구글" width={24} height={24} className="mr-2" />
            Google로 로그인
          </a>
        </div>

        {/* 하단 안내 */}
        <div className="w-full mt-8 text-xs text-center text-gray-400">
          소셜 계정으로 로그인하면 자동으로 회원가입이 진행됩니다.
        </div>
      </div>
    </div>
  );
}
