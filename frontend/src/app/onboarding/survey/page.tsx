import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function SurveyPage() {
  return (
    <div className="flex flex-col justify-center items-center py-1">
      {/* 사전설문 카드 */}
      <div className="w-full max-w-xl h-full min-h-screen bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col">
        {/* 로고 및 환영문구 */}
        <div className="flex items-center space-x-2">
          <Image src="/pixeldamdam.png" alt="담담 로고" width={36} height={36} className="mb-2 ml-2" />
          <h5 className="text-2xl font-medium text-gray-900 mb-1">
            <span className="font-bold px-1.5 py-0.5 rounded bg-orange-100">user</span> 님에 대해 더 알고 싶어요!
          </h5>
        </div>
        <p className="text-sm text-gray-500">
          짧은 설문을 통해 마음을 더 잘 이해하고, 더 정확하고 따뜻한 상담을 드릴 수 있어요.
        </p>

        {/* 설문지 본문 */}

        {/* 사전설문 버튼 */}
      </div>
    </div>
  );
}
