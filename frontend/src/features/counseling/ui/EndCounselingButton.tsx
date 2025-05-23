'use client';

import React from 'react';
import { Button } from '@/shared/ui/button';
import { LogOut } from 'lucide-react'; // 상담 종료에 어울리는 아이콘 (예: LogOut, XCircle, DoorClosed)
import { useCloseCounselingSession } from '@/entities/counseling/model/mutations';
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import { useQueryClient } from '@tanstack/react-query';
import { CounselingSession } from '@/entities/counseling/model/types'; // CounselingSession 타입 임포트

/**
 * @interface EndCounselingButtonProps
 * @property {string} currentCounsId - 현재 진행 중인 상담 세션의 ID.
 * @property {() => void} [onEndSuccess] - 상담 종료 성공 시 호출될 콜백 함수 (옵션).
 *                                          예: 페이지 이동, 다음 행동 안내 UI 표시 등.
 * @property {() => Promise<void>} [disconnectWebSocket] - 웹소켓 연결을 해제하는 함수.
 * @property {boolean} [isSessionClosed] - 상담 종료 여부를 외부에서 전달받음
 */
interface EndCounselingButtonProps {
  currentCounsId: string;
  onEndSuccess?: () => void; // 성공 시 인자로 sessionId가 필요하다면 (sessionId: string) => void로 변경
  disconnectWebSocket?: () => Promise<void>; // 추가
  isSessionClosed?: boolean; // 추가: 세션 종료 여부를 외부에서 전달받음
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
const EndCounselingButton = ({
  currentCounsId,
  onEndSuccess,
  disconnectWebSocket, // props로 받음
  isSessionClosed, // props로 받음
}: EndCounselingButtonProps): React.ReactElement | null => {
  const queryClient = useQueryClient();
  const { mutate: closeSession, isPending } = useCloseCounselingSession();
  const setIsCurrentSessionClosed = useCounselingStore((state) => state.setIsCurrentSessionClosed);
  // const isCurrentSessionClosed = useCounselingStore((state) => state.isCurrentSessionClosed); // 이 값은 버튼의 초기 비활성화 상태 결정에 직접 사용하지 않음

  /**
   * 상담 종료 버튼 클릭 시 실행되는 핸들러입니다.
   */
  const handleEndCounseling = async () => {
    if (!currentCounsId) {
      console.warn('Cannot end counseling: currentCounsId is not available.');
      return;
    }

    closeSession(currentCounsId, {
      onSuccess: async () => {
        // console.log(`Counseling session ${currentCounsId} has been successfully closed.`);

        // 1. Zustand 스토어 상태 업데이트: 현재 세션 종료됨으로 표시
        setIsCurrentSessionClosed(true);

        // 2. 웹소켓 연결 해제
        if (disconnectWebSocket) {
          try {
            await disconnectWebSocket();
            // console.log(`WebSocket disconnected for session ${currentCounsId}.`);
          } catch (error) {
            console.error('Error disconnecting WebSocket:', error);
          }
        }

        // 3. Tanstack Query 캐시 직접 업데이트 및 무효화
        // 3.1. 상담 목록 캐시 업데이트 (isClosed: true로 설정)
        queryClient.setQueryData<CounselingSession[]>(
          ['counselingSessions', 'list'], // 실제 사용하는 상담 목록 쿼리 키 확인 필요
          (oldData) => {
            if (!oldData) return undefined;
            const numericCurrentCounsId = Number(currentCounsId); // 문자열 currentCounsId를 숫자로 변환
            return oldData.map((session) =>
              session.counsId === numericCurrentCounsId ? { ...session, isClosed: true } : session
            );
          }
        );

        // 3.2. 현재 세션 상세 정보 캐시 업데이트 (isClosed: true로 설정)
        queryClient.setQueryData<CounselingSession>(['counselingSessionDetail', currentCounsId], (oldData) => {
          if (!oldData) return undefined;
          return { ...oldData, isClosed: true };
        });

        // 3.3. 기존 캐시 무효화 (서버와 최종 동기화를 위해 유지하거나, setQueryData만으로 충분하다면 제거 고려)
        await queryClient.invalidateQueries({
          queryKey: ['counselingSessionDetail', currentCounsId],
        });
        await queryClient.invalidateQueries({ queryKey: ['counselingSessions', 'list'] });

        // 4. 성공 콜백 호출
        if (onEndSuccess) {
          onEndSuccess();
        }
      },
      onError: (error) => {
        console.error(`Failed to close counseling session ${currentCounsId}:`, error);
        // 사용자에게 오류 알림 (예: 토스트 메시지)
        // showErrorToast('상담 종료에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  // 이미 종료된 세션이거나, ID가 없으면 버튼을 렌더링하지 않거나 비활성화
  if (!currentCounsId) {
    // currentCounsId가 없을 경우만 null 반환
    return null;
  }

  // isSessionClosed prop을 사용하여 버튼 비활성화 (isPending도 고려)
  const isDisabled = isSessionClosed || isPending;

  return (
    <Button
      onClick={handleEndCounseling}
      disabled={isDisabled} // 수정된 비활성화 조건
      variant="destructive" // Shadcn/ui의 파괴적 액션 스타일 사용
      className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      title={isSessionClosed ? '이미 종료된 상담입니다.' : '현재 상담을 종료합니다.'}
    >
      <LogOut size={20} className="mr-2" />
      <span>{isPending ? '상담 종료 중...' : isSessionClosed ? '상담 종료' : '상담 종료'}</span>
    </Button>
  );
};

export default EndCounselingButton;
