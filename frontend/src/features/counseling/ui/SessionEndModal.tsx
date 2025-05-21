/**
 * @file frontend/src/features/counseling/ui/SessionEndModal.tsx
 * 상담 세션 종료 시 레포트 발행 여부를 묻는 모달 컴포넌트입니다.
 */
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { AlertTriangle, FileText, LogOut } from 'lucide-react';

interface SessionEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReport: () => void;
  onConfirmEnd: () => void;
  isReportPending?: boolean;
  isEndPending?: boolean;
}

const SessionEndModal = ({
  isOpen,
  onClose,
  onConfirmReport,
  onConfirmEnd,
  isReportPending = false,
  isEndPending = false,
}: SessionEndModalProps): React.ReactElement | null => {
  if (!isOpen) {
    return null;
  }

  const handleReportConfirm = () => {
    if (!isReportPending && !isEndPending) {
      onConfirmReport();
    }
  };

  const handleEndConfirm = () => {
    if (!isReportPending && !isEndPending) {
      onConfirmEnd();
    }
  };

  const isAnyPending = isReportPending || isEndPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#FAE9DE] dark:bg-gray-800 border-[#F5B6AF] dark:border-gray-700">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-semibold text-[#222222] dark:text-white flex items-center">
            <AlertTriangle size={28} className="mr-3 text-[#DC5F53]" />
            상담이 종료됩니다.
          </DialogTitle>
          <br />
          <DialogDescription className="text-sm text-[#222222]/80 dark:text-gray-300 mt-4 space-y-3">
            <p>현재 상담 세션이 종료됩니다. 상담 내용에 대한 분석 레포트를 받아보시겠습니까?</p>
            <p>레포트를 발행하면 상담 내용을 심층 분석하여 유용한 피드백을 제공해 드립니다.</p>
            <p className="font-semibold text-[#DC5F53] pt-2">
              "상담 종료하기"를 선택하시면 상담 내역이 삭제되며 레포트를 받아보실 수 없습니다.
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleEndConfirm}
            disabled={isAnyPending}
            className="w-full sm:w-auto border-gray-300 text-gray-500 hover:bg-gray-100/50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <LogOut size={18} className="mr-2" />
            {isEndPending ? '종료 중...' : '상담 종료하기'}
          </Button>
          <Button
            type="button"
            onClick={handleReportConfirm}
            disabled={isAnyPending}
            className="w-full sm:w-auto bg-[#F5B6AF] text-[#222222] hover:bg-[#F5B6AF]/70 dark:bg-pink-400 dark:text-white dark:hover:bg-pink-500"
          >
            <FileText size={18} className="mr-2" />
            {isReportPending ? '발행 중...' : '레포트 발행하기'}
          </Button>
        </DialogFooter>
        {/* DialogClose는 onOpenChange로 대체되므로 명시적 닫기 버튼 불필요, 원하면 추가 가능 */}
        {/* <DialogClose asChild>
            <Button type="button" variant="ghost" className="mt-2 sm:mt-0">다음에 하기</Button>
        </DialogClose> */}
      </DialogContent>
    </Dialog>
  );
};

export default SessionEndModal;
