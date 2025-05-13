'use client';

/**
 * @file frontend/src/features/counseling/ui/EditCounselingTitleButton.tsx
 * 상담 세션 제목 수정을 위한 버튼 컴포넌트입니다.
 * FSD 아키텍처에 따라 `features` 레이어의 `counseling` 슬라이스 내 `ui`에 위치합니다.
 */
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import EditCounselingTitleForm from './EditCounselingTitleForm';

export interface EditCounselingTitleButtonProps {
  /** 수정할 상담 세션의 ID */
  counsId: string;
  /** 현재 상담 세션의 제목 */
  currentTitle: string;
  /** 제목 수정 성공 후 실행할 콜백 함수 */
  onSuccess?: () => void;
  /** 버튼 클래스명 (스타일 커스터마이징용) */
  className?: string;
}

/**
 * 상담 세션 제목 수정 모달을 표시하는 버튼 컴포넌트입니다.
 *
 * @param {EditCounselingTitleButtonProps} props - 컴포넌트 props
 * @returns {React.ReactElement} EditCounselingTitleButton 컴포넌트
 */
const EditCounselingTitleButton = ({
  counsId,
  currentTitle,
  onSuccess,
  className,
}: EditCounselingTitleButtonProps): React.ReactElement => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpenDialog}
        className={className}
        aria-label="상담 제목 수정"
        title="상담 제목 수정"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <EditCounselingTitleForm
        counsId={counsId}
        currentTitle={currentTitle}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={onSuccess}
      />
    </>
  );
};

export default EditCounselingTitleButton;
