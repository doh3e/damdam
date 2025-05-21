'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { Mic, SendHorizonal, StopCircle, Loader2, X } from 'lucide-react';
import { useCounselingStore } from '@/features/counseling/model/counselingStore';
import { type StompSendUserMessagePayload } from '@/features/counseling/hooks/useWebSocket';
import { type ChatMessage, MessageType, SenderType } from '@/entities/counseling/model/types';
import { useSTTStore, RecordingState } from '@/features/counseling/model/sttStore';
import { useAudioRecording } from '@/features/counseling/hooks/useAudioRecording';
import { useRequestSTTMutation, useUploadVoiceFileMutation } from '@/features/counseling/model/mutations';

/**
 * @interface SendMessageFormProps
 * @property {string | null} currentCounsId - 현재 상담 세션의 ID (`couns_id`).
 *                                          메시지 객체 생성에 사용됩니다.
 * @property {boolean} disabled - 폼을 비활성화할지 여부 (옵션, 예: 상담 종료 시)
 * @property {(payload: StompSendUserMessagePayload) => void} [sendUserMessage] - 웹소켓을 통해 메시지를 전송하는 함수.
 * @property {boolean} [isWebSocketConnected] - 웹소켓 연결 상태.
 * @property {() => void} [onUserActivity] - 사용자 활동(예: 입력) 시 호출될 콜백.
 * @property {boolean} [isAiTyping] - AI가 현재 답변을 생성 중인지 여부.
 */
interface SendMessageFormProps {
  currentCounsId: string | null;
  /** 폼을 비활성화할지 여부 (옵션, 예: 상담 종료 시) */
  disabled?: boolean;
  sendUserMessage?: (payload: StompSendUserMessagePayload) => void;
  isWebSocketConnected?: boolean;
  onUserActivity?: () => void;
  isAiTyping?: boolean;
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
  isAiTyping,
}: SendMessageFormProps): React.ReactElement => {
  const [newMessageInput, setNewMessageInput] = useState('');
  const messages = useCounselingStore((state) => state.messages);
  const {
    recordingState,
    audioBlob,
    errorMessage: sttErrorMessageFromStore,
    setRecordingState,
    setAudioBlob,
    setSttResultText,
    setErrorMessage: setSttErrorMessageToStore,
    resetSTTState,
    messageOrderForAudio,
    setMessageOrderForAudio,
    isCurrentMessageFromVoice,
    setIsCurrentMessageFromVoice,
  } = useSTTStore();

  const { startRecording, stopRecording } = useAudioRecording();
  const sttMutation = useRequestSTTMutation();
  const uploadVoiceMutation = useUploadVoiceFileMutation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // STT 결과가 변경되면 입력창에 반영
  useEffect(() => {
    const sttResult = useSTTStore.getState().sttResultText;
    if (sttResult && isCurrentMessageFromVoice) {
      setNewMessageInput(sttResult);
    }
  }, [isCurrentMessageFromVoice]);

  // STT 에러 처리
  useEffect(() => {
    if (sttErrorMessageFromStore) {
      console.error('STT Error from store:', sttErrorMessageFromStore);
      setRecordingState(RecordingState.IDLE);
    }
  }, [sttErrorMessageFromStore, setRecordingState]);

  // newMessageInput 상태 변경 시 Textarea 높이 자동 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // 높이를 먼저 auto로 설정하여 축소 가능하게
      let newHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120; // Tailwind CSS의 h-32 (8rem, 128px)에 근접한 최대 높이 (5줄 정도)
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        textareaRef.current.style.overflowY = 'auto'; // 최대 높이 도달 시 스크롤 표시
      } else {
        textareaRef.current.style.overflowY = 'hidden'; // 평소에는 스크롤 숨김
      }
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [newMessageInput]);

  const handleClearVoiceInput = useCallback(() => {
    setNewMessageInput('');
    resetSTTState();

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [resetSTTState]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewMessageInput(event.target.value);
      if (isCurrentMessageFromVoice) {
        // setIsCurrentMessageFromVoice(false);
      }
      if (onUserActivity) {
        onUserActivity();
      }
    },
    [onUserActivity, isCurrentMessageFromVoice]
  );

  const handleMicButtonClick = useCallback(async () => {
    const isFormDisabled = disabled || !isWebSocketConnected;
    if (isFormDisabled) return;

    if (recordingState === RecordingState.IDLE || recordingState === RecordingState.ERROR) {
      if (useSTTStore.getState().sttResultText || audioBlob) {
        handleClearVoiceInput();
      }
      setSttErrorMessageToStore(null);
      await startRecording();
    } else if (recordingState === RecordingState.RECORDING || recordingState === RecordingState.PAUSED) {
      stopRecording();
    }
  }, [
    disabled,
    isWebSocketConnected,
    recordingState,
    startRecording,
    stopRecording,
    setSttErrorMessageToStore,
    resetSTTState,
    audioBlob,
    handleClearVoiceInput,
  ]);

  // audioBlob (WAV)이 생성되고, 녹음 상태가 STOPPED일 때 STT API 요청
  useEffect(() => {
    console.log('[STT useEffect] Triggered. audioBlob (WAV):', audioBlob, 'recordingState:', recordingState);
    if (audioBlob && recordingState === RecordingState.STOPPED) {
      console.log('[STT useEffect] Condition met. Requesting STT with WAV blob...');
      setRecordingState(RecordingState.PROCESSING_STT);

      const userMessagesCount = messages.filter((msg) => msg.sender === SenderType.USER).length;
      const nextMessageOrder = userMessagesCount + 1;
      setMessageOrderForAudio(nextMessageOrder);

      sttMutation.mutate(
        { audioFile: audioBlob },
        {
          onSuccess: (data) => {
            console.log('[STT useEffect] STT mutate onSuccess data:', data);
            if (data && typeof data.text === 'string') {
              setNewMessageInput(data.text);
              setSttResultText(data.text);
              setIsCurrentMessageFromVoice(true);
            } else {
              console.warn('[STT useEffect] STT mutate onSuccess: data.text is invalid', data);
              setSttErrorMessageToStore('STT 결과가 올바르지 않습니다.');
            }
            setRecordingState(RecordingState.IDLE);
          },
          onError: (error) => {
            console.error('[STT useEffect] STT mutate onError:', error);
            setSttErrorMessageToStore(error.message || 'STT 변환에 실패했습니다.');
            resetSTTState();
          },
        }
      );
    } else {
      if (!audioBlob) {
        // console.log('[STT useEffect] Condition NOT met: audioBlob (WAV) is null or undefined.');
      }
      if (recordingState !== RecordingState.STOPPED) {
        // console.log(`[STT useEffect] Condition NOT met: recordingState is ${recordingState}, not STOPPED.`);
      }
    }
  }, [
    audioBlob,
    recordingState,
    setRecordingState,
    sttMutation,
    setSttResultText,
    setSttErrorMessageToStore,
    messages,
    setMessageOrderForAudio,
    resetSTTState,
  ]);

  const handleSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!newMessageInput.trim() || !currentCounsId || !isWebSocketConnected || !sendUserMessage) {
        console.warn('[SendMessageForm] Submit prerequisites not met:', {
          newMessageInput: newMessageInput.trim(),
          currentCounsId,
          isWebSocketConnected,
          sendUserMessageExists: !!sendUserMessage,
        });
        return;
      }

      const trimmedMessage = newMessageInput.trim();
      const localIsVoice = useSTTStore.getState().isCurrentMessageFromVoice;
      const localAudioBlob = useSTTStore.getState().audioBlob;
      const localMessageOrderForAudio = useSTTStore.getState().messageOrderForAudio;

      const userMessagesCount = messages.filter((message) => message.sender === SenderType.USER).length;
      const currentMessageOrder =
        localIsVoice && localMessageOrderForAudio != null ? localMessageOrderForAudio : userMessagesCount + 1;

      const payload: StompSendUserMessagePayload = {
        text: trimmedMessage,
        messageOrder: currentMessageOrder,
        isVoice: localIsVoice,
      };
      sendUserMessage(payload);
      console.log('[SendMessageForm] Message sent via WebSocket:', payload);

      if (payload.isVoice && localAudioBlob && currentCounsId) {
        console.log(
          '[SendMessageForm] Uploading WAV audioBlob for messageOrder:',
          currentMessageOrder,
          'Blob:',
          localAudioBlob
        );
        uploadVoiceMutation.mutate(
          {
            counsId: currentCounsId,
            audioFile: localAudioBlob,
            messageOrder: currentMessageOrder,
            filename: `voice_message_${currentCounsId}_${currentMessageOrder}.wav`,
          },
          {
            onSuccess: () => {
              console.log(
                `[SendMessageForm] WAV voice file uploaded successfully for messageOrder: ${currentMessageOrder}`
              );
            },
            onError: (error) => {
              console.error(
                `[SendMessageForm] Failed to upload WAV voice file for messageOrder: ${currentMessageOrder}`,
                error
              );
            },
          }
        );
      }

      setNewMessageInput('');
      resetSTTState();
      textareaRef.current?.focus();
      if (onUserActivity) {
        onUserActivity();
      }
    },
    [
      newMessageInput,
      currentCounsId,
      isWebSocketConnected,
      sendUserMessage,
      messages,
      uploadVoiceMutation,
      resetSTTState,
      onUserActivity,
    ]
  );

  const placeholderText = isAiTyping
    ? '담담이가 답변 중입니다. 잠시만 기다려주세요!'
    : disabled
      ? '상담이 종료되었습니다.'
      : '메시지를 입력하세요...';

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-end space-x-2">
      {/* 마이크 버튼 */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleMicButtonClick}
        disabled={disabled || !isWebSocketConnected || recordingState === RecordingState.PROCESSING_STT || isAiTyping}
        className="flex-shrink-0 text-gray-500 hover:text-pale-coral-pink dark:text-gray-400 dark:hover:text-pale-coral-pink disabled:opacity-50"
        aria-label={recordingState === RecordingState.RECORDING ? '녹음 중지' : '음성으로 입력하기'}
      >
        {recordingState === RecordingState.RECORDING ? (
          <StopCircle className="h-6 w-6 text-red-500 animate-pulse" />
        ) : recordingState === RecordingState.PROCESSING_STT ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>

      {/* 메시지 입력 Textarea 와 음성 입력 취소 버튼 컨테이너 */}
      <div className="flex-grow relative">
        {isCurrentMessageFromVoice && audioBlob && (
          <div className="absolute top-1/2 transform -translate-y-1/2 right-3 z-10">
            <Button
              type="button"
              variant="default"
              size="icon"
              onClick={handleClearVoiceInput}
              className="h-6 w-6 p-1 bg-pale-coral-pink hover:bg-pale-coral-pink/90 text-white dark:bg-tomato-red dark:hover:bg-tomato-red/90 dark:text-white rounded-full shadow-md"
              aria-label="음성 입력 지우기"
            >
              <X size={14} />
            </Button>
          </div>
        )}
        <Textarea
          ref={textareaRef}
          value={newMessageInput}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (onUserActivity) onUserActivity();
            if (e.key === 'Enter' && !e.shiftKey && !disabled) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={placeholderText}
          disabled={disabled || isAiTyping}
          rows={1}
          className={`w-full resize-none overflow-y-hidden rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pale-coral-pink dark:focus:ring-pale-coral-pink/80 min-h-[40px] placeholder-gray-400 dark:placeholder-gray-500 ${
            disabled || isAiTyping ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
          } pr-10`}
          aria-label="메시지 입력창"
        />
      </div>

      {/* 전송 버튼 - Textarea와 같은 레벨의 형제 요소로 바깥에 위치 */}
      <Button
        type="submit"
        variant="default"
        size="icon"
        disabled={
          disabled ||
          !newMessageInput.trim() ||
          !isWebSocketConnected ||
          recordingState === RecordingState.PROCESSING_STT ||
          isAiTyping
        }
        className="flex-shrink-0 bg-pale-coral-pink hover:bg-pale-coral-pink/90 text-white dark:bg-tomato-red dark:hover:bg-tomato-red/90 dark:text-white disabled:opacity-50 rounded-full"
        aria-label="메시지 전송"
      >
        <SendHorizonal className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default SendMessageForm;
