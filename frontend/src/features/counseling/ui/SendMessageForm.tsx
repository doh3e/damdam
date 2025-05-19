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

  const { startRecording, stopRecording, requestMicrophonePermission } = useAudioRecording();
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
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newMessageInput]);

  const handleClearVoiceInput = useCallback(() => {
    setNewMessageInput('');
    setAudioBlob(null);
    setIsCurrentMessageFromVoice(false);
    setSttResultText('');

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

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
      const permissionGranted = await requestMicrophonePermission();
      if (permissionGranted) {
        startRecording();
      }
    } else if (recordingState === RecordingState.RECORDING) {
      stopRecording();
    }
  }, [
    disabled,
    isWebSocketConnected,
    recordingState,
    requestMicrophonePermission,
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
            setRecordingState(RecordingState.ERROR);
            setAudioBlob(null);
            setMessageOrderForAudio(null);
            setIsCurrentMessageFromVoice(false);
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
    setAudioBlob,
    setIsCurrentMessageFromVoice,
  ]);

  const handleSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!newMessageInput.trim() || !currentCounsId || !isWebSocketConnected || !sendUserMessage) {
        console.warn('[SendMessageForm] Submit prerequisites not met:', {
          newMessageInput,
          currentCounsId,
          isWebSocketConnected,
          sendUserMessageExists: !!sendUserMessage,
        });
        return;
      }

      const trimmedMessage = newMessageInput.trim();
      const userMessagesCount = messages.filter((message) => message.sender === SenderType.USER).length;
      const currentMessageOrder =
        isCurrentMessageFromVoice && messageOrderForAudio != null ? messageOrderForAudio : userMessagesCount + 1;

      const payload: StompSendUserMessagePayload = {
        text: trimmedMessage,
        messageOrder: currentMessageOrder,
        isVoice: isCurrentMessageFromVoice,
      };
      sendUserMessage(payload);
      console.log('[SendMessageForm] Message sent via WebSocket:', payload);

      if (audioBlob && isCurrentMessageFromVoice && currentCounsId) {
        console.log(
          '[SendMessageForm] Uploading WAV audioBlob for messageOrder:',
          currentMessageOrder,
          'Blob:',
          audioBlob
        );
        uploadVoiceMutation.mutate(
          {
            counsId: currentCounsId,
            audioFile: audioBlob,
            messageOrder: currentMessageOrder,
          },
          {
            onSuccess: (uploadData) => {
              console.log('[SendMessageForm] WAV voice file uploaded successfully:', uploadData);
              resetSTTState();
            },
            onError: (uploadError) => {
              console.error('[SendMessageForm] Failed to upload WAV voice file:', uploadError);
              setSttErrorMessageToStore(`음성 파일 업로드에 실패했습니다: ${uploadError.message || '서버 오류'}`);
            },
          }
        );
      } else if (isCurrentMessageFromVoice && !audioBlob) {
        console.warn(
          '[SendMessageForm] isCurrentMessageFromVoice is true, but audioBlob is null. Voice file will not be uploaded.'
        );
      }

      setNewMessageInput('');
      if (isCurrentMessageFromVoice) {
        // resetSTTState();
      } else {
        resetSTTState();
      }
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
      audioBlob,
      isCurrentMessageFromVoice,
      messageOrderForAudio,
      uploadVoiceMutation,
      resetSTTState,
      setSttErrorMessageToStore,
      onUserActivity,
    ]
  );

  let micIcon = <Mic className="h-5 w-5" />;
  let micButtonVariant: 'default' | 'destructive' | 'ghost' = 'ghost';
  let micButtonTooltip = '음성 녹음 시작';

  if (recordingState === RecordingState.REQUESTING_PERMISSION) {
    micIcon = <Loader2 className="h-5 w-5 animate-spin" />;
    micButtonTooltip = '마이크 권한 요청 중...';
  } else if (recordingState === RecordingState.RECORDING) {
    micIcon = <StopCircle className="h-5 w-5 text-red-500" />;
    micButtonVariant = 'destructive';
    micButtonTooltip = '녹음 중지';
  } else if (recordingState === RecordingState.PROCESSING_STT) {
    micIcon = <Loader2 className="h-5 w-5 animate-spin" />;
    micButtonTooltip = '음성 변환 중...';
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 flex w-full items-center space-x-2 border-t bg-background p-3 md:p-4"
    >
      <Button
        type="button"
        variant={micButtonVariant}
        size="icon"
        onClick={handleMicButtonClick}
        disabled={disabled || !isWebSocketConnected || recordingState === RecordingState.PROCESSING_STT}
        title={micButtonTooltip}
        className="text-muted-foreground"
      >
        {micIcon}
        <span className="sr-only">{micButtonTooltip}</span>
      </Button>

      <div className="flex-grow relative">
        <Textarea
          ref={textareaRef}
          placeholder={
            recordingState === RecordingState.RECORDING
              ? '녹음 중... 녹음을 완료하려면 녹음 버튼을 다시 누르세요.'
              : recordingState === RecordingState.PROCESSING_STT
                ? '음성 변환 중...'
                : isCurrentMessageFromVoice
                  ? '음성 변환 결과입니다. 전송하거나 다시 녹음하세요.'
                  : '메시지를 입력하세요...'
          }
          value={newMessageInput}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          rows={1}
          className="max-h-[120px] min-h-[40px] flex-1 resize-none overflow-y-auto rounded-full px-4 py-2 scrollbar-thin"
          disabled={
            disabled || recordingState === RecordingState.RECORDING || recordingState === RecordingState.PROCESSING_STT
          }
          onFocus={onUserActivity}
          onBlur={() => {
            // console.log('Textarea blurred');
          }}
        />
        {isCurrentMessageFromVoice && newMessageInput && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleClearVoiceInput}
            title="음성 입력 취소"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      <Button
        type="submit"
        size="icon"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={!newMessageInput.trim() || disabled || !isWebSocketConnected}
        title="메시지 전송"
      >
        <SendHorizonal className="h-5 w-5" />
        <span className="sr-only">메시지 전송</span>
      </Button>
    </form>
  );
};

export default SendMessageForm;
