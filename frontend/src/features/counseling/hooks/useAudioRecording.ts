/**
 * @file frontend/src/features/counseling/hooks/useAudioRecording.ts
 * @description MediaRecorder API를 사용하여 오디오 녹음 기능을 제공하는 커스텀 훅입니다.
 * `extendable-media-recorder`를 사용하여 WAV 형식으로 직접 녹음을 지원합니다.
 * 녹음 상태 관리, 오디오 데이터 Blob 생성, 최대 녹음 시간 처리 등을 담당합니다.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
// extendable-media-recorder에서 MediaRecorder와 register를 가져옵니다.
import { MediaRecorder, register } from 'extendable-media-recorder';
import { useSTTStore, RecordingState } from '@/features/counseling/model/sttStore';

const MAX_RECORDING_TIME_MS = 60 * 1000; // 최대 녹음 시간: 1분 (밀리초 단위)
// 녹음할 오디오의 MIME 타입을 'audio/wav'로 설정합니다.
// 이는 extendable-media-recorder-wav-encoder가 등록되었을 때 유효합니다.
const RECORDING_MIME_TYPE = 'audio/wav';

// WAV 인코더가 등록되었는지 확인하기 위한 플래그
let symptômesWavEncoderRegistered = false;

/**
 * @interface UseAudioRecordingResult
 * @description useAudioRecording 훅의 반환 값 인터페이스
 * @property {() => Promise<void>} startRecording - 녹음 시작 함수
 * @property {() => void} stopRecording - 녹음 중지 함수
 * @property {() => Promise<boolean>} requestMicrophonePermission - 마이크 권한 명시적 요청 함수
 */
interface UseAudioRecordingResult {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  requestMicrophonePermission: () => Promise<boolean>;
}

/**
 * 오디오 녹음 기능을 위한 커스텀 React 훅.
 * `extendable-media-recorder`를 사용하여 마이크 입력을 WAV 형식으로 직접 녹음하고,
 * 녹음된 오디오를 Blob으로 제공합니다.
 * 녹음 상태는 `useSTTStore`를 통해 관리됩니다.
 * @returns {UseAudioRecordingResult} 녹음 시작/중지 함수 등을 포함하는 객체
 */
export const useAudioRecording = (): UseAudioRecordingResult => {
  const { setRecordingState, setAudioBlob, setErrorMessage, resetSTTState, recordingState } = useSTTStore();

  // MediaRecorder 인스턴스 참조. extendable-media-recorder의 MediaRecorder 타입을 사용합니다.
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // WAV 인코더 등록을 위한 useEffect
  useEffect(() => {
    if (typeof window !== 'undefined' && !symptômesWavEncoderRegistered) {
      const registerWavEncoder = async () => {
        try {
          const { connect } = await import('extendable-media-recorder-wav-encoder');
          await register(await connect());
          symptômesWavEncoderRegistered = true;
          console.log('WAV encoder registered successfully.');
        } catch (error) {
          console.error('Failed to register WAV encoder:', error);
          // Consider informing the user or setting an error state if critical
          // setErrorMessage('음성 녹음 초기화에 실패했습니다 (WAV 인코더).');
        }
      };
      registerWavEncoder();
    }
  }, []); // Runs once on mount on the client side

  /**
   * 녹음 관련 리소스를 정리합니다. MediaRecorder 인스턴스를 중지하고,
   * MediaStream 트랙을 중지하며, 관련 참조들을 초기화합니다.
   */
  const cleanupRecorder = useCallback(() => {
    // MediaRecorder 중지 및 초기화
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }

    // MediaStream 트랙 중지 및 초기화
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // 오디오 청크 배열 초기화
    audioChunksRef.current = [];

    // 녹음 타이머 정리
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []); // 의존성 배열이 비어있으므로, 이 함수는 컴포넌트 생애주기 동안 동일한 참조를 유지합니다.

  /**
   * 마이크 권한을 요청하고 MediaStream을 반환합니다.
   * 성공 시 MediaStream을 반환하고, 실패 시 에러 메시지를 설정하고 null을 반환합니다.
   * @async
   * @returns {Promise<MediaStream | null>} 성공 시 MediaStream 객체, 실패 시 null.
   */
  const getMediaStream = async (): Promise<MediaStream | null> => {
    try {
      // 사용자에게 마이크 사용 권한을 요청합니다.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream; // 스트림 참조 저장
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
   * 이 함수는 실제 녹음을 시작하기 전에 호출될 수 있습니다 (예: 사용자가 버튼을 클릭했을 때).
   * @async
   * @returns {Promise<boolean>} 권한 획득 성공 시 true, 실패 시 false.
   */
  const requestMicrophonePermission = async (): Promise<boolean> => {
    setRecordingState(RecordingState.REQUESTING_PERMISSION);
    const stream = await getMediaStream();
    if (stream) {
      // 권한 획득에 성공하면, 실제 녹음 시작 전까지 스트림을 사용하지 않으므로 트랙을 중지합니다.
      // 이렇게 하면 브라우저에서 마이크 사용 표시등이 즉시 꺼집니다.
      stream.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null; // 스트림 참조도 초기화
      setRecordingState(RecordingState.IDLE); // 권한 확인 후 다시 대기 상태로 변경
      return true;
    }
    // getMediaStream 내부에서 RecordingState.ERROR로 설정됨
    return false;
  };

  /**
   * 녹음을 시작합니다.
   * 마이크 권한을 요청하고, `extendable-media-recorder`를 사용하여 WAV 형식으로 녹음을 설정합니다.
   * @async
   */
  const startRecording = async (): Promise<void> => {
    // 이전 녹음 관련 상태 및 데이터 초기화
    resetSTTState();
    cleanupRecorder(); // 이전 리소스 정리 (특히 mediaStreamRef)
    setRecordingState(RecordingState.REQUESTING_PERMISSION);

    if (typeof window === 'undefined' || !symptômesWavEncoderRegistered) {
      setErrorMessage('음성 녹음 기능이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
      setRecordingState(RecordingState.ERROR);
      console.warn('WAV encoder not registered yet. Cannot start recording.');
      return;
    }

    const stream = await getMediaStream();
    if (!stream) {
      // getMediaStream 내부에서 에러 상태를 처리하므로, 여기서는 추가 작업 없이 반환합니다.
      return;
    }

    try {
      setRecordingState(RecordingState.RECORDING);
      // MediaRecorder 인스턴스를 생성합니다.
      // extendable-media-recorder-wav-encoder가 등록되어 있다면,
      // mimeType: 'audio/wav'로 설정하여 WAV 형식으로 직접 녹음합니다.
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: RECORDING_MIME_TYPE }) as any;
      audioChunksRef.current = []; // 녹음 데이터 청크를 저장할 배열 초기화

      /**
       * MediaRecorder에서 'dataavailable' 이벤트 발생 시 호출될 핸들러입니다.
       * 녹음 중 생성되는 오디오 데이터 청크를 audioChunksRef 배열에 추가합니다.
       * @param {BlobEvent} event - 데이터 청크를 포함하는 BlobEvent 객체입니다.
       */
      const currentRecorder = mediaRecorderRef.current;
      if (!currentRecorder) {
        // 이 경우는 거의 발생하지 않지만, 타입 안정성을 위해 추가
        setErrorMessage('MediaRecorder 초기화에 실패했습니다.');
        setRecordingState(RecordingState.ERROR);
        cleanupRecorder();
        return;
      }

      currentRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      /**
       * MediaRecorder에서 'stop' 이벤트 발생 시 호출될 핸들러입니다.
       * 녹음이 중지되면, 수집된 오디오 청크들을 합쳐 하나의 WAV Blob 객체를 생성합니다.
       * 생성된 Blob과 녹음 상태를 Zustand 스토어에 업데이트합니다.
       * 모든 녹음 관련 리소스를 정리합니다.
       */
      currentRecorder.onstop = () => {
        // 녹음된 오디오 청크가 없는 경우 에러 처리
        if (audioChunksRef.current.length === 0) {
          console.warn('[useAudioRecording] No audio chunks recorded after stop.');
          setErrorMessage('녹음된 오디오 데이터가 없습니다. 마이크를 확인해주세요.');
          setRecordingState(RecordingState.ERROR);
          cleanupRecorder(); // 리소스 정리
          return;
        }

        // 수집된 오디오 청크들을 사용하여 'audio/wav' 타입의 Blob 객체를 생성합니다.
        const audioBlob = new Blob(audioChunksRef.current, { type: RECORDING_MIME_TYPE });
        console.log('[useAudioRecording] WAV Blob created:', audioBlob, 'size:', audioBlob.size);

        // 생성된 Blob의 크기가 0인 경우 (매우 드물지만) 에러 처리
        if (audioBlob.size === 0) {
          console.warn('[useAudioRecording] Audio blob size is 0.');
          setErrorMessage('녹음된 오디오 파일의 크기가 0입니다. 다시 시도해주세요.');
          setRecordingState(RecordingState.ERROR);
          setAudioBlob(null); // 스토어의 Blob도 null로 설정
          cleanupRecorder(); // 리소스 정리
          return;
        }

        setAudioBlob(audioBlob); // 스토어에 최종 WAV Blob 저장
        setRecordingState(RecordingState.STOPPED); // 녹음 완료 및 STT 대기 상태로 변경

        // 녹음이 정상적으로 완료되고 Blob이 생성된 후 리소스 정리
        cleanupRecorder();
      };

      /**
       * MediaRecorder에서 'error' 이벤트 발생 시 호출될 핸들러입니다.
       * 녹음 중 에러 발생 시 상태를 업데이트하고 리소스를 정리합니다.
       * @param {Event} event - 에러 이벤트 객체입니다. (MediaRecorderErrorEvent 타입 단언 가능)
       */
      currentRecorder.onerror = (event: Event) => {
        // MediaRecorderErrorEvent 대신 ErrorEvent 또는 Event를 사용하거나, 필요한 경우 as any로 캐스팅합니다.
        const error = (event as any).error || event; // 더 일반적인 오류 객체 접근 시도
        console.error('MediaRecorder 에러:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 녹음 오류';
        setErrorMessage(`녹음 중 오류가 발생했습니다: ${errorMessage}`); // 백틱 확인
        setRecordingState(RecordingState.ERROR);
        cleanupRecorder(); // 에러 발생 시 모든 리소스 정리
      };

      // 녹음 시작
      currentRecorder.start();
      console.log('[useAudioRecording] Recording started with MIME type:', RECORDING_MIME_TYPE);

      // 최대 녹음 시간 타이머 설정
      recordingTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('최대 녹음 시간(1분) 초과로 자동 중지됩니다.');
          stopRecording(); // 내부적으로 onstop 핸들러 호출
        }
      }, MAX_RECORDING_TIME_MS);
    } catch (err) {
      console.error('녹음 시작 중 예외 발생:', err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      setErrorMessage(`녹음을 시작할 수 없습니다: ${errorMessage}`); // 백틱 확인
      setRecordingState(RecordingState.ERROR);
      cleanupRecorder(); // 예외 발생 시 모든 리소스 정리
    }
  };

  /**
   * 진행 중인 녹음을 중지합니다.
   * MediaRecorder의 상태가 'recording'일 경우에만 stop() 메소드를 호출합니다.
   * 녹음 중지 시 onstop 핸들러가 자동으로 호출되어 후속 처리를 수행합니다.
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('[useAudioRecording] stopRecording called. Current state: recording. Stopping recorder...');
      mediaRecorderRef.current.stop(); // 이 호출로 인해 onstop 이벤트 핸들러가 트리거됩니다.
      // 주의: 여기서 cleanupRecorder를 직접 호출하면 onstop 핸들러와 정리 로직이 중복되거나
      // Blob 생성이 완료되기 전에 리소스가 정리될 수 있습니다.
      // cleanupRecorder는 onstop 핸들러 내부 또는 onerror 핸들러 내부에서 호출하는 것이 안전합니다.
    } else {
      console.warn(
        '[useAudioRecording] stopRecording called but not in recording state or mediaRecorder not ready. State:',
        mediaRecorderRef.current?.state
      );
      // 이미 중지되었거나 녹음 중이 아닐 때는 추가적인 cleanup이 필요 없을 수 있지만,
      // 만약을 위해 현재 상태를 확인하고 필요시 정리 로직을 호출할 수 있습니다.
      // cleanupRecorder(); // 상태에 따라 선택적으로 호출
    }
  }, [cleanupRecorder]); // cleanupRecorder를 의존성 배열에 추가했지만, cleanupRecorder 자체는 불변

  // 컴포넌트 언마운트 시 남아있을 수 있는 녹음 관련 리소스 정리
  useEffect(() => {
    return () => {
      console.log('[useAudioRecording] Unmounting. Cleaning up recorder resources.');
      cleanupRecorder();
    };
  }, [cleanupRecorder]);

  return { startRecording, stopRecording, requestMicrophonePermission };
};
