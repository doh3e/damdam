'use client';

import React, { useState, useCallback } from 'react';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { Paperclip, Mic, SendHorizonal } from 'lucide-react';
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { type ChatMessage, MessageType, SenderType } from '@/entities/counseling/model/types';
import type { SendUserMessagePayload } from '@/shared/types/websockets';

/**
 * @interface SendMessageFormProps
 * @property {string | null} currentCounsId - 현재 상담 세션의 ID (`couns_id`).
 *                                          `useWebSocket` 훅 초기화 및 메시지 객체 생성에 사용됩니다.
 * @property {boolean} disabled - 폼을 비활성화할지 여부 (옵션, 예: 상담 종료 시)
 */
interface SendMessageFormProps {
  currentCounsId: string | null;
  /** 폼을 비활성화할지 여부 (옵션, 예: 상담 종료 시) */
  disabled?: boolean;
}

/**
 * SendMessageForm 컴포넌트
 *
 * 사용자가 텍스트 메시지를 입력하고 전송할 수 있는 폼입니다.
 * 음성 입력 및 파일 첨부 버튼의 UI도 포함되어 있으나, 실제 기능은 구현되지 않았습니다.
 *
 * @param {SendMessageFormProps} props - 컴포넌트 props
 * @returns {React.ReactElement} SendMessageForm 컴포넌트
 */
const SendMessageForm = ({ currentCounsId, disabled }: SendMessageFormProps): React.ReactElement => {
  const [newMessageInput, setNewMessageInput] = useState('');
  const addMessageToStore = useCounselingStore((state) => state.addMessage);
  // 현재 상담 ID (couns_id)와 인증 토큰 (필요시)을 useWebSocket에 전달해야 합니다.
  // authToken은 예를 들어 Zustand 스토어나 Context API에서 가져올 수 있습니다.
  // const authToken = useAuthStore((state) => state.token); // 예시
  const { sendUserMessage, isConnected } = useWebSocket({
    counsId: currentCounsId,
    // authToken: authToken, // 실제 인증 토큰 전달 로직 필요
    autoConnect: true, // 컴포넌트 마운트 시 자동 연결 (또는 필요에 따라 false)
  });

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessageInput(event.target.value);
  }, []);

  const handleSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!newMessageInput.trim() || !currentCounsId || !isConnected) return;

      const trimmedMessage = newMessageInput.trim();

      // ChatMessage 타입의 실제 필드명에 맞춰 수정 (예: id, timestamp)
      const userMessage: ChatMessage = {
        id: Date.now().toString(), // 임시 클라이언트 ID (string 타입 가정)
        couns_id: currentCounsId,
        sender: SenderType.USER,
        messageType: MessageType.TEXT, // message_type 대신 messageType 사용 (Linter 제안)
        content: trimmedMessage,
        timestamp: Date.now(), // Unix epoch in milliseconds (number 타입 가정)
        // created_at 대신 timestamp 사용 가정
      };

      addMessageToStore(userMessage);

      // SendUserMessagePayload의 실제 필드명에 맞춰 수정 (예: text)
      // counsId 등은 useWebSocket 훅 내부에서 처리될 수 있음
      const payload: SendUserMessagePayload = {
        text: trimmedMessage, // 웹소켓 페이로드에 content 대신 text 사용 가정
        // messageType, senderType 등은 웹소켓 서버 스펙에 따라 추가될 수 있음
      };
      sendUserMessage(payload);

      setNewMessageInput('');
    },
    [newMessageInput, currentCounsId, isConnected, addMessageToStore, sendUserMessage]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const isSendDisabled = !newMessageInput.trim() || !isConnected;

  return (
    <form onSubmit={handleSubmit} className="flex items-end p-4 border-t border-border bg-background shadow-sm">
      {/* 파일 첨부 버튼 - UI 스타일링 */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mr-2 text-muted-foreground hover:text-primary"
        aria-label="Attach file"
        title="파일 첨부 (구현 예정)"
        disabled={!isConnected}
      >
        <Paperclip className="h-5 w-5" />
      </Button>

      {/* 음성 입력 버튼 - UI 스타일링 */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mr-2 text-muted-foreground hover:text-primary"
        aria-label="Voice input"
        title="음성 입력 (구현 예정)"
        disabled={!isConnected}
      >
        <Mic className="h-5 w-5" />
      </Button>

      {/* 메시지 입력창 - UI 스타일링 */}
      <Textarea
        value={newMessageInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={isConnected ? '메시지를 입력하세요...' : '연결 중입니다...'}
        className="flex-1 resize-none border-border focus:ring-1 focus:ring-ring p-2.5 text-sm min-h-[40px] max-h-[120px]"
        rows={1}
        disabled={!isConnected}
        aria-label="Chat message input"
      />

      {/* 메시지 전송 버튼 - UI 스타일링 */}
      <Button
        type="submit"
        disabled={isSendDisabled}
        className="ml-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2.5 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
        aria-label="Send message"
        title="메시지 전송"
      >
        <SendHorizonal className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default SendMessageForm;
