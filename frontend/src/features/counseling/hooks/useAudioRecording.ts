/**
 * @file frontend/src/features/counseling/hooks/useAudioRecording.ts
 * @description react-media-recorder를 사용하여 오디오 녹음 기능을 제공하는 커스텀 훅입니다.
 * 녹음 상태 관리, 오디오 데이터 Blob 생성 등을 담당합니다.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder'; // 새 라이브러리 import
import { useSTTStore, RecordingState } from '@/features/counseling/model/sttStore';

const MAX_RECORDING_TIME_MS = 60 * 1000; // 최대 녹음 시간: 1분 (밀리초 단위)
const RECORDING_MIME_TYPE = 'audio/wav'; // 녹음 형식 (WAV)

export interface UseAudioRecordingReturn {
  recordingState: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording?: () => void; // react-media-recorder는 pause/resume 지원
  resumeRecording?: () => void;
  recordingTime: number;
  mediaBlobUrl: string | null; // 녹음된 오디오 파일의 URL
  audioBlob: Blob | null; // 녹음된 오디오 Blob
  error: string | null; // 녹음 중 발생한 에러
  isRecording: boolean; // 현재 녹음 중인지 여부 (status === 'recording')
  isPaused: boolean; // 현재 일시정지 중인지 여부 (status === 'paused')
  isInactive: boolean; // 현재 비활성(초기) 상태인지 여부 (status === 'idle' || status === 'stopped')
}

/**
 * 오디오 녹음 관련 로직을 처리하는 커스텀 훅입니다.
 * react-media-recorder의 useReactMediaRecorder를 기반으로 합니다.
 *
 * @returns {UseAudioRecordingReturn} 오디오 녹음 상태 및 제어 함수들을 포함하는 객체입니다.
 */
export const useAudioRecording = (): UseAudioRecordingReturn => {
  const {
    setRecordingState,
    setAudioBlob,
    setErrorMessage: setSttErrorMessage,
    recordingState: sttRecordingState,
    setSttResultText,
  } = useSTTStore();

  const [recordingTime, setRecordingTime] = useState(0);
  const [internalAudioBlob, setInternalAudioBlob] = useState<Blob | null>(null);
  const [internalMediaBlobUrl, setInternalMediaBlobUrl] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStop = useCallback(
    (blobUrl: string, blob: Blob) => {
      // console.log('녹음 중지됨, Blob URL:', blobUrl, 'Blob:', blob);
      setInternalMediaBlobUrl(blobUrl);
      setInternalAudioBlob(blob);
      setAudioBlob(blob); // STT 스토어에도 Blob 저장
      setRecordingState(RecordingState.STOPPED);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    },
    [setAudioBlob, setRecordingState]
  );

  const {
    status,
    startRecording: RMRStartRecording,
    stopRecording: RMRStopRecording,
    pauseRecording: RMRPauseRecording,
    resumeRecording: RMRResumeRecording,
    mediaBlobUrl: RMRMediaBlobUrl, // 직접적인 Blob URL 상태
    error: RMRError,
    clearBlobUrl: RMRClearBlobUrl, // Blob URL 초기화 함수
  } = useReactMediaRecorder({
    audio: true,
    blobPropertyBag: { type: RECORDING_MIME_TYPE },
    onStop: handleStop, // 녹음 중지 시 콜백
    askPermissionOnMount: false, // 처음 마운트 시 권한 요청 안 함 (필요시 수동으로)
  });

  useEffect(() => {
    // RMRMediaBlobUrl이 변경되고, 그 값이 실제 URL일 때 (초기 null이 아닐 때)
    // 그리고 status가 'stopped'일 때 (녹음이 완료되었을 때)
    // 하지만 onStop 콜백에서 이미 처리하므로, 여기서는 중복 처리를 피하거나
    // onStop을 사용하지 않는 경우 이펙트로 mediaBlobUrl 변경을 감지하여 처리할 수 있습니다.
    // 현재는 onStop 콜백을 사용하므로 이 useEffect는 mediaBlobUrl을 직접 반영하는 용도로만 남겨두거나,
    // 필요에 따라 onStop에서 처리하지 않는 로직(예: UI 업데이트)을 추가할 수 있습니다.
    if (RMRMediaBlobUrl && status === 'stopped' && !internalMediaBlobUrl) {
      // onStop이 먼저 호출되어 internalMediaBlobUrl이 설정되므로, 이 조건은 잘 발생하지 않음.
      // 만약 onStop을 안쓰고 순수하게 mediaBlobUrl 상태 변화로만 제어한다면 필요.
      // console.log('RMRMediaBlobUrl 변경 감지 (stopped 상태):', RMRMediaBlobUrl);
      // setInternalMediaBlobUrl(RMRMediaBlobUrl); // onStop에서 처리
      // Blob 객체를 생성하는 로직이 필요할 수 있으나, onStop에서 blob을 직접 받음
    }

    // 에러 상태 업데이트
    if (RMRError) {
      let friendlyError = '알 수 없는 녹음 오류가 발생했습니다.';
      switch (RMRError) {
        case 'permission_denied':
          friendlyError = '마이크 접근 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.';
          break;
        case 'no_specified_media_found':
          friendlyError = '사용 가능한 마이크 장치가 없습니다. 마이크 연결을 확인해주세요.';
          break;
        // 추가적인 에러 케이스들
        default:
          console.error('react-media-recorder error:', RMRError);
      }
      setSttErrorMessage(friendlyError);
      setRecordingState(RecordingState.ERROR);
    }
  }, [RMRMediaBlobUrl, RMRError, status, setSttErrorMessage, setRecordingState, internalMediaBlobUrl]);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setRecordingTime(0); // 타이머 시작 시 항상 0부터
    timerRef.current = setInterval(() => {
      setRecordingTime((prevTime) => {
        if (prevTime >= MAX_RECORDING_TIME_MS / 1000 - 1) {
          // -1을 하는 이유는 아래 RMRStopRecording이 호출되기 전에 시간이 한번 더 증가하는 것을 방지
          RMRStopRecording(); // 최대 시간 도달 시 자동 중지
          if (timerRef.current) clearInterval(timerRef.current);
          return MAX_RECORDING_TIME_MS / 1000;
        }
        return prevTime + 1;
      });
    }, 1000);
  }, [RMRStopRecording]);

  const handleStartRecording = useCallback(async () => {
    try {
      // console.log('녹음 시작 요청');
      setSttErrorMessage(null); // 이전 에러 메시지 초기화
      setInternalAudioBlob(null); // 이전 Blob 초기화
      // setInternalMediaBlobUrl(null); // RMRClearBlobUrl이 이 역할을 할 수 있음
      RMRClearBlobUrl(); // 기존 Blob URL 및 녹음 상태 초기화
      setSttResultText(''); // 이전 STT 결과 초기화 (setSttRecognizedText -> setSttResultText 및 빈 문자열로 초기화)

      // 권한 요청이 여기서 명시적으로 이루어지지 않음.
      // useReactMediaRecorder가 내부적으로 처리하거나, askPermissionOnMount=true로 설정.
      // 필요하다면 navigator.mediaDevices.getUserMedia를 먼저 호출하여 권한 확보 후 RMRStartRecording 호출.
      // 하지만 useReactMediaRecorder가 이를 내부적으로 처리해줄 것으로 기대.
      await RMRStartRecording(); // promise를 반환하지 않을 수 있음, 라이브러리 확인 필요
      // console.log('RMRStartRecording 호출 후, 현재 상태:', status); // 상태 변화는 비동기적일 수 있음
      setRecordingState(RecordingState.RECORDING);
      startTimer();
    } catch (err) {
      console.error('녹음 시작 중 에러:', err);
      let message = '녹음 시작 중 오류가 발생했습니다.';
      if (err instanceof Error) {
        // react-media-recorder의 error 상태와는 별개로 startRecording 자체에서 에러가 날 경우
        if (err.name === 'NotAllowedError') {
          message = '마이크 접근 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.';
        } else if (err.name === 'NotFoundError') {
          message = '사용 가능한 마이크 장치가 없습니다. 마이크 연결을 확인해주세요.';
        }
      }
      setSttErrorMessage(message);
      setRecordingState(RecordingState.ERROR);
    }
  }, [setSttErrorMessage, RMRClearBlobUrl, RMRStartRecording, setRecordingState, startTimer, status, setSttResultText]);

  const handleStopRecording = useCallback(async () => {
    // console.log('녹음 중지 요청');
    // RMRStopRecording은 onStop 콜백을 트리거함.
    // onStop 콜백 내에서 상태 변경 및 타이머 정리가 이루어짐.
    await RMRStopRecording(); // promise를 반환하지 않을 수 있음
    // setRecordingState(RecordingState.STOPPED); // onStop에서 처리
    // if (timerRef.current) clearInterval(timerRef.current); // onStop에서 처리
    // setRecordingTime(0); // onStop에서 처리
  }, [RMRStopRecording]);

  const handlePauseRecording = useCallback(async () => {
    if (status === 'recording') {
      await RMRPauseRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingState(RecordingState.PAUSED);
      // console.log('녹음 일시 중지됨');
    }
  }, [RMRPauseRecording, status, setRecordingState]);

  const handleResumeRecording = useCallback(async () => {
    if (status === 'paused') {
      await RMRResumeRecording();
      startTimer(); // 정지되었던 타이머 다시 시작
      setRecordingState(RecordingState.RECORDING);
      // console.log('녹음 재개됨');
    }
  }, [RMRResumeRecording, status, startTimer, setRecordingState]);

  // STT 스토어의 recordingState와 내부 status 동기화 (선택적)
  // useReactMediaRecorder의 status를 직접 사용하는 것이 더 정확할 수 있음
  useEffect(() => {
    // console.log('RMR Status changed:', status);
    // console.log('STT Store recordingState:', sttRecordingState);
    // console.log('Internal Audio Blob:', internalAudioBlob);
    // console.log('Internal Media Blob URL:', internalMediaBlobUrl);
    // UI 상태를 STTStore와 동기화할 필요가 있다면 여기서 처리
    // 예: if (status === 'recording' && sttRecordingState !== RecordingState.RECORDING) {
    //   setRecordingState(RecordingState.RECORDING);
    // }
    // 하지만 대부분의 상태 업데이트는 각 핸들러 함수나 onStop 콜백에서 처리됨.
  }, [status, sttRecordingState, internalAudioBlob, internalMediaBlobUrl, setRecordingState]);

  return {
    recordingState: sttRecordingState, // STT 스토어의 상태를 우선으로 반환하거나, RMR status 기반으로 변환
    startRecording: handleStartRecording,
    stopRecording: handleStopRecording,
    pauseRecording: handlePauseRecording,
    resumeRecording: handleResumeRecording,
    recordingTime,
    mediaBlobUrl: internalMediaBlobUrl || RMRMediaBlobUrl || null, // undefined일 경우 null 처리
    audioBlob: internalAudioBlob, // onStop에서 설정된 Blob
    error: RMRError || null, // react-media-recorder가 제공하는 에러 (undefined일 경우 null 처리)
    isRecording: status === 'recording',
    isPaused: status === 'paused',
    isInactive: status === 'idle' || status === 'stopped' || status === 'acquiring_media', // acquiring_media도 비활성으로 간주
  };
};
