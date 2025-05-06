'use client'; // 네비게이션 상태(활성 탭) 확인을 위해 클라이언트 컴포넌트로 지정 (향후 확장 고려)

import React from 'react';
import Link from 'next/link';
import { Home, MessageSquareText, NotebookText, User } from 'lucide-react'; // 아이콘 임포트
import { usePathname } from 'next/navigation'; // 현재 경로 확인 훅
import { cn } from '@/shared/lib/utils'; // 유틸리티 함수

/**
 * 각 네비게이션 아이템의 정보를 담는 인터페이스
 */
interface NavItem {
  href: string; // 이동할 경로
  label: string; // 표시될 텍스트 라벨
  icon: React.ElementType; // 사용할 아이콘 컴포넌트
}

/**
 * 네비게이션 아이템 목록
 */
const navItems: NavItem[] = [
  { href: '/', label: '홈', icon: Home },
  { href: '/counseling', label: '상담하기', icon: MessageSquareText },
  { href: '/reports', label: '나의 상담', icon: NotebookText },
  { href: '/mypage', label: '마이페이지', icon: User },
];

/**
 * BottomNavigation 위젯 컴포넌트: 애플리케이션 하단에 고정되어 주요 페이지로 이동하는 네비게이션 바입니다.
 * 이 컴포넌트는 부모 요소에 의해 너비가 제어됩니다. (RootLayout의 앱 뷰 컨테이너)
 * @returns {JSX.Element} BottomNavigation 컴포넌트 엘리먼트
 */
const BottomNavigation = () => {
  // 현재 URL 경로를 가져옵니다. (활성 탭 표시에 사용)
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-50 border-t bg-background">
      {/* 네비게이션 아이템들을 담는 내부 컨테이너 (높이, flex 정렬 유지) */}
      <div className="flex h-16 items-center justify-around px-4">
        {' '}
        {/* 양 옆 패딩(px-4) 추가 */}
        {/* navItems 배열을 순회하며 각 네비게이션 링크 생성 */}
        {navItems.map((item) => {
          // 현재 경로(pathname)가 해당 아이템의 경로(href)로 시작하는지 확인 (하위 경로도 활성 처리 위함)
          // 단, 홈('/') 경로는 정확히 일치할 때만 활성화
          const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              // flex-col: 아이콘과 텍스트를 수직으로 배치
              // items-center: 내부 요소 가운데 정렬
              // text-xs: 작은 글씨 크기
              // cn 함수로 조건부 스타일링: 활성(isActive) 상태일 때 글자색 변경 (예: text-primary)
              className={cn(
                'flex flex-col items-center justify-center text-xs transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* 아이콘 컴포넌트 렌더링 */}
              <item.icon
                className="h-5 w-5 mb-1" // 아이콘 크기 및 하단 마진
              />
              {/* 텍스트 라벨 */}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
