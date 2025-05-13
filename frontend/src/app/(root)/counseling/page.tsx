'use client';

import { useAuthStore } from '@/app/store/authStore'; // 인증 스토어 경로는 실제 프로젝트에 맞게 수정
import PastCounselingList from '@/widgets/PastCounselingList/ui/PastCounselingList';
import { Button } from '@/shared/ui/button'; // shadcn 버튼 컴포넌트
import { useRouter } from 'next/navigation';

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-charcoal-black">지난 상담 내역</h1>

      {token ? (
        // 인증된 사용자에게는 상담 목록 표시
        <PastCounselingList />
      ) : (
        // 미인증 사용자에게는 로그인 유도 메시지 표시
        <div className="flex flex-col items-center justify-center space-y-4 p-8 border rounded-lg bg-slate-50">
          <p className="text-center text-lg">상담 서비스를 이용하기 위해서는 로그인이 필요합니다.</p>
          <Button onClick={handleLoginRedirect}>로그인하러 가기</Button>
        </div>
      )}
    </div>
  );
};

export default CounselingPage;
