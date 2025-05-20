import { create } from 'zustand';

export interface AppSetupState {
  isSocketConnected: boolean;
  setIsSocketConnected: (isConnected: boolean) => void;
  isWavEncoderReady: boolean; // WAV 인코더 준비 상태
  setWavEncoderReady: (isReady: boolean) => void; // WAV 인코더 준비 상태 설정 함수
}

/**
 * Zustand 스토어를 생성합니다.
 * 이 스토어는 애플리케이션 설정과 관련된 상태를 관리합니다.
 */
export const useAppSetupStore = create<AppSetupState>((set) => ({
  isSocketConnected: false,
  setIsSocketConnected: (isConnected) => set({ isSocketConnected: isConnected }),
  isWavEncoderReady: true, // 초기값을 true로 변경하여 AudioEncoderInitializer 의존성 임시 제거
  setWavEncoderReady: (isReady) => set({ isWavEncoderReady: isReady }),
}));
