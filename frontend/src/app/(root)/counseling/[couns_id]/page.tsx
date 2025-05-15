'use client';

import { useAuthStore } from '@/app/store/authStore'; // 인증 스토어 경로는 실제 프로젝트에 맞게 수정
import CounselingChatWindow from '@/widgets/CounselingChatWindow/ui/CounselingChatWindow';
import { Button } from '@/shared/ui/button'; // shadcn 버튼 컴포넌트
import { useRouter } from 'next/navigation';

/**
 * 개별 상담 채팅 페이지
 * 경로: /counseling/[couns_id] (예: /counseling/123)
 *
 * 이 페이지는 특정 상담 ID에 해당하는 AI와의 1:1 채팅 화면을 표시합니다.
 * URL의 동적 세그먼트(`couns_id`)를 `CounselingChatWindow` 위젯에 전달하여
 * 해당 상담 내용을 로드하고 상호작용할 수 있게 합니다.
 * FSD 아키텍처에서 `app` 레이어의 페이지 컴포넌트에 해당합니다.
 * Next.js App Router는 파일 시스템의 대괄호([])를 사용하여 동적 라우트를 생성합니다.
 *
 * @param {object} props - 컴포넌트 프로퍼티
 * @param {object} props.params - Next.js가 주입하는 동적 라우트 파라미터 객체
 * @param {string} props.params.couns_id - URL 경로에서 추출된 상담 ID
 * @returns {JSX.Element} 개별 상담 채팅 페이지 컴포넌트
 */
const CounselingChatPage = ({ params }: { params: { couns_id: string } }) => {
  const { token } = useAuthStore(); // 인증 상태 확인
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  if (!token) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center space-y-4 p-8 border rounded-lg bg-slate-50">
          <p className="text-center text-lg">상담 서비스를 이용하기 위해서는 로그인이 필요합니다.</p>
          <Button onClick={handleLoginRedirect}>로그인하러 가기</Button>
        </div>
      </div>
    );
  }

  // CounselingChatWindow 위젯은 내부적으로 useParams를 사용하여 couns_id를 가져옵니다.
  // 따라서 페이지 컴포넌트에서 별도로 prop을 전달할 필요가 없습니다.
  return <CounselingChatWindow />;
};

export default CounselingChatPage;
