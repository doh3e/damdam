/**
 * @file frontend/src/features/counseling/ui/CreateSessionReportButton.tsx
 * 레포트 생성 및 상담 세션 종료 기능을 수행하는 버튼 컴포넌트입니다.
 * FSD 아키텍처에 따라 `features` 레이어의 `counseling` 슬라이스 내 `ui`에 위치합니다.
 */
'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/ui/button';
import { FileText } from 'lucide-react'; // LogOut 아이콘 제거 (FileText로 충분)
import { useCreateReportAndEndSession } from '@/entities/counseling/model/mutations'; // 생성한 뮤테이션 훅 임포트
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import { counselingQueryKeys } from '@/entities/counseling/model/queries';
// import { reportQueryKeys } from '@/entities/report/model/queries'; // TODO: 레포트 쿼리 키 정의 및 임포트 필요

/**
 * @interface CreateSessionReportButtonProps
 * @property {string} counsId - 현재 상담 세션 ID.
 * @property {boolean} isSessionClosed - 현재 세션이 이미 닫혔는지 여부.
 * @property {() => Promise<void>} [disconnectWebSocket] - 웹소켓 연결 해제 함수.
 * @property {() => void} [onReportSuccess] - 레포트 생성 및 세션 종료 성공 시 콜백.
 */
interface CreateSessionReportButtonProps {
  counsId: string;
  isSessionClosed: boolean;
  disconnectWebSocket?: () => Promise<void>;
  onReportSuccess?: () => void;
}

/**
 * CreateSessionReportButton 컴포넌트
 *
 * 상담 세션에 대한 레포트를 생성하고, 해당 세션을 종료 처리합니다.
 * 세션이 이미 닫혀 있거나 레포트 생성/세션 종료 중에는 버튼이 비활성화됩니다.
 *
 * @param {CreateSessionReportButtonProps} props - 컴포넌트 props
 * @returns {React.ReactElement | null} 버튼 UI 또는 null
 */
const CreateSessionReportButton = ({
  counsId,
  isSessionClosed,
  disconnectWebSocket,
  onReportSuccess,
}: CreateSessionReportButtonProps): React.ReactElement | null => {
  const queryClient = useQueryClient();
  // Zustand 스토어에서 setIsCurrentSessionClosed를 직접 가져오지 않고, 뮤테이션의 onSuccess에서 처리하므로 제거 가능
  // const setIsCurrentSessionClosed = useCounselingStore((state) => state.setIsCurrentSessionClosed);

  const { mutate: createReportAndEnd, isPending: isCreating } = useCreateReportAndEndSession();

  const handleClick = () => {
    if (!counsId || isCreating || isSessionClosed) return;

    createReportAndEnd(counsId, {
      onSuccess: async (data) => {
        console.log('CreateSessionReportButton: 레포트 생성 및 세션 종료 API 호출 성공', data);
        // 뮤테이션 훅의 onSuccess에서 Zustand 상태 업데이트 및 쿼리 무효화가 이미 처리됨.
        // 여기서는 추가적인 UI 피드백 또는 disconnectWebSocket 호출만 처리.
        if (disconnectWebSocket) {
          await disconnectWebSocket();
        }
        if (onReportSuccess) {
          onReportSuccess();
        }
        // 성공 알림 (예: toast 메시지) 추가 가능
      },
      onError: (error) => {
        console.error('CreateSessionReportButton: 레포트 생성 및 세션 종료 실패:', error);
        // 실패 알림 (예: toast 메시지) 또는 에러 처리
      },
    });
  };

  // 이 버튼은 '열린 세션'을 대상으로 하므로, 이미 닫힌 세션에서는 표시하지 않습니다.
  if (isSessionClosed) {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isCreating || !counsId} // isPending 상태를 isCreating으로 사용
      variant="outline"
      size="sm"
      className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900"
      title="레포트 생성 및 상담 종료"
    >
      <FileText className="mr-2 h-4 w-4" />
      레포트 생성
    </Button>
  );
};

export default CreateSessionReportButton;
