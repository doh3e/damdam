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
 */
interface SendMessageFormProps {
  currentCounsId: string | null;
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
const SendMessageForm = ({ currentCounsId }: SendMessageFormProps): React.ReactElement => {
  // Zustand 스토어에서 UI 상태 및 액션 가져오기
  const { newMessageInput, setNewMessageInput, addMessage } = useCounselingStore((state) => ({
    newMessageInput: state.newMessageInput,
    setNewMessageInput: state.setNewMessageInput,
    addMessage: state.addMessage,
  }));

  // 웹소켓 훅 초기화. currentCounsId가 있을 때만 연결 시도.
  // useWebSocket 훅의 autoConnect 기본값이 true이므로, currentCounsId가 유효하면 자동으로 연결 시도.
  const { sendUserMessage, isConnected } = useWebSocket({
    counsId: currentCounsId,
    // authToken:  // 필요시 인증 토큰 전달 로직 추가 (예: 스토어나 컨텍스트에서 가져오기)
  });

  /**
   * 텍스트 영역의 입력 값이 변경될 때 호출되는 핸들러입니다.
   * 입력된 값을 Zustand 스토어에 업데이트합니다.
   * @param {React.ChangeEvent<HTMLTextAreaElement>} event - 입력 변경 이벤트 객체
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessageInput(event.target.value);
  };

  /**
   * 메시지 전송 폼 제출 시 호출되는 핸들러입니다.
   * 입력된 메시지를 ChatMessage 객체로 만들어 스토어에 추가 (Optimistic Update)하고,
   * 웹소켓을 통해 서버로 전송합니다.
   * @param {React.FormEvent<HTMLFormElement>} [event] - 폼 제출 이벤트 객체 (옵션)
   */
  const handleSubmit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!newMessageInput.trim() || !currentCounsId) {
        if (!isConnected && newMessageInput.trim() && currentCounsId) {
          console.warn('WebSocket is not connected. Message not sent.');
          // 사용자에게 웹소켓 연결이 끊겼음을 알리는 UI 피드백 (예: 토스트 메시지)
        }
        return;
      }
      // 웹소켓 연결 상태도 확인 (선택적: 이미 isConnected로 버튼을 비활성화 할 수 있음)
      if (!isConnected) {
        console.warn('Cannot send message: WebSocket is not connected.');
        return;
      }

      const trimmedMessage = newMessageInput.trim();

      // entities/counseling/model/types.ts의 ChatMessage 타입에 맞춰 사용자 메시지 객체 생성
      const userMessage: ChatMessage = {
        id: Date.now().toString(), // 임시 클라이언트 ID, 서버 응답 후 실제 ID로 업데이트 고려
        couns_id: currentCounsId, // 현재 세션 ID 사용
        sender: SenderType.USER,
        messageType: MessageType.TEXT,
        content: trimmedMessage,
        timestamp: Date.now(), // Unix epoch in milliseconds
      };
      addMessage(userMessage); // 스토어에 메시지 추가 (Optimistic Update)

      try {
        // shared/types/websockets.ts의 SendUserMessagePayload 타입에 맞춰 페이로드 생성
        const payload: SendUserMessagePayload = {
          text: trimmedMessage,
        };
        sendUserMessage(payload); // 웹소켓으로 메시지 전송
        setNewMessageInput(''); // 전송 성공 시 입력창 비우기
      } catch (error) {
        console.error('Error sending message via WebSocket:', error);
        // 메시지 전송 실패 시 사용자에게 알림 (예: 토스트 메시지)
        // 실패한 메시지를 스토어에서 제거하거나, '전송 실패' 상태로 UI 업데이트 로직 추가 가능
      }
    },
    [newMessageInput, currentCounsId, isConnected, addMessage, setNewMessageInput, sendUserMessage]
  );

  /**
   * 텍스트 영역에서 키 입력 시 호출되는 핸들러입니다.
   * Enter 키 입력 시 (Shift 키 제외, IME 입력 중 제외) 메시지를 전송합니다.
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} event - 키보드 이벤트 객체
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const isDisabled = !isConnected || !currentCounsId;
  const disabledTitle = !isConnected
    ? '웹소켓에 연결되지 않았습니다.'
    : !currentCounsId
      ? '상담 세션이 활성화되지 않았습니다.'
      : undefined;

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-2 p-4 border-t bg-white">
      {/* 파일 첨부 버튼 (기능 미구현) */}
      <Button variant="ghost" size="icon" type="button" className="text-gray-500" disabled={isDisabled}>
        <Paperclip className="h-5 w-5" />
        <span className="sr-only">파일 첨부</span>
      </Button>
      {/* 메시지 입력 텍스트 영역 */}
      <Textarea
        value={newMessageInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요..."
        className="flex-1 resize-none border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg min-h-[40px]"
        rows={1}
        disabled={isDisabled}
        title={disabledTitle ?? '메시지 입력'}
      />
      {/* 전송 또는 음성 입력 버튼 (조건부 렌더링) */}
      {newMessageInput.trim() ? (
        <Button
          variant="default"
          size="icon"
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          disabled={isDisabled}
          title={disabledTitle ?? '보내기'}
        >
          <SendHorizonal className="h-5 w-5" />
          <span className="sr-only">보내기</span>
        </Button>
      ) : (
        <Button variant="ghost" size="icon" type="button" className="text-gray-500" disabled={isDisabled}>
          <Mic className="h-5 w-5" />
          <span className="sr-only">음성 녹음</span>
        </Button>
      )}
    </form>
  );
};

export default SendMessageForm;
