'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

// Button 컴포넌트의 props 타입을 단순화하여 가정합니다.
// 실제 Button 컴포넌트의 props 정의를 확인하고 맞춰주는 것이 가장 좋습니다.
interface BackButtonProps {
  href: string;
  className?: string;
  variant?: 'ghost' | 'outline' | 'default' | 'destructive' | 'secondary' | 'link'; // 예시 variant 타입
  size?: 'default' | 'sm' | 'lg' | 'icon'; // 예시 size 타입
  'aria-label'?: string;
  iconClassName?: string;
  // HTMLButtonElement의 다른 속성들을 허용하려면 추가
  [key: string]: any; // 기타 모든 props 허용 (주의해서 사용)
}

export function BackButton({
  href,
  className,
  variant = 'ghost',
  size = 'icon',
  'aria-label': ariaLabel = '뒤로 가기',
  iconClassName,
  ...props
}: BackButtonProps) {
  return (
    <Button asChild variant={variant} size={size} className={cn('rounded-full', className)} {...props}>
      <Link href={href} aria-label={ariaLabel}>
        <ArrowLeft className={cn('h-5 w-5', iconClassName)} />
      </Link>
    </Button>
  );
}

export default BackButton;
