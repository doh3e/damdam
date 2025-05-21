/**
 * @file ChatMessageList.tsx
 * 채팅 메시지 목록을 표시하는 위젯 컴포넌트입니다.
 * FSD 아키텍처에 따라 `widgets` 레이어에 위치합니다.
 * 여러 `ChatBubble` 엔티티 컴포넌트를 렌더링합니다.
 */
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '@/entities/counseling/model/types';
import ChatBubble from '@/entities/counseling/ui/ChatBubble';
import { AiProfile } from '@/entities/user/model/types';
import { ScrollArea } from '@/shared/ui/scroll-area'; // 스크롤 기능 추가
import { processMessageForDisplay } from '@/features/counseling/lib/utils';

/**
 * ChatMessageList 컴포넌트의 Props 인터페이스
 */
interface ChatMessageListProps {
  /** 표시할 채팅 메시지 객체 배열 */
  messages: ChatMessage[];
  /** AI 프로필 정보 (AI 메시지 아바타 표시에 사용) */
  aiProfile?: AiProfile;
  /** 자동 스크롤 사용 여부 (기본값: true) */
  autoScroll?: boolean;
}

/**
 * 채팅 메시지 목록을 표시하는 위젯 컴포넌트입니다.
 * `ChatBubble` 컴포넌트들을 리스트 형태로 렌더링하고 스크롤 기능을 제공합니다.
 *
 * @param {ChatMessageListProps} props - 컴포넌트 프로퍼티
 * @returns {JSX.Element} ChatMessageList 컴포넌트
 */
const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, aiProfile, autoScroll = true }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 목록을 timestamp 기준으로 오름차순 정렬합니다.
  const sortedMessages = React.useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages]);

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    // 새 메시지 추가 후 즉시 스크롤하고, 이미지 로드 등 비동기적 높이 변경을 고려하여
    // 짧은 지연 후 한 번 더 스크롤 (선택적 강화)
    const timer = setTimeout(() => {
      if (autoScroll && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, autoScroll]); // sortedMessages를 쓰면 messages가 바뀔 때마다 정렬이 일어나므로 messages를 유지

  return (
    <ScrollArea className="h-full w-full scrollbar-custom">
      <div className="p-4 space-y-4">
        {sortedMessages.length === 0 ? (
          <p className="text-center text-muted-foreground pt-4">반갑습니다! 당신의 이야기를 들려주세요.</p>
        ) : (
          sortedMessages.map((message, index) => (
            <ChatBubble
              key={message.id || `${message.timestamp}-${message.messageOrder}-${message.sender}-${index}`}
              message={processMessageForDisplay(message)}
              aiProfile={aiProfile}
              showSenderName={true}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessageList;
