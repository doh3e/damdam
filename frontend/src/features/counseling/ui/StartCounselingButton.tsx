'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // Next.js 13+ App Router의 useRouter
import { Button } from '@/shared/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { useCreateCounselingSession } from '@/entities/counseling/model/mutations';
import type { CounselingSession } from '@/entities/counseling/model/types'; // CounselingSession 타입 임포트
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
// import { useWebSocket } from '@/shared/hooks/useWebSocket'; // 필요시 웹소켓 직접 제어

/**
 * @interface StartCounselingButtonProps
 * @property {(newSessionId: string) => void} [onStartSuccess] - 새 상담 시작 성공 시 호출될 콜백 함수 (옵션).
 */
interface StartCounselingButtonProps {
  onStartSuccess?: (newSessionId: string) => void;
  // userId prop 제거 (JWT 사용으로 불필요)
}

/**
 * StartCounselingButton 컴포넌트
 *
 * 사용자가 새로운 AI 상담을 시작할 수 있도록 하는 버튼입니다.
 * 클릭 시 새 상담 세션 생성 API를 호출하고, 성공하면 해당 상담 화면으로 이동하며
 * 관련 상태를 초기화합니다.
 *
 * @param {StartCounselingButtonProps} props - 컴포넌트 props
 * @returns {React.ReactElement} StartCounselingButton 컴포넌트
 */
const StartCounselingButton = ({ onStartSuccess }: StartCounselingButtonProps): React.ReactElement => {
  const router = useRouter();
  const { mutate: createSession, isPending } = useCreateCounselingSession();

  const {
    setCurrentSessionId,
    setIsCurrentSessionClosed,
    setMessages,
    // setWebsocketStatus, // 웹소켓 상태는 useWebSocket 훅 내부 또는 페이지 레벨에서 관리하는 것이 더 적절할 수 있음
  } = useCounselingStore((state) => ({
    setCurrentSessionId: state.setCurrentSessionId,
    setIsCurrentSessionClosed: state.setIsCurrentSessionClosed,
    setMessages: state.setMessages,
    // setWebsocketStatus: state.setWebsocketStatus,
  }));

  // const { connect } = useWebSocket({ counsId: null, autoConnect: false }); // 초기에는 특정 세션 ID 없이 준비만

  /**
   * 새 상담 시작 버튼 클릭 시 실행되는 핸들러입니다.
   */
  const handleStartCounseling = () => {
    // userId를 포함한 creationPayload 제거. API는 JWT로 사용자를 식별하고, 바디는 선택적이거나 없음.
    // createCounselingSession은 CreateCounselingSessionPayload | undefined를 받으므로 undefined 전달.
    createSession(undefined, {
      onSuccess: (data: CounselingSession) => {
        // 응답 데이터 타입을 CounselingSession으로 명시
        const newSessionId = data?.couns_id; // 실제 응답 객체에서 couns_id (string)를 가져옴

        if (newSessionId) {
          console.log('새 상담 세션 생성 성공:', newSessionId);

          // 1. Zustand 스토어 상태 초기화
          setCurrentSessionId(newSessionId);
          setIsCurrentSessionClosed(false);
          setMessages([]); // 새 상담이므로 메시지 목록 초기화
          // setWebsocketStatus('idle'); // 또는 'connecting', 페이지 이동 후 연결 시도

          // 2. 새 상담 채팅 페이지로 라우팅
          router.push(`/counseling/${newSessionId}`);

          // 3. (옵션) 웹소켓 즉시 연결 시도
          // connect(newSessionId, authToken); // authToken 필요시 전달. connect 함수 시그니처 확인.
          // 이 부분은 페이지 컴포넌트나 CounselingChatWindow에서 처리하는 것이 더 적절할 수 있음.

          // 4. 성공 콜백 호출 (prop으로 전달된 경우)
          if (onStartSuccess) {
            onStartSuccess(newSessionId);
          }
        } else {
          console.error('새 상담 세션 생성 후 ID를 받지 못했습니다.', data);
          // 사용자에게 오류 알림 (예: 토스트 메시지)
        }
      },
      onError: (error) => {
        console.error('새 상담 세션 생성 실패:', error);
        // 사용자에게 오류 알림 (예: 토스트 메시지)
      },
    });
  };

  return (
    <Button
      onClick={handleStartCounseling}
      disabled={isPending}
      // className 수정: 프로젝트 색상 팔레트 적용
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      title="새로운 AI와 상담을 시작합니다."
    >
      <MessageSquarePlus size={20} className="mr-2" />
      <span>{isPending ? '상담 시작 중...' : '새 대화 시작'}</span>
    </Button>
  );
};

export default StartCounselingButton;
