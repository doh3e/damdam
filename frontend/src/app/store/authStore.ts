import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  token: string | null; // JWT 등 인증 토큰
  setToken: (token: string) => void; // 토큰 저장 함수
  clearToken: () => void; // 토큰 삭제 함수
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }), // 로그인 성공 시 토큰 저장
      clearToken: () => set({ token: null }), // 로그아웃 시 토큰 삭제
    }),
    { name: 'auth-store', storage: createJSONStorage(() => localStorage) }
  )
);
