import { create } from 'zustand';

interface SettingsState {
  darkMode: boolean;
  alarmOn: boolean;
  botPersonality: string;
  botImage: string;
  setDarkMode: (value: boolean) => void;
  setAlarmOn: (value: boolean) => void;
  setBotPersonality: (value: string) => void;
  setBotImage: (value: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  darkMode: false,
  alarmOn: true,
  botPersonality: 'friendly',
  botImage: '/damdami.png',
  setDarkMode: (value) => set({ darkMode: value }),
  setAlarmOn: (value) => set({ alarmOn: value }),
  setBotPersonality: (value) => set({ botPersonality: value }),
  setBotImage: (value) => set({ botImage: value }),
}));
