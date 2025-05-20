/**
 * @file ChatBubble.tsx
 * 채팅 메시지 하나를 표시하는 말풍선 UI 컴포넌트입니다.
 * FSD 아키텍처에 따라 `entities` 레이어의 `counseling` 슬라이스 내 `ui`에 위치합니다.
 */
import React from 'react';
import { format } from 'date-fns'; // date-fns format 함수 import
import { ko } from 'date-fns/locale'; // 한국어 로케일 import
import { ChatMessage, SenderType, MessageType } from '@/entities/counseling/model/types';
import UserAvatar from '@/entities/user/ui/UserAvatar'; // 방금 만든 UserAvatar 임포트
import { AiProfile } from '@/entities/user/model/types'; // AI 프로필 타입 임포트
import { cn } from '@/shared/lib/utils'; // Tailwind CSS 클래스 병합 유틸리티
import RecommendedContentItem from './RecommendedContentItem'; // 추천 콘텐츠 컴포넌트 임포트

/**
 * ChatBubble 컴포넌트의 Props 인터페이스
 */
interface ChatBubbleProps {
  /** 표시할 채팅 메시지 객체 */
  message: ChatMessage;
  /** AI 프로필 정보 (AI 메시지인 경우 아바타 표시에 사용) */
  aiProfile?: AiProfile;
  /** 메시지 발신자의 이름을 표시할지 여부 (옵션) */
  showSenderName?: boolean;
}

/**
 * 채팅 메시지 말풍선을 표시하는 UI 컴포넌트입니다.
 * 발신자에 따라 다른 스타일(정렬, 색상)을 적용합니다.
 *
 * @param {ChatBubbleProps} props - 컴포넌트 프로퍼티
 * @returns {JSX.Element} ChatBubble 컴포넌트
 */
const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  aiProfile,
  showSenderName = false, // 기본적으로 발신자 이름은 숨김
}) => {
  const isUserMessage = message.sender === SenderType.USER;
  const isAiMessage = message.sender === SenderType.AI;
  const isRecommendation = message.messageType === MessageType.RECOMMENDATION;
  const hasRecommendations = message.recommendations !== undefined && message.recommendations.length > 0;

  // date-fns를 사용하여 시간 포맷팅 (오전/오후 hh:mm)
  const formattedTime = format(new Date(message.timestamp), 'a hh:mm', { locale: ko });

  return (
    <div
      className={cn(
        'flex w-full mb-3',
        isUserMessage ? 'justify-end' : 'justify-start' // 사용자는 오른쪽, AI는 왼쪽 정렬
      )}
    >
      <div
        className={cn(
          'flex items-end gap-2 max-w-[80%] md:max-w-[70%]',
          isUserMessage ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {/* AI 메시지이고 aiProfile 정보가 있을 경우 아바타 표시 */}
        {isAiMessage && aiProfile && (
          <UserAvatar
            imageUrl={aiProfile.avatarUrl}
            fallbackText={aiProfile.name.substring(0, 1) || 'AI'}
            altText={`${aiProfile.name} avatar`}
            size="sm"
          />
        )}
        {/* 사용자 메시지인 경우 아바타를 오른쪽에 표시할 수 있으나, 여기서는 생략 (필요시 UserAvatar 추가) */}

        <div
          className={cn(
            'flex flex-col rounded-lg px-3 py-2 shadow-md break-words',
            isUserMessage
              ? 'bg-primary text-primary-foreground rounded-br-none' // 사용자 말풍선 (globals.css의 --color-primary 사용)
              : 'bg-card text-card-foreground rounded-bl-none', // AI 말풍선 (globals.css의 --color-card 사용)
            {
              'ml-0': isUserMessage, // 사용자 메시지일 때 왼쪽 마진 없음
              'mr-0': isAiMessage, // AI 메시지일 때 오른쪽 마진 없음
            }
          )}
        >
          {/* AI 메시지이고 발신자 이름 표시 옵션이 켜져 있으며, AI 이름이 있을 경우 */}
          {isAiMessage && showSenderName && aiProfile?.name && (
            <p className="text-xs font-semibold mb-0.5 text-muted-foreground">{aiProfile.name}</p>
          )}

          {/* 메시지 텍스트 내용 - 추천 메시지 타입이 아니거나 텍스트 내용이 있는 경우만 표시 */}
          {message.message && <p className="text-sm whitespace-pre-wrap">{message.message}</p>}

          {/* 추천 콘텐츠 목록 렌더링 */}
          {hasRecommendations && (
            <div className={cn('mt-2', isRecommendation ? 'pt-0' : 'pt-2 border-t border-border/40')}>
              {message.recommendations?.map((recommendation, index) => (
                <RecommendedContentItem
                  key={recommendation.id || `${index}-${recommendation.title}`}
                  content={recommendation}
                  className="mb-2 last:mb-0"
                />
              ))}

              {/* 추천 콘텐츠가 많은 경우 "더 보기" 버튼 추가 가능 (필요시) */}
              {message.recommendations && message.recommendations.length > 3 && isRecommendation && (
                <p className="text-xs text-primary font-medium text-center cursor-pointer hover:underline mt-1">
                  추천 콘텐츠 더 보기
                </p>
              )}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground self-end whitespace-nowrap">{formattedTime}</span>
      </div>
    </div>
  );
};

export default ChatBubble;
