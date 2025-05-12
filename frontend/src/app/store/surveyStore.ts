import { create } from 'zustand';

interface SurveyAnswers {
  answers: number[][]; // [스텝][문항] = 점수 형태로 저장
  setAnswer: (stepIdx: number, qIdx: number, value: number) => void;
  reset: () => void;
}

export const useSurveyStore = create<SurveyAnswers>((set) => ({
  answers: [[], [], []], // 스텝 수만큼 초기화
  setAnswer: (stepIdx, qIdx, value) =>
    set((state) => {
      const newAnswers = state.answers.map((arr) => [...arr]);
      newAnswers[stepIdx][qIdx] = value;
      return { answers: newAnswers };
    }),
  reset: () => set({ answers: [[], [], []] }),
}));
