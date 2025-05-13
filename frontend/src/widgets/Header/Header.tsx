'use client';
import React from 'react';
import Link from 'next/link'; // Next.js의 Link 컴포넌트 사용
import Image from 'next/image'; // Next.js의 Image 컴포넌트 사용 (이미지 최적화)
import { Button } from '@/shared/ui/button'; // shadcn/ui의 Button 컴포넌트 가져오기
import { Moon } from 'lucide-react'; // 아이콘 라이브러리 (예: lucide-react)에서 아이콘 가져오기
import { useAuthStore } from '@/app/store/authStore';

/**
 * Header 위젯 컴포넌트: 애플리케이션 상단에 위치하며 로고, 네비게이션 버튼 등을 포함합니다.
 * 이 컴포넌트는 부모 요소에 의해 너비가 제어됩니다. (RootLayout의 앱 뷰 컨테이너)
 * @returns {JSX.Element} Header 컴포넌트 엘리먼트
 */
const Header = () => {
  const token = useAuthStore((state) => state.token);
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* 헤더 콘텐츠를 담는 내부 컨테이너 (패딩 및 높이, flex 정렬 유지) */}
      <div className="flex h-14 items-center px-4">
        {' '}
        {/* 양 옆 패딩(px-4) 추가 */}
        {/* 왼쪽: 로고 영역 */}
        <div className="mr-4 flex">
          {/* 로고 클릭 시 홈('/')으로 이동 */}
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* TODO: 로고 이미지를 public 폴더에 추가하고 경로 수정 */}
            <Image
              src="/damdami.png" // 실제 로고 경로로 수정됨 (예시)
              alt="담담 로고"
              width={24} // 이미지 너비
              height={24} // 이미지 높이
            />
            <span className="font-bold inline-block">담담 (DAMDAM)</span>
          </Link>
        </div>
        {/* 오른쪽: 버튼 영역 (flex-1로 밀어서 오른쪽 정렬) */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* 로그인 버튼 */}
          {!token && (
            <Button variant="secondary" size="sm" asChild className="rounded-full">
              <Link href="/login">로그인</Link>
            </Button>
          )}
          {/* 다크 모드 토글 버튼 */}
          {/* TODO: 다크 모드 기능 구현 및 토글 로직 추가 */}
          <Button variant="ghost" size="icon">
            {/* Moon 아이콘 (lucide-react) 사용 */}
            <Moon className="h-5 w-5" />
            <span className="sr-only">테마 변경</span> {/* 스크린 리더 전용 텍스트 */}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
