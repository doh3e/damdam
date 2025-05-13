/**
 * @file ChatMessageList.tsx
 * 채팅 메시지 목록을 표시하는 위젯 컴포넌트입니다.
 * FSD 아키텍처에 따라 `widgets` 레이어에 위치합니다.
 * 여러 `ChatBubble` 엔티티 컴포넌트를 렌더링합니다.
 */
import React from 'react';
import { ChatMessage } from '@/entities/counseling/model/types';
import ChatBubble from '@/entities/counseling/ui/ChatBubble';
import { AiProfile } from '@/entities/user/model/types';
import { ScrollArea } from '@/shared/ui/scroll-area'; // 스크롤 기능 추가

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
}) => {
  // TODO: 메시지 목록이 업데이트될 때 자동으로 맨 아래로 스크롤하는 기능 추가 (useRef, useEffect 사용)

  return (
    <ScrollArea className={height}>
      <div className="p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground">대화를 시작해보세요.</p>
        ) : (
          messages.map((message, index) => (
            <ChatBubble
              key={`${message.timestamp}-${index}`} // 고유 키 생성 (timestamp와 index 조합)
              message={message}
              aiProfile={aiProfile}
              showSenderName={true} // AI 이름 표시 (옵션)
            />
          ))
        )}
        {/* 스크롤 맨 아래 감지를 위한 요소 (필요시) */}
        {/* <div ref={messagesEndRef} /> */}
      </div>
    </ScrollArea>
  );
};

export default ChatMessageList;
