// 타입 정의
export type SurveyCategory = 'depression' | 'anxiety' | 'stress' | 'stressReason';

export interface SurveyQuestion {
  id: string;
  text: string;
  reverse?: boolean; // 역점수 여부
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
  stressReason: string; // 스트레스 요인 텍스트
}

// 카테고리별 점수 합산 함수
export function getCategoryScore(
  category: Exclude<SurveyCategory, 'stressReason'>,
  answers: number[][],
  sections: SurveySection[]
): number {
  const section = sections.find((s) => s.category === category);
  if (!section) return 0;

  const maxScore = Math.max(...section.options.map((opt) => opt.value));

  return (
    answers[sections.indexOf(section)]?.reduce((sum, value, qIdx) => {
      const question = section.questions[qIdx];
      const adjustedValue = question?.reverse ? maxScore - value : value;
      return sum + (adjustedValue ?? 0);
    }, 0) ?? 0
  );
}

// 우울 9번 문항(자살 위험) 체크 함수
export function checkSuicideRisk(answers: number[][], sections: SurveySection[]): boolean {
  const depressionIdx = sections.findIndex((s) => s.category === 'depression');
  const lastIdx = sections[depressionIdx].questions.length - 1;
  return (answers[depressionIdx]?.[lastIdx] ?? 0) > 0;
}

// 설문 전체 결과 가공 함수 (API 전송용)
export function generateSurveyResult(
  answers: number[][],
  sections: SurveySection[],
  stressReason: string
): SurveyResult {
  return {
    depression: getCategoryScore('depression', answers, sections),
    anxiety: getCategoryScore('anxiety', answers, sections),
    stress: getCategoryScore('stress', answers, sections),
    isSuicidal: checkSuicideRisk(answers, sections),
    stressReason: stressReason || '',
  };
}
