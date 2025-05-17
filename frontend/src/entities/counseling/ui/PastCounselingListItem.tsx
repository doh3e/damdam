/**
 * @file PastCounselingListItem.tsx
 * 지난 상담 목록에 표시될 단일 상담 요약 아이템 UI 컴포넌트입니다.
 * FSD 아키텍처에 따라 `entities` 레이어의 `counseling` 슬라이스 내 `ui`에 위치합니다.
 */
import React from 'react';
import Link from 'next/link';
import { CounselingSession, SenderType } from '@/entities/counseling/model/types';
import UserAvatar from '@/entities/user/ui/UserAvatar';
import { AiProfile } from '@/entities/user/model/types'; // AI 프로필 타입 임포트 (실제로는 세션 정보에서 AI 이름/아바타 가져와야 함)
import { cn } from '@/shared/lib/utils';
import { ChevronRight } from 'lucide-react';

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
  /** AI 프로필 정보 (실제로는 session 객체 내에서 AI 정보를 가져오거나, 별도 prop으로 받을 수 있음) */
  // 현재 CounselingSession 타입에는 aiId만 있으므로, AI의 구체적인 프로필(이름, 아바타)은
  // 이 컴포넌트를 사용하는 상위 컴포넌트에서 조회하여 전달하거나, session 객체 자체에 포함되어야 합니다.
  // 여기서는 임시로 aiProfile prop을 추가하지만, 데이터 흐름에 따라 수정될 수 있습니다.
  aiProfile?: Pick<AiProfile, 'name' | 'avatarUrl'>;
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
  aiProfile, // 임시 AI 프로필
}) => {
  // 마지막 메시지 텍스트 (간결하게 표시하기 위해 길이 제한 등 필요할 수 있음)
  const lastMessageText = session.lastMessage?.message || '대화 내용이 없습니다.';
  const lastMessageSender = session.lastMessage?.sender;

  // TODO: 실제 날짜 포맷팅 유틸리티 함수로 교체 필요 (예: shared/lib/formatDate.ts)
  const formattedTime = session.lastMessage?.timestamp
    ? new Date(session.lastMessage.timestamp).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  // AI 이름은 session.aiId를 기반으로 조회하거나, aiProfile prop을 통해 받아야 합니다.
  // 여기서는 임시로 aiProfile prop을 사용합니다.
  const aiDisplayName = aiProfile?.name || '담담이';
  const aiAvatarFallback = aiDisplayName.substring(0, 1);

  return (
    <div
      className={cn(
        'flex items-center p-3 hover:bg-muted/80 rounded-lg transition-colors duration-150 cursor-pointer',
        isActive ? 'bg-muted shadow-sm' : 'bg-transparent' // 활성 상태일 때 다른 배경
      )}
    >
      <UserAvatar
        imageUrl={aiProfile?.avatarUrl}
        fallbackText={aiAvatarFallback}
        altText={`${aiDisplayName} avatar`}
        size="md"
        className="mr-3 flex-shrink-0"
      />
      <div className="flex-grow overflow-hidden">
        {showTitle && session.counsTitle && (
          <div className="mb-1">
            <h3 className="text-sm font-bold text-foreground truncate">{session.counsTitle}</h3>
          </div>
        )}
        <div className="flex justify-between items-center mb-0.5">
          <h3 className="text-sm font-semibold text-foreground truncate">상담사 프로필: {aiDisplayName}</h3>
          {formattedTime && <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{formattedTime}</span>}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {lastMessageSender === SenderType.USER && '나: '}
          {lastMessageText}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground ml-2 flex-shrink-0 opacity-70 group-hover:opacity-100" />
    </div>
  );
};

export default PastCounselingListItem;
