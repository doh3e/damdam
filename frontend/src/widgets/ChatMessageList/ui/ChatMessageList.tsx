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
  /** 목록 영역의 높이 (Tailwind CSS 클래스) - 기본값은 화면 높이의 일부 */
  height?: string;
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
const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  aiProfile,
  height = 'h-[calc(100vh-200px)]', // 예시: 헤더/푸터 등을 제외한 높이
  autoScroll = true,
}) => {
  // 메시지 목록의 끝을 참조하는 ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 스크롤 컨테이너 ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 메시지 목록이 변경될 때마다 맨 아래로 스크롤
  useEffect(() => {
    if (!autoScroll) return;

    // 맨 아래로 스크롤 함수
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // 새 메시지가 추가되면 맨 아래로 스크롤
    scrollToBottom();

    // 이미지나 콘텐츠가 로드되어 높이가 변경될 수 있으므로
    // 약간의 지연 후 다시 스크롤
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, autoScroll]); // messages 배열이 변경될 때마다 실행

  return (
    <ScrollArea className={height}>
      <div className="p-4 space-y-4" ref={scrollContainerRef}>
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground">대화를 시작해보세요.</p>
        ) : (
          messages.map((message, index) => (
            <ChatBubble
              key={message.id || `${message.timestamp}-${index}`} // 고유 키 생성
              message={processMessageForDisplay(message)} // 메시지 표시 전처리
              aiProfile={aiProfile}
              showSenderName={true} // AI 이름 표시 (옵션)
            />
          ))
        )}
        {/* 스크롤 맨 아래 감지를 위한 요소 */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessageList;
