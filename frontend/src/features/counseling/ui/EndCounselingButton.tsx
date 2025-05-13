'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';
import { LogOut } from 'lucide-react'; // 상담 종료에 어울리는 아이콘 (예: LogOut, XCircle, DoorClosed)
import { useCloseCounselingSession } from '@/entities/counseling/model/mutations';
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import { useWebSocket } from '@/shared/hooks/useWebSocket'; // 웹소켓 연결 해제를 위해 import

/**
 * @interface EndCounselingButtonProps
 * @property {string} currentCounsId - 현재 진행 중인 상담 세션의 ID.
 * @property {() => void} [onEndSuccess] - 상담 종료 성공 시 호출될 콜백 함수 (옵션).
 *                                          예: 페이지 이동, 다음 행동 안내 UI 표시 등.
 */
interface EndCounselingButtonProps {
  currentCounsId: string;
  onEndSuccess?: () => void; // 성공 시 인자로 sessionId가 필요하다면 (sessionId: string) => void로 변경
}

/**
 * EndCounselingButton 컴포넌트
 *
 * 현재 진행 중인 AI 상담 세션을 종료하는 버튼입니다.
 * 클릭 시 상담 종료 API를 호출하고, 성공하면 관련 상태를 업데이트하며,
 * 웹소켓 연결을 해제합니다.
 *
 * @param {EndCounselingButtonProps} props - 컴포넌트 props
 * @returns {React.ReactElement | null} EndCounselingButton 컴포넌트. `currentCounsId`가 없으면 null 반환.
 */
const EndCounselingButton = ({ currentCounsId, onEndSuccess }: EndCounselingButtonProps): React.ReactElement | null => {
  const { mutate: closeSession, isPending } = useCloseCounselingSession();
  const setIsCurrentSessionClosed = useCounselingStore((state) => state.setIsCurrentSessionClosed);
  const isCurrentSessionClosed = useCounselingStore((state) => state.isCurrentSessionClosed);

  // 웹소켓 연결 해제 함수 가져오기 (useWebSocket 훅의 실제 반환값에 따라 disconnect 또는 다른 이름일 수 있음)
  const { disconnect } = useWebSocket({ counsId: currentCounsId, autoConnect: false });

  /**
   * 상담 종료 버튼 클릭 시 실행되는 핸들러입니다.
   */
  const handleEndCounseling = () => {
    if (!currentCounsId) {
      console.warn('Cannot end counseling: currentCounsId is not available.');
      return;
    }

    closeSession(currentCounsId, {
      onSuccess: () => {
        console.log(`Counseling session ${currentCounsId} has been successfully closed.`);

        // 1. Zustand 스토어 상태 업데이트: 현재 세션 종료됨으로 표시
        setIsCurrentSessionClosed(true);

        // 2. 웹소켓 연결 해제
        if (disconnect) {
          disconnect();
          console.log(`WebSocket disconnected for session ${currentCounsId}.`);
        }

        // 3. 성공 콜백 호출 (prop으로 전달된 경우)
        if (onEndSuccess) {
          onEndSuccess();
        }

        // 추가 작업: 예를 들어, 상담 목록 페이지로 리디렉션하거나 사용자에게 알림 표시
        // router.push('/counseling/history');
        // showToast('상담이 종료되었습니다. 레포트를 확인해보세요.');
      },
      onError: (error) => {
        console.error(`Failed to close counseling session ${currentCounsId}:`, error);
        // 사용자에게 오류 알림 (예: 토스트 메시지)
        // showErrorToast('상담 종료에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  // 이미 종료된 세션이거나, ID가 없으면 버튼을 렌더링하지 않거나 비활성화
  if (!currentCounsId || isCurrentSessionClosed) {
    return null; // 또는 비활성화된 버튼을 반환할 수 있습니다.
  }

  return (
    <Button
      onClick={handleEndCounseling}
      disabled={isPending}
      variant="destructive" // Shadcn/ui의 파괴적 액션 스타일 사용
      className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      title="현재 상담을 종료합니다."
    >
      <LogOut size={20} className="mr-2" />
      <span>{isPending ? '상담 종료 중...' : '상담 종료'}</span>
    </Button>
  );
};

export default EndCounselingButton;
