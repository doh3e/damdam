import { create } from 'zustand';

export interface AppSetupState {
  isSocketConnected: boolean;
  setIsSocketConnected: (isConnected: boolean) => void;
}

/**
 * Zustand 스토어를 생성합니다.
 * 이 스토어는 애플리케이션 설정과 관련된 상태를 관리합니다.
 */
export const useAppSetupStore = create<AppSetupState>((set) => ({
  isSocketConnected: false,
  setIsSocketConnected: (isConnected) => set({ isSocketConnected: isConnected }),
}));
