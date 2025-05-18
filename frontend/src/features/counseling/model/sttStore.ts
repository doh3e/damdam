/**
 * @file frontend/src/features/counseling/model/sttStore.ts
 * @description STT(Speech-to-Text) 기능과 관련된 상태를 관리하는 Zustand 스토어입니다.
 */
import { create } from 'zustand';

/**
 * @enum RecordingState
 * @description 녹음 기능의 현재 상태를 나타내는 열거형입니다.
 * - IDLE: 기본 상태, 녹음 준비 완료 또는 녹음하지 않음.
 * - REQUESTING_PERMISSION: 마이크 권한 요청 중.
 * - RECORDING: 현재 음성 녹음 중.
 * - STOPPED: 녹음이 중지되었으나 아직 처리(STT 변환 등)가 시작되지 않음.
 * - PROCESSING_STT: 녹음된 오디오를 STT로 변환 중.
 * - ERROR: 녹음 또는 STT 처리 중 오류 발생.
 */
export enum RecordingState {
  IDLE = 'IDLE',
  REQUESTING_PERMISSION = 'REQUESTING_PERMISSION',
  RECORDING = 'RECORDING',
  STOPPED = 'STOPPED',
  PROCESSING_STT = 'PROCESSING_STT',
  ERROR = 'ERROR',
}

/**
 * @interface STTState
 * @description STT 스토어의 상태를 정의하는 인터페이스입니다.
 * @property {RecordingState} recordingState - 현재 녹음/STT 상태.
 * @property {Blob | null} audioBlob - 녹음된 오디오 데이터 Blob 객체.
 * @property {string} sttResultText - STT 변환 결과 텍스트.
 * @property {string | null} errorMessage - 오류 발생 시 오류 메시지.
 * @property {number | null} messageOrderForAudio - 현재 녹음/STT 중인 메시지의 순서 (음성 파일 저장 시 필요).
 */
interface STTState {
  recordingState: RecordingState;
  audioBlob: Blob | null;
  sttResultText: string;
  errorMessage: string | null;
  messageOrderForAudio: number | null;
}

/**
 * @interface STTActions
 * @description STT 스토어의 액션을 정의하는 인터페이스입니다.
 * @property {(state: RecordingState) => void} setRecordingState - 녹음 상태를 설정합니다.
 * @property {(blob: Blob | null) => void} setAudioBlob - 녹음된 오디오 Blob을 설정합니다.
 * @property {(text: string) => void} setSttResultText - STT 변환 결과 텍스트를 설정합니다.
 * @property {(message: string | null) => void} setErrorMessage - 오류 메시지를 설정합니다.
 * @property {(order: number | null) => void} setMessageOrderForAudio - 현재 오디오의 메시지 순서를 설정합니다.
 * @property {() => void} resetSTTState - STT 관련 모든 상태를 초기값으로 리셋합니다.
 */
interface STTActions {
  setRecordingState: (state: RecordingState) => void;
  setAudioBlob: (blob: Blob | null) => void;
  setSttResultText: (text: string) => void;
  setErrorMessage: (message: string | null) => void;
  setMessageOrderForAudio: (order: number | null) => void;
  resetSTTState: () => void;
}

// 초기 상태 값
const initialState: STTState = {
  recordingState: RecordingState.IDLE,
  audioBlob: null,
  sttResultText: '',
  errorMessage: null,
  messageOrderForAudio: null,
};

/**
 * STT 기능을 위한 Zustand 스토어 훅.
 * 상태와 액션을 포함합니다.
 * @returns {STTState & STTActions} STT 스토어 상태 및 액션
 */
export const useSTTStore = create<STTState & STTActions>((set) => ({
  ...initialState,
  setRecordingState: (state) => set({ recordingState: state }),
  setAudioBlob: (blob) => set({ audioBlob: blob }),
  setSttResultText: (text) => set({ sttResultText: text }),
  setErrorMessage: (message) => set({ errorMessage: message }),
  setMessageOrderForAudio: (order) => set({ messageOrderForAudio: order }),
  resetSTTState: () => set(initialState),
}));
