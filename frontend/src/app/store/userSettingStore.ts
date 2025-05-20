import { create } from 'zustand';

interface SettingsState {
  nickname: string;
  email: string;
  isDarkmode: boolean;
  isAlarm: boolean;
  botCustom: string;
  botImageUrl: string; // 서버에서 받은 이미지 URL
  botImageFile: File | null; // 업로드용 이미지 파일

  setNickname: (value: string) => void;
  setEmail: (value: string) => void;
  setIsDarkmode: (value: boolean) => void;
  setIsAlarm: (value: boolean) => void;
  setBotCustom: (value: string) => void;
  setBotImageUrl: (value: string) => void;
  setBotImageFile: (file: File | null) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  nickname: '',
  email: '',
  isDarkmode: false,
  isAlarm: true,
  botCustom: 'friendly',
  botImageUrl: '/damdami.png',
  botImageFile: null,

  setNickname: (value) => set({ nickname: value }),
  setEmail: (value) => set({ email: value }),
  setIsDarkmode: (value) => set({ isDarkmode: value }),
  setIsAlarm: (value) => set({ isAlarm: value }),
  setBotCustom: (value) => set({ botCustom: value }),
  setBotImageUrl: (value) => set({ botImageUrl: value }),
  setBotImageFile: (file) => set({ botImageFile: file }),
}));
