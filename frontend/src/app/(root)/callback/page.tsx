'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. URL에서 토큰 추출 (예: http://localhost:3000/callback?token=xxx)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    // 2. 토큰 유효성 검사
    if (token) {
      useAuthStore.getState().setToken(token);
      router.replace('/signup/welcome'); // 3. 실제 환영 페이지로 이동
    } else {
      router.replace('/login?error=invalid_token'); // 4. 에러 처리
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );
}
