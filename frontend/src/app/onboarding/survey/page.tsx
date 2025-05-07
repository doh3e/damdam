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
        <div className="mt-4 w-full px-3 py-4 rounded bg-yellow-50">
          <h2 className="text-base underline underline-offset-4 font-semibold text-gray-800 mb-2">사전설문 안내</h2>
          <p className="text-sm text-gray-600">
            간단한 사전 설문을 통해 담담이가 <strong>더 맞춤화된 상담</strong>과 <br />
            <strong>정확한 분석 레포트</strong>를 제공할 수 있어요! <br />
            설문은 약 <strong>10분</strong>정도 소요되며, 지금 건너뛰어도 괜찮아요. <br />
            <strong>마이페이지</strong>에서 언제든 다시 참여하실 수 있어요!
          </p>
        </div>

        {/* 사전설문 버튼 */}
        <div className="w-full flex gap-3 mt-4">
          <Link
            href="/signup/survey"
            className="py-3 rounded-xl text-center font-semibold text-white bg-[#e24b4b] hover:scale-103 transition duration-300"
          >
            사전설문하러 가기
          </Link>
          <Link
            href="/"
            className="py-3 rounded-xl text-center font-semibold bg-gray-200 hover:scale-103 transition duration-300"
          >
            건너뛰기
          </Link>
        </div>
      </div>
    </div>
  );
}
