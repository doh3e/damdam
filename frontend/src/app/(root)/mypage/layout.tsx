'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button'; // 실제 Button 컴포넌트 경로로 바꿔주세요

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const [checked, setChecked] = useState(false); // hydration 방지용

  useEffect(() => {
    setChecked(true); // 클라이언트에서 토큰 확인 후 렌더링
  }, []);

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  if (!checked) return null; // hydration 오류 방지

  if (!token) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center space-y-4 p-8 border rounded-lg bg-slate-50">
          <p className="text-center text-lg">마이페이지를 이용하기 위해서는 로그인이 필요합니다.</p>
          <Button onClick={handleLoginRedirect}>로그인하러 가기</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
