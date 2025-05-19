'use client';

import { useState } from 'react';
import { useAuthStore } from '@/app/store/authStore'; // 인증 스토어 경로는 실제 프로젝트에 맞게 수정
import PastCounselingList from '@/widgets/PastCounselingList/ui/PastCounselingList';
import { Button } from '@/shared/ui/button'; // shadcn 버튼 컴포넌트
import { useRouter } from 'next/navigation';
import { Input } from '@/shared/ui/input'; // 입력 필드 컴포넌트 추가

/**
 * 개발 환경에서만 표시되는 임시 토큰 설정 컴포넌트
 */
const DevAuthControls = () => {
  const { token, setToken, clearToken } = useAuthStore();
  const [mockToken, setMockToken] = useState('');

  const handleSetMockToken = () => {
    if (mockToken.trim()) {
      setToken(mockToken.trim());
      alert('모의 토큰이 설정되었습니다!');
    } else {
      alert('토큰을 입력해주세요!');
    }
  };

  const handleClearToken = () => {
    clearToken();
    setMockToken('');
    alert('토큰이 삭제되었습니다!');
  };

  // 현재 환경이 개발 환경인지 확인
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold mb-2">개발 도구</h3>
      <div className="flex flex-col gap-2">
        <Input
          value={mockToken}
          onChange={(e) => setMockToken(e.target.value)}
          placeholder="JWT 토큰 입력"
          className="text-xs w-60"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleSetMockToken} className="text-xs flex-1">
            모의 토큰 설정
          </Button>
          <Button size="sm" variant="outline" onClick={handleClearToken} className="text-xs flex-1">
            토큰 삭제
          </Button>
        </div>
        <div className="text-xs mt-1 truncate max-w-60">
          {token ? `토큰 있음 ✅ ${token.substring(0, 15)}...` : '토큰 없음 ❌'}
        </div>
      </div>
    </div>
  );
};

/**
 * 상담 페이지 (지난 상담 목록 또는 새 상담 시작)
 * 경로: /counseling
 *
 * 이 페이지는 사용자가 지난 상담 내역을 확인하거나 새로운 AI 상담을 시작할 수 있는
 * 랜딩 페이지 역할을 합니다. `PastCounselingList` 위젯을 통해 이 기능을 제공합니다.
 * FSD 아키텍처에서 `app` 레이어의 페이지 컴포넌트에 해당합니다.
 * Next.js App Router의 파일 시스템 기반 라우팅에 의해 이 파일이 `/counseling` 경로와 매핑됩니다.
 *
 * @returns {JSX.Element} 상담 페이지 컴포넌트
 */
const CounselingPage = () => {
  const { token } = useAuthStore(); // 인증 상태 확인
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div className="h-full p-4 overflow-y-auto scrollbar-custom">
      {token ? (
        // 인증된 사용자에게는 상담 목록 표시
        <PastCounselingList />
      ) : (
        // 미인증 사용자에게는 로그인 유도 메시지 표시
        <div className="flex flex-col items-center justify-center space-y-4 p-8 border rounded-lg bg-slate-50 h-full">
          <p className="text-center text-lg">상담 서비스를 이용하기 위해서는 로그인이 필요합니다.</p>
          <Button onClick={handleLoginRedirect}>로그인하러 가기</Button>
        </div>
      )}

      {/* 개발 환경에서만 표시되는 임시 인증 컨트롤 */}
      <DevAuthControls />
    </div>
  );
};

export default CounselingPage;
