'use client';

import React, { useState, useCallback } from 'react';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { Mic, SendHorizonal } from 'lucide-react';
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import { type StompSendUserMessagePayload } from '@/features/counseling/hooks/useWebSocket';
import { type ChatMessage, MessageType, SenderType } from '@/entities/counseling/model/types';

/**
 * @interface SendMessageFormProps
 * @property {string | null} currentCounsId - 현재 상담 세션의 ID (`couns_id`).
 *                                          메시지 객체 생성에 사용됩니다.
 * @property {boolean} disabled - 폼을 비활성화할지 여부 (옵션, 예: 상담 종료 시)
 * @property {(payload: StompSendUserMessagePayload) => void} [sendUserMessage] - 웹소켓을 통해 메시지를 전송하는 함수.
 * @property {boolean} [isWebSocketConnected] - 웹소켓 연결 상태.
 * @property {() => void} [onUserActivity] - 사용자 활동(예: 입력) 시 호출될 콜백.
 */
interface SendMessageFormProps {
  currentCounsId: string | null;
  /** 폼을 비활성화할지 여부 (옵션, 예: 상담 종료 시) */
  disabled?: boolean;
  sendUserMessage?: (payload: StompSendUserMessagePayload) => void;
  isWebSocketConnected?: boolean;
  onUserActivity?: () => void;
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
const SendMessageForm = ({
  currentCounsId,
  disabled,
  sendUserMessage,
  isWebSocketConnected,
  onUserActivity,
}: SendMessageFormProps): React.ReactElement => {
  const [newMessageInput, setNewMessageInput] = useState('');
  const addMessageToStore = useCounselingStore((state) => state.addMessage);
  const messages = useCounselingStore((state) => state.messages);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewMessageInput(event.target.value);
      if (onUserActivity) {
        onUserActivity();
      }
    },
    [onUserActivity]
  );

  const handleSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!newMessageInput.trim() || !currentCounsId || !isWebSocketConnected || !sendUserMessage) return;

      const trimmedMessage = newMessageInput.trim();

      // USER가 보낸 메시지만 필터링하여 카운트
      const userMessagesCount = messages.filter((message) => message.sender === SenderType.USER).length;

      const payload: StompSendUserMessagePayload = {
        text: trimmedMessage,
        messageOrder: userMessagesCount + 1,
        isVoice: false,
      };
      sendUserMessage(payload);

      setNewMessageInput('');
      if (onUserActivity) {
        onUserActivity();
      }
    },
    [newMessageInput, currentCounsId, isWebSocketConnected, sendUserMessage, messages, onUserActivity]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (onUserActivity) {
        onUserActivity();
      }
      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit, onUserActivity]
  );

  const actualDisabled = disabled || !isWebSocketConnected;

  const placeholderText = disabled
    ? '종료된 상담입니다'
    : isWebSocketConnected
      ? '메시지를 입력하세요...'
      : '연결 중입니다...';

  return (
    <form onSubmit={handleSubmit} className="flex items-end p-4 border-t border-border bg-background shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mr-2 text-muted-foreground hover:text-primary"
        aria-label="Voice input"
        title="음성 입력 (구현 예정)"
        disabled={actualDisabled}
      >
        <Mic className="h-5 w-5" />
      </Button>

      <Textarea
        value={newMessageInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholderText}
        className="flex-1 resize-none border-border focus:ring-1 focus:ring-ring p-2.5 text-sm min-h-[40px] max-h-[120px]"
        rows={1}
        disabled={actualDisabled}
        aria-label="Chat message input"
      />

      <Button
        type="submit"
        disabled={actualDisabled || !newMessageInput.trim()}
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
