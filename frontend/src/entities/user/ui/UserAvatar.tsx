/**
 * @file UserAvatar.tsx
 * 사용자 또는 AI의 프로필 이미지를 표시하는 아바타 컴포넌트입니다.
 * FSD 아키텍처에 따라 `entities` 레이어의 `user` 슬라이스 내 `ui`에 위치합니다.
 */
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'; // Shadcn/ui Avatar 임포트
import { cn } from '@/shared/lib/utils'; // Tailwind CSS 클래스 병합 유틸리티

/**
 * UserAvatar 컴포넌트의 Props 인터페이스
 */
interface UserAvatarProps {
  /** 표시할 이미지의 URL */
  imageUrl?: string;
  /** 이미지가 없을 경우 표시될 텍스트 (예: 사용자 이름의 이니셜) */
  fallbackText: string;
  /** 이미지의 alt 속성 텍스트 (접근성용) */
  altText?: string;
  /** 아바타의 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 추가적인 Tailwind CSS 클래스 */
  className?: string;
}

/**
 * 사용자 또는 AI의 프로필 아바타를 표시하는 UI 컴포넌트입니다.
 * 내부적으로 Shadcn/ui의 Avatar 컴포넌트를 사용합니다.
 *
 * @param {UserAvatarProps} props - 컴포넌트 프로퍼티
 * @returns {JSX.Element} UserAvatar 컴포넌트
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  imageUrl,
  fallbackText,
  altText = 'User avatar', // 기본 alt 텍스트
  size = 'md', // 기본 크기
  className,
}) => {
  // size prop에 따른 Tailwind CSS 클래스 매핑
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs', // 작은 크기
    md: 'h-10 w-10 text-sm', // 중간 크기 (기본값)
    lg: 'h-14 w-14 text-lg', // 큰 크기
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {/* AvatarImage는 src가 유효할 경우 이미지를 렌더링합니다. */}
      <AvatarImage src={imageUrl} alt={altText} />
      {/* AvatarFallback은 이미지를 로드할 수 없거나 src가 없을 경우 표시됩니다. */}
      <AvatarFallback>{fallbackText.substring(0, 2)}</AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
