import { create } from 'zustand';

interface AppSetupState {
  isWavEncoderReady: boolean;
  setWavEncoderReady: (isReady: boolean) => void;
}

export const useAppSetupStore = create<AppSetupState>((set) => ({
  isWavEncoderReady: false, // 초기값은 false
  setWavEncoderReady: (isReady) => set({ isWavEncoderReady: isReady }),
}));
