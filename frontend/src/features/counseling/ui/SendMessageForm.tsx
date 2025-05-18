'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { Mic, SendHorizonal, StopCircle, Loader2 } from 'lucide-react';
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import { type StompSendUserMessagePayload } from '@/features/counseling/hooks/useWebSocket';
import { type ChatMessage, MessageType, SenderType } from '@/entities/counseling/model/types';
import { useSTTStore, RecordingState } from '@/features/counseling/model/sttStore';
import { useAudioRecording } from '@/features/counseling/hooks/useAudioRecording';
import { useRequestSTTMutation } from '@/features/counseling/model/mutations';

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

  const {
    recordingState,
    audioBlob,
    sttResultText,
    errorMessage: sttErrorMessage,
    setRecordingState,
    setAudioBlob,
    setSttResultText,
    setErrorMessage: setSttErrorMessage,
    resetSTTState,
    messageOrderForAudio,
    setMessageOrderForAudio,
  } = useSTTStore();

  const { startRecording, stopRecording, requestMicrophonePermission } = useAudioRecording();

  const sttMutation = useRequestSTTMutation();

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
      ? recordingState === RecordingState.RECORDING
        ? '녹음 중입니다... 중지하려면 버튼을 누르세요.'
        : recordingState === RecordingState.PROCESSING_STT
          ? '음성을 텍스트로 변환 중입니다...'
          : '메시지를 입력하세요...'
      : '연결 중입니다...';

  const handleMicButtonClick = async () => {
    if (actualDisabled) return;

    if (recordingState === RecordingState.RECORDING) {
      stopRecording();
    } else if (
      recordingState === RecordingState.IDLE ||
      recordingState === RecordingState.ERROR ||
      recordingState === RecordingState.STOPPED
    ) {
      const permissionGranted = await requestMicrophonePermission();
      if (permissionGranted) {
        const userMessagesCount = messages.filter((msg) => msg.sender === SenderType.USER).length;
        setMessageOrderForAudio(userMessagesCount + 1);
        await startRecording();
      }
    } else if (
      recordingState === RecordingState.REQUESTING_PERMISSION ||
      recordingState === RecordingState.PROCESSING_STT
    ) {
      console.log('Currently requesting permission or processing STT. Please wait.');
    }
  };

  useEffect(() => {
    if (sttResultText) {
      setNewMessageInput(sttResultText);
    }
  }, [sttResultText]);

  useEffect(() => {
    if (audioBlob && recordingState === RecordingState.STOPPED) {
      setRecordingState(RecordingState.PROCESSING_STT);
      sttMutation.mutate(
        { audioFile: audioBlob },
        {
          onSuccess: (data) => {
            setSttResultText(data.text);
            setRecordingState(RecordingState.IDLE);
            setAudioBlob(null);
          },
          onError: (error) => {
            console.error('STT Mutation Error:', error);
            setSttErrorMessage(error.message || '음성 변환에 실패했습니다.');
            setRecordingState(RecordingState.ERROR);
            setAudioBlob(null);
          },
        }
      );
    }
  }, [audioBlob, recordingState, sttMutation, setSttResultText, setRecordingState, setAudioBlob, setSttErrorMessage]);

  useEffect(() => {
    if (sttErrorMessage) {
      console.error('STT Error Message:', sttErrorMessage);
    }
  }, [sttErrorMessage]);

  const getMicButtonIcon = () => {
    if (recordingState === RecordingState.RECORDING) {
      return <StopCircle className="h-5 w-5" />;
    }
    if (recordingState === RecordingState.PROCESSING_STT || sttMutation.isPending) {
      return <Loader2 className="h-5 w-5 animate-spin" />;
    }
    return <Mic className="h-5 w-5" />;
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end p-4 border-t border-border bg-background shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mr-2 text-muted-foreground hover:text-primary"
        aria-label={recordingState === RecordingState.RECORDING ? 'Stop recording' : 'Start voice input'}
        title={recordingState === RecordingState.RECORDING ? '녹음 중지' : '음성 입력'}
        onClick={handleMicButtonClick}
        disabled={
          actualDisabled ||
          recordingState === RecordingState.REQUESTING_PERMISSION ||
          recordingState === RecordingState.PROCESSING_STT ||
          sttMutation.isPending
        }
      >
        {getMicButtonIcon()}
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
