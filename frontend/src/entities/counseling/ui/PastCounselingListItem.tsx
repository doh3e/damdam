/**
 * @file PastCounselingListItem.tsx
 * 지난 상담 목록에 표시될 단일 상담 요약 아이템 UI 컴포넌트입니다.
 * FSD 아키텍처에 따라 `entities` 레이어의 `counseling` 슬라이스 내 `ui`에 위치합니다.
 */
import React from 'react';
import { CounselingSession } from '@/entities/counseling/model/types';
import UserAvatar from '@/entities/user/ui/UserAvatar';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';

/**
 * PastCounselingListItem 컴포넌트의 Props 인터페이스
 */
interface PastCounselingListItemProps {
  /** 표시할 상담 세션 객체 */
  session: CounselingSession;
  /** 현재 선택된(활성화된) 세션인지 여부 */
  isActive?: boolean;
  /** 제목을 표시할지 여부 */
  showTitle?: boolean;
}

/**
 * 지난 상담 목록의 각 항목을 표시하는 UI 컴포넌트입니다.
 * 클릭 시 해당 상담 상세 페이지로 이동합니다.
 *
 * @param {PastCounselingListItemProps} props - 컴포넌트 프로퍼티
 * @returns {JSX.Element} PastCounselingListItem 컴포넌트
 */
const PastCounselingListItem: React.FC<PastCounselingListItemProps> = ({
  session,
  isActive = false,
  showTitle = false,
}) => {
  // 세션 생성 시각 포맷팅 (YYYY년 M월 D일)
  const formattedCreationTime = session.createdAt ? format(new Date(session.createdAt), 'yyyy년 M월 d일') : '';

  return (
    <div
      className={cn(
        'flex items-center p-3 hover:bg-muted/80 rounded-lg transition-colors duration-150 cursor-pointer',
        isActive ? 'bg-muted shadow-sm' : 'bg-transparent' // 활성 상태일 때 다른 배경
      )}
    >
      <UserAvatar
        imageUrl={session.aiProfile?.avatarUrl} // session.aiProfile?.avatarUrl 사용, 없으면 UserAvatar 내부에서 기본 이미지 처리
        fallbackText="담담이" // fallbackText를 "담담이"로 명시적 설정 (UserAvatar 기본값과 동일하지만 명시)
        altText="AI avatar"
        size="md"
        className="mr-3 flex-shrink-0"
      />
      <div className="flex-grow overflow-hidden">
        {showTitle && session.counsTitle && (
          <div className="mb-1">
            <h3 className="text-sm font-bold text-foreground truncate" title={session.counsTitle}>
              {session.counsTitle}
            </h3>
          </div>
        )}
        {/* 세션 종료 상태 표시 */}
        {session.isClosed ? (
          <p className="text-xs text-tomato-red truncate">종료된 상담입니다.</p>
        ) : (
          <p className="text-xs text-green-600 dark:text-green-500 truncate">진행 중인 상담입니다.</p>
        )}
        {/* 세션 생성 시각 표시 */}
        {formattedCreationTime && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{formattedCreationTime}</p>
        )}
      </div>
    </div>
  );
};

export default PastCounselingListItem;
