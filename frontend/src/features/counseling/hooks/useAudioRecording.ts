/**
 * @file frontend/src/features/counseling/hooks/useAudioRecording.ts
 * @description MediaRecorder API를 사용하여 오디오 녹음 기능을 제공하는 커스텀 훅입니다.
 * 녹음 상태 관리, 오디오 데이터 Blob 생성, 최대 녹음 시간 처리 등을 담당합니다.
 */
import { useState, useRef, useCallback } from 'react';
import { useSTTStore, RecordingState } from '@/features/counseling/model/sttStore';

const MAX_RECORDING_TIME_MS = 60 * 1000; // 최대 녹음 시간: 1분 (밀리초 단위)
const MIME_TYPE = 'audio/webm'; // MediaRecorder 기본 출력 포맷 (브라우저 호환성 고려)
// Whisper API는 webm도 지원하므로, 프론트에서 wav로 반드시 변환할 필요는 없을 수 있습니다.
// 만약 wav 변환이 필수라면, 이 훅 또는 별도 유틸리티에서 처리해야 합니다.

/**
 * @interface UseAudioRecordingResult
 * @description useAudioRecording 훅의 반환 값 인터페이스
 * @property {() => Promise<void>} startRecording - 녹음 시작 함수
 * @property {() => void} stopRecording - 녹음 중지 함수
 * @property {() => void} requestMicrophonePermission - 마이크 권한 명시적 요청 함수
 */
interface UseAudioRecordingResult {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  requestMicrophonePermission: () => Promise<boolean>;
}

/**
 * 오디오 녹음 기능을 위한 커스텀 React 훅.
 * MediaRecorder를 사용하여 마이크 입력을 녹음하고, 녹음된 오디오를 Blob으로 제공합니다.
 * 녹음 상태는 useSTTStore를 통해 관리됩니다.
 * @returns {UseAudioRecordingResult} 녹음 시작/중지 함수 등을 포함하는 객체
 */
export const useAudioRecording = (): UseAudioRecordingResult => {
  const {
    setRecordingState,
    setAudioBlob,
    setErrorMessage,
    resetSTTState, // 오류 발생 또는 초기화 시 사용
  } = useSTTStore();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 녹음 관련 상태 및 참조를 초기화합니다.
   */
  const cleanupRecorder = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop(); // 확실히 중지
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  /**
   * 마이크 권한을 요청하고 MediaStream을 반환합니다.
   * @async
   * @returns {Promise<MediaStream | null>} 성공 시 MediaStream, 실패 시 null
   */
  const getMediaStream = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (err) {
      console.error('마이크 권한 요청 실패:', err);
      setErrorMessage('마이크 권한이 필요합니다. 브라우저 설정을 확인해주세요.');
      setRecordingState(RecordingState.ERROR);
      return null;
    }
  };

  /**
   * 마이크 권한을 명시적으로 요청하는 함수입니다.
   * @async
   * @returns {Promise<boolean>} 권한 획득 성공 여부
   */
  const requestMicrophonePermission = async (): Promise<boolean> => {
    setRecordingState(RecordingState.REQUESTING_PERMISSION);
    const stream = await getMediaStream();
    if (stream) {
      // 권한 획득 성공 시 스트림을 바로 사용하지 않고 닫아줌 (startRecording에서 다시 얻음)
      stream.getTracks().forEach((track) => track.stop());
      setRecordingState(RecordingState.IDLE); // 다시 IDLE 상태로 (녹음 시작 전)
      return true;
    }
    return false;
  };

  /**
   * 녹음을 시작합니다.
   * 마이크 권한을 요청하고, MediaRecorder를 설정하여 녹음을 시작합니다.
   * @async
   */
  const startRecording = async (): Promise<void> => {
    resetSTTState(); // 새로운 녹음 시작 전 이전 상태 초기화
    setRecordingState(RecordingState.REQUESTING_PERMISSION);

    const stream = await getMediaStream();
    if (!stream) {
      // getMediaStream 내부에서 에러 처리 및 상태 변경하므로 여기서는 추가 작업 X
      return;
    }

    try {
      setRecordingState(RecordingState.RECORDING);
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: MIME_TYPE });
      audioChunksRef.current = []; // 이전 데이터 초기화

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: MIME_TYPE });
        setAudioBlob(audioBlob);
        setRecordingState(RecordingState.STOPPED); // 녹음 완료, STT 처리 전 상태
        cleanupRecorder(); // MediaRecorder 및 관련 스트림 정리
        stream.getTracks().forEach((track) => track.stop()); // 스트림 트랙 명시적 중지
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder 에러:', event);
        setErrorMessage('녹음 중 오류가 발생했습니다.');
        setRecordingState(RecordingState.ERROR);
        cleanupRecorder();
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();

      // 최대 녹음 시간 타이머 설정
      recordingTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording(); // 여기서 stopRecording을 호출하면 onstop 핸들러가 실행됨
          console.log('최대 녹음 시간(1분) 초과로 자동 종료됩니다.');
        }
      }, MAX_RECORDING_TIME_MS);
    } catch (err) {
      console.error('녹음 시작 중 예외 발생:', err);
      setErrorMessage('녹음을 시작할 수 없습니다.');
      setRecordingState(RecordingState.ERROR);
      cleanupRecorder();
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  /**
   * 진행 중인 녹음을 중지합니다.
   * MediaRecorder의 state가 'recording' 또는 'paused'일 경우 stop() 메소드를 호출합니다.
   */
  const stopRecording = (): void => {
    if (
      mediaRecorderRef.current &&
      (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')
    ) {
      mediaRecorderRef.current.stop(); // 이 호출로 onstop 이벤트 핸들러가 트리거됨
      // 타이머도 cleanupRecorder 또는 onstop 내부에서 정리됨
    } else {
      console.warn('녹음기가 활성 상태가 아니거나 이미 중지되었습니다.');
      // 필요하다면 IDLE 상태로 강제 전환
      // setRecordingState(RecordingState.IDLE);
    }
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  return { startRecording, stopRecording, requestMicrophonePermission };
};
