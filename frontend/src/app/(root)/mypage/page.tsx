'use client';
import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/app/store/authStore';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullhorn,
  faChevronRight,
  faCircleUser,
  faClipboardList,
  faEnvelopeOpenText,
  faGear,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

const user = {
  nickname: '내담이',
  email: 'user@example.com',
  profileImage: '/pixeldamdam.png', // 기본 이미지 경로, 실제 이미지는 usersprofile API 연동
};

export default function MyPage() {
  const router = useRouter();
  const handleLogout = () => {
    useAuthStore.getState().clearToken();
    router.replace('/login');
  };
  return (
    <div className="p-4 space-y-6 flex flex-col items-center">
      {/* 프로필 영역 */}
      <section className="bg-white w-full max-w-xl mx-auto rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-orange-200 mb-2">
            <img src={user.profileImage} alt="프로필 이미지" width={96} height={96} className="object-cover" />
          </div>
          <div className="text-xl font-bold text-gray-900">{user.nickname}</div>
        </div>

        {/* 메뉴 리스트 */}
        <div className="w-full bg-white rounded-2xl shadow border border-gray-100 mb-8">
          <ul>
            {/* 내정보관리 */}
            <li>
              <Link
                href="/mypage/usersettings"
                className="flex items-center justify-between px-6 py-4 hover:bg-orange-50 transition group"
              >
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCircleUser} />
                  <span className="flex-1 font-medium text-gray-900">내 정보 관리</span>
                </div>
                <FontAwesomeIcon icon={faChevronRight} />
              </Link>
            </li>
            {/* 앱 설정 */}
            <li>
              <Link
                href="/mypage/appsettings"
                className="flex items-center justify-between px-6 py-4 hover:bg-orange-50 transition group"
              >
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faGear} />
                  <span className="flex-1 font-medium text-gray-900">앱 설정</span>
                </div>
                <FontAwesomeIcon icon={faChevronRight} />
              </Link>
            </li>
            {/* 사전설문 */}
            <li>
              <Link
                href="/signup/survey/1"
                className="flex items-center justify-between px-6 py-4 hover:bg-orange-50 transition group"
              >
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClipboardList} />
                  <span className="flex-1 font-medium text-gray-900">사전설문</span>
                </div>
                <FontAwesomeIcon icon={faChevronRight} />
              </Link>
            </li>
            {/* 공지사항 */}
            <li>
              <Link
                href="/mypage/notice"
                className="flex items-center justify-between px-6 py-4 hover:bg-orange-50 transition group"
              >
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faBullhorn} />
                  <span className="flex-1 font-medium text-gray-900">공지사항</span>
                </div>
                <FontAwesomeIcon icon={faChevronRight} />
              </Link>
            </li>
            {/* 문의하기 */}
            <li>
              <Link
                href="/mypage/inquiries"
                className="flex items-center justify-between px-6 py-4 hover:bg-orange-50 transition group"
              >
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faEnvelopeOpenText} />
                  <span className="flex-1 font-medium text-gray-900">문의하기</span>
                </div>
                <FontAwesomeIcon icon={faChevronRight} />
              </Link>
            </li>
          </ul>
        </div>
        {/* 로그아웃 버튼 */}
        <div className="w-full">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            로그아웃
          </button>
        </div>
      </section>
    </div>
  );
}
