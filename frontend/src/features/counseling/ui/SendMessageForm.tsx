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

  // STT 결과가 변경되면 입력창에 반영
  useEffect(() => {
    const sttResult = useSTTStore.getState().sttResultText;
    if (sttResult) {
      setNewMessageInput(sttResult);
      // STT 결과 반영 후 isCurrentMessageFromVoice를 true로 설정해야 함
      setIsCurrentMessageFromVoice(true);
    }
  }, [setIsCurrentMessageFromVoice]); // sttResultText를 직접 의존성 배열에 넣으면 무한 루프 가능성

  // STT 에러 처리 (예: 토스트 메시지 또는 콘솔 로그)
  useEffect(() => {
    if (sttErrorMessageFromStore) {
      console.error('STT Error:', sttErrorMessageFromStore);
      // TODO: 사용자에게 토스트 메시지 등으로 에러 알림
      // 에러 발생 시 상태 초기화 또는 사용자 액션 유도
      setRecordingState(RecordingState.IDLE); // 에러 후 IDLE 상태로 복귀 또는 ERROR 상태 유지 선택
    }
  }, [sttErrorMessageFromStore, setRecordingState]);

  // newMessageInput 상태 변경 시 로그 출력
  useEffect(() => {
    console.log('[SendMessageForm] newMessageInput STATE CHANGED:', newMessageInput);
  }, [newMessageInput]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewMessageInput(event.target.value);
      // 사용자가 STT 결과를 수정하더라도 isCurrentMessageFromVoice 등의 상태는 유지합니다.
      // 이전에 있었던, 수정 시 isCurrentMessageFromVoice를 false로 바꾸는 로직 제거.
      if (onUserActivity) {
        onUserActivity();
      }
    },
    [onUserActivity] // 의존성 배열에서 isCurrentMessageFromVoice 등 제거
  );

  const handleMicButtonClick = useCallback(async () => {
    const isFormDisabled = disabled || !isWebSocketConnected;
    if (isFormDisabled) return;

    // 새 녹음을 시작하기 전에 이전 STT 상태를 초기화합니다.
    // 사용자가 STT 결과를 입력창에 받은 상태에서 다시 녹음을 시도하는 경우 등.
    if (recordingState === RecordingState.IDLE || recordingState === RecordingState.ERROR) {
      // isCurrentMessageFromVoice, audioBlob, sttResultText 중 하나라도 활성 상태이면 초기화
      if (isCurrentMessageFromVoice || audioBlob || useSTTStore.getState().sttResultText) {
        resetSTTState(); // 스토어의 STT 관련 상태 모두 초기화
        setNewMessageInput(''); // 입력창 내용도 비움
      }
    }

    switch (recordingState) {
      case RecordingState.IDLE:
      case RecordingState.ERROR: // 에러 상태에서도 새로 시작할 수 있도록
        setSttErrorMessageToStore(null); // 이전 에러 메시지 초기화
        const permissionGranted = await requestMicrophonePermission();
        if (permissionGranted) {
          startRecording();
        }
        break;
      case RecordingState.RECORDING:
        stopRecording();
        // 오디오 Blob이 생성되면 자동으로 sttStore.audioBlob에 저장되고,
        // useAudioRecording 훅의 onStop 콜백에서 setRecordingState(RecordingState.STOPPED) 호출,
        // 그 후 SendMessageForm의 useEffect가 audioBlob을 감지하여 STT 요청
        break;
      case RecordingState.REQUESTING_PERMISSION:
      case RecordingState.STOPPED:
      case RecordingState.PROCESSING_STT:
        // 이 상태들에서는 버튼 클릭 무시 또는 특정 액션 (예: 취소)
        console.log('Mic button clicked during processing state:', recordingState);
        break;
      default:
        break;
    }
  }, [
    disabled,
    isWebSocketConnected,
    recordingState,
    requestMicrophonePermission,
    startRecording,
    stopRecording,
    setSttErrorMessageToStore,
    isCurrentMessageFromVoice, // reset 로직을 위해 추가
    audioBlob, // reset 로직을 위해 추가
    resetSTTState, // reset 로직을 위해 추가
    // setNewMessageInput은 useCallback의 직접적인 의존성은 아니지만, 로직 흐름상 관련됨
    // React state setter 함수는 일반적으로 의존성 배열에 포함하지 않아도 괜찮습니다.
  ]);

  // audioBlob이 변경되고, 상태가 STOPPED일 때 STT API 요청
  useEffect(() => {
    // // textarea 높이 자동 조절 로직 - STT 디버깅 중 임시 주석 처리
    // if (textareaRef.current) {
    //   textareaRef.current.style.height = 'auto';
    //   textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    // }

    // 로그 추가: useEffect 실행 시점의 audioBlob과 recordingState 확인
    console.log('[STT useEffect] Triggered. audioBlob:', audioBlob, 'recordingState:', recordingState);

    if (audioBlob && recordingState === RecordingState.STOPPED) {
      // 로그 추가: 조건문 통과 확인
      console.log('[STT useEffect] Condition met. Requesting STT...');

      setRecordingState(RecordingState.PROCESSING_STT);
      // USER가 보낸 메시지만 필터링하여 다음 메시지 순서 결정
      const userMessagesCount = messages.filter((msg) => msg.sender === SenderType.USER).length;
      const nextMessageOrder = userMessagesCount + 1;
      setMessageOrderForAudio(nextMessageOrder); // STT 결과를 위한 메시지 순서 저장

      sttMutation.mutate(
        { audioFile: audioBlob },
        {
          onSuccess: (data) => {
            // 로그 추가: mutate onSuccess 콜백 실행 확인
            console.log('[STT useEffect] mutate onSuccess data:', data);
            if (data && typeof data.text === 'string') {
              console.log('[STT useEffect] Attempting to set newMessageInput to:', data.text);
              setNewMessageInput(data.text);
            } else {
              console.warn('[STT useEffect] mutate onSuccess: data.text is invalid', data);
            }
            setIsCurrentMessageFromVoice(true);
            setRecordingState(RecordingState.IDLE);
          },
          onError: (error) => {
            // 로그 추가: mutate onError 콜백 실행 확인
            console.log('[STT useEffect] mutate onError:', error);
            setSttErrorMessageToStore(error.message || 'STT 변환에 실패했습니다.');
            setRecordingState(RecordingState.ERROR); // 에러 상태로 변경
            setAudioBlob(null); // 실패 시 Blob 제거
            setMessageOrderForAudio(null);
          },
        }
      );
    } else {
      // 로그 추가: 조건문 실패 시 원인 파악
      if (!audioBlob) {
        console.log('[STT useEffect] Condition NOT met: audioBlob is null or undefined.');
      }
      if (recordingState !== RecordingState.STOPPED) {
        console.log(`[STT useEffect] Condition NOT met: recordingState is ${recordingState}, not STOPPED.`);
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
    setAudioBlob, // 의존성 배열에 추가
  ]);

  const handleSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!newMessageInput.trim() || !currentCounsId || !isWebSocketConnected || !sendUserMessage) return;

      const trimmedMessage = newMessageInput.trim();
      const userMessagesCount = messages.filter((message) => message.sender === SenderType.USER).length;
      const currentMessageOrder =
        isCurrentMessageFromVoice && messageOrderForAudio ? messageOrderForAudio : userMessagesCount + 1;

      const payload: StompSendUserMessagePayload = {
        text: trimmedMessage,
        messageOrder: currentMessageOrder,
        isVoice: isCurrentMessageFromVoice,
      };
      sendUserMessage(payload);

      if (audioBlob && isCurrentMessageFromVoice && currentCounsId) {
        uploadVoiceMutation.mutate(
          {
            counsId: currentCounsId,
            audioFile: audioBlob,
            messageOrder: currentMessageOrder,
          },
          {
            onSuccess: (uploadData) => {
              console.log('음성 파일 업로드 성공 응답:', uploadData);
              setAudioBlob(null); // 성공 후 Blob 최종 정리
            },
            onError: (uploadError) => {
              console.error('음성 파일 업로드 실패 응답:', uploadError);
              // 실패 시 사용자에게 알림 및 audioBlob 유지 여부 결정
            },
          }
        );
      }

      setNewMessageInput('');
      if (onUserActivity) {
        onUserActivity();
      }
      // 메시지 전송 후 STT 관련 상태 초기화 (중복될 수 있으나, 명확성을 위해)
      if (isCurrentMessageFromVoice) {
        resetSTTState(); // 스토어에서 모든 STT 관련 상태를 초기값으로 리셋
      }
    },
    [
      newMessageInput,
      currentCounsId,
      isWebSocketConnected,
      sendUserMessage,
      messages,
      isCurrentMessageFromVoice,
      messageOrderForAudio,
      audioBlob, // audioBlob도 의존성 배열에 추가
      uploadVoiceMutation,
      onUserActivity,
      resetSTTState, // resetSTTState를 의존성 배열에 추가
      setAudioBlob, // handleSubmit 내에서 setAudioBlob을 사용하므로 추가
    ]
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

  const isFormBasicallyDisabled = disabled || !isWebSocketConnected;
  let micButtonIcon;
  let micButtonTitle = '음성 입력';
  let isMicButtonActuallyDisabled = isFormBasicallyDisabled;

  switch (recordingState) {
    case RecordingState.REQUESTING_PERMISSION:
      micButtonIcon = <Loader2 className="h-5 w-5 animate-spin" />;
      micButtonTitle = '권한 요청 중...';
      isMicButtonActuallyDisabled = true;
      break;
    case RecordingState.RECORDING:
      micButtonIcon = <StopCircle className="h-5 w-5 text-red-500" />;
      micButtonTitle = '녹음 중지';
      break;
    case RecordingState.STOPPED:
    case RecordingState.PROCESSING_STT:
      micButtonIcon = <Loader2 className="h-5 w-5 animate-spin" />;
      micButtonTitle = '음성 처리 중...';
      isMicButtonActuallyDisabled = true;
      break;
    case RecordingState.ERROR:
      micButtonIcon = <Mic className="h-5 w-5 text-red-500" />;
      micButtonTitle = '음성 입력 (오류 발생, 재시도)';
      break;
    default: // IDLE
      micButtonIcon = <Mic className="h-5 w-5" />;
      break;
  }

  const placeholderText = isFormBasicallyDisabled
    ? '종료된 상담입니다'
    : isWebSocketConnected
      ? recordingState === RecordingState.RECORDING
        ? '녹음 중입니다... (최대 1분)'
        : '메시지를 입력하거나 마이크 버튼을 누르세요...'
      : '연결 중입니다...';

  const isInputAreaDisabled =
    isFormBasicallyDisabled ||
    recordingState === RecordingState.RECORDING ||
    recordingState === RecordingState.PROCESSING_STT;
  const isSendButtonDisabled =
    isFormBasicallyDisabled ||
    !newMessageInput.trim() ||
    recordingState === RecordingState.RECORDING ||
    recordingState === RecordingState.PROCESSING_STT;

  return (
    <form onSubmit={handleSubmit} className="flex items-end p-4 border-t border-border bg-background shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mr-2 text-muted-foreground hover:text-primary disabled:opacity-50"
        aria-label={micButtonTitle}
        title={micButtonTitle}
        onClick={handleMicButtonClick}
        disabled={isMicButtonActuallyDisabled}
      >
        {micButtonIcon}
      </Button>

      <Textarea
        value={newMessageInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholderText}
        className="flex-1 resize-none border-border focus:ring-1 focus:ring-ring p-2.5 text-sm min-h-[40px] max-h-[120px]"
        rows={1}
        disabled={isInputAreaDisabled}
        aria-label="Chat message input"
      />

      <Button
        type="submit"
        disabled={isSendButtonDisabled}
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
