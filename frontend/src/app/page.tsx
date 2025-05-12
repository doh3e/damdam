import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * HomePage 컴포넌트: 애플리케이션의 루트 경로('/')에 해당하는 메인 페이지입니다.
 * 페이지 너비는 RootLayout에 의해 제어됩니다.
 * @returns {JSX.Element} 홈 페이지 엘리먼트
 */
export default function HomePage() {
  return (
    <div className="p-4 space-y-6">
      {/* 서비스 소개 */}
      <section className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold mb-2 text-red-500">서비스 소개</h3>
        <p className="text-gray-700 mb-4">
          담담은 자연어 처리(NLP) 기술을 활용한 AI 심리상담 챗봇 서비스입니다. 언제 어디서나 편안하게 대화를 통해 마음의
          짐을 덜어낼 수 있습니다.
        </p>
        <div className="flex justify-around text-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 relative">
              <Image src="/clock.jpg" alt="24시간 상담" fill className="object-contain" />
            </div>
            <p className="mt-2 font-medium">24시간 상담</p>
            <p className="text-sm text-gray-500">언제든지 대화 가능</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 relative">
              <Image src="/chat.jpg" alt="맞춤형 상담" fill className="object-contain" />
            </div>
            <p className="mt-2 font-medium">맞춤형 상담</p>
            <p className="text-sm text-gray-500">개인화된 상담 분석</p>
          </div>
        </div>
      </section>

      {/* 사용 안내 */}
      <section className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold mb-2 text-orange-500">사용 안내</h3>
        <ul className="space-y-3 text-gray-700">
          <li>
            <strong>상담하기</strong> - 담담에게 AI 챗봇과 대화를 시작할 수 있습니다.
          </li>
          <li>
            <strong>나의 상담</strong> - 상담 히스토리와 리포트를 확인할 수 있습니다.
          </li>
          <li>
            <strong>마이페이지</strong> - 알림 설정, 상담 기록 관리 등 다양한 설정 변경이 가능합니다.
          </li>
        </ul>
        <Link href="/counseling">
          <div className="mt-4 bg-red-50 text-center text-red-500 font-semibold rounded-md py-2 cursor-pointer hover:bg-red-100 transition">
            지금 바로 담담이와 대화를 시작해보세요!
          </div>
        </Link>
      </section>

      {/* 주의 사항 */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-yellow-200 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold mb-2 text-yellow-500">주의 사항</h3>
        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
          <li>담담은 전문적인 의료 서비스가 아닙니다.</li>
          <li>심각한 심리적 문제가 있다면 전문가와의 상담을 권장합니다.</li>
          <li>상담 내용은 익명 처리되어 안전하게 보호됩니다.</li>
          <li>개선과 품질 향상을 위해 데이터가 활용될 수 있습니다.</li>
        </ul>
      </section>
    </div>
  );
}
