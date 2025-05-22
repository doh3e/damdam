'use client';

/**
 * @file frontend/src/features/counseling/ui/CreateReportButton.tsx
 * 상담 세션의 개별 레포트를 생성하는 버튼 컴포넌트입니다.
 * FSD 아키텍처에 따라 `features` 레이어의 `counseling` 슬라이스 내 `ui`에 위치합니다.
 */
import React from 'react';
import { FileText } from 'lucide-react'; // 레포트 아이콘
import { Button } from '@/shared/ui/button';
import { useCreateSessionReport } from '@/entities/counseling/model/mutations';

interface CreateReportButtonProps {
  /** 레포트를 생성할 상담 세션의 ID */
  counsId: string;
  /** 세션이 종료되었는지 여부 (종료된 세션만 레포트 생성 가능) */
  isSessionClosed: boolean;
  /** 버튼 클래스명 (스타일 커스터마이징용) */
  className?: string;
  /** 성공 시 실행할 콜백 함수 */
  onSuccess?: (reportId: string) => void;
}

/**
 * 상담 세션의 개별 레포트를 생성하는 버튼 컴포넌트입니다.
 * 종료된 세션만 레포트 생성이 가능합니다.
 *
 * @param {CreateReportButtonProps} props - 컴포넌트 props
 * @returns {React.ReactElement} CreateReportButton 컴포넌트
 */
const CreateReportButton = ({
  counsId,
  isSessionClosed,
  className,
  onSuccess,
}: CreateReportButtonProps): React.ReactElement => {
  const {
    mutate: createReport,
    isPending,
    isSuccess,
  } = useCreateSessionReport({
    onSuccess: (response) => {
      // console.log(`세션 ${counsId}의 레포트가 성공적으로 생성되었습니다. 레포트 ID: ${response.report_id}`);
      onSuccess?.(response.report_id);
      // TODO: 여기에 toast 메시지 또는 다른 알림 추가
    },
  });

  const handleCreateReport = () => {
    if (!isSessionClosed) {
      console.warn('종료되지 않은 세션에 대해 레포트를 생성할 수 없습니다.');
      return;
    }
    createReport(counsId);
  };

  return (
    <Button
      onClick={handleCreateReport}
      disabled={isPending || !isSessionClosed || isSuccess}
      variant={isSuccess ? 'default' : 'secondary'}
      className={`
        flex items-center justify-center space-x-2 
        ${
          isSuccess
            ? 'bg-calm-blue hover:bg-calm-blue/90 text-white'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        }
        ${className || ''}`}
      title={
        isSuccess
          ? '레포트가 이미 생성되었습니다'
          : !isSessionClosed
            ? '종료된 상담만 레포트를 생성할 수 있습니다'
            : '이 상담 세션의 레포트를 생성합니다'
      }
    >
      <FileText size={18} className="mr-2" />
      <span>{isPending ? '레포트 생성 중...' : isSuccess ? '레포트 생성됨' : '레포트 생성'}</span>
    </Button>
  );
};

export default CreateReportButton;
