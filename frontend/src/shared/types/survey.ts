// 타입 정의
export type SurveyCategory = 'depression' | 'anxiety' | 'stress';

export interface SurveyQuestion {
  id: string;
  text: string;
}

export interface SurveySection {
  category: SurveyCategory;
  description: string;
  options: { value: number; label: string }[];
  questions: SurveyQuestion[];
}

// 설문 결과 타입 (usersurvey 테이블 구조 기반)
export interface SurveyResult {
  depression: number; // 우울 점수 합계
  anxiety: number; // 불안 점수 합계
  stress: number; // 스트레스 점수 합계
  isSuicidal: boolean; // 우울 9번 문항 0 초과 여부
}

// 카테고리별 점수 합산 함수
export function getCategoryScore(category: SurveyCategory, answers: number[][], sections: SurveySection[]): number {
  const idx = sections.findIndex((s) => s.category === category);
  return answers[idx]?.reduce((sum, v) => sum + (v ?? 0), 0) ?? 0;
}

// 우울 9번 문항(자살 위험) 체크 함수
export function checkSuicideRisk(answers: number[][], sections: SurveySection[]): boolean {
  const depressionIdx = sections.findIndex((s) => s.category === 'depression');
  const lastIdx = sections[depressionIdx].questions.length - 1;
  return (answers[depressionIdx]?.[lastIdx] ?? 0) > 0;
}

// 설문 전체 결과 가공 함수 (API 전송용)
export function generateSurveyResult(answers: number[][], sections: SurveySection[]): SurveyResult {
  return {
    depression: getCategoryScore('depression', answers, sections),
    anxiety: getCategoryScore('anxiety', answers, sections),
    stress: getCategoryScore('stress', answers, sections),
    isSuicidal: checkSuicideRisk(answers, sections),
  };
}
