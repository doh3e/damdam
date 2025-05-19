import { SurveySection } from '@/shared/types/survey';

// 평가 항목: 우울 (PHQ-9)
export const depressionSection: SurveySection = {
  category: 'depression',
  description:
    '📝 <span class="text-orange-500 font-bold">최근 2주간</span> 동안 다음의 문제들로 얼마나 자주 방해를 받았나요?',
  options: [
    { value: 0, label: '전혀없음' },
    { value: 1, label: '며칠간' },
    { value: 2, label: '1주 이상' },
    { value: 3, label: '거의 매일' },
  ],
  questions: [
    { id: 'depression-1', text: '일 또는 여가 활동을 하는 데 흥미나 즐거움을 느끼지 못함' },
    { id: 'depression-2', text: '기분이 가라앉거나, 우울하거나, 희망이 없음' },
    { id: 'depression-3', text: '잠이 들거나 계속 잠을 자는 것이 어려움, 또는 잠을 너무 많이 잠' },
    { id: 'depression-4', text: '피곤하다고 느끼거나 기운이 거의 없음' },
    { id: 'depression-5', text: '입맛이 없거나 과식을 함' },
    { id: 'depression-6', text: '자신을 부정적으로 봄 – 혹은 자신이 실패자라고 느끼거나 자신 또는 가족을 실망시킴' },
    { id: 'depression-7', text: '신문을 읽거나 텔레비전 보는 것과 같은 일에 집중하는 것이 어려움' },
    {
      id: 'depression-8',
      text: '다른 사람들이 주목할 정도로 너무 느리게 움직이거나 말을 함. 또는 반대로 평상시보다 많이 움직여서 너무 안절부절 못하거나 들떠 있음',
    },
    { id: 'depression-9', text: '자신이 죽는 것이 더 낫다고 생각하거나, 어떤 식으로든 자신을 해칠 것이라고 생각함' },
  ],
};

// 평가 항목: 불안 (GAD-7)
export const anxietySection: SurveySection = {
  category: 'anxiety',
  description:
    '📝 <span class="text-orange-500 font-bold">최근 2주간</span> 동안 다음의 문제들로 얼마나 자주 방해를 받았나요?',
  options: [
    { value: 0, label: '전혀없음' },
    { value: 1, label: '며칠간' },
    { value: 2, label: '1주 이상' },
    { value: 3, label: '거의 매일' },
  ],
  questions: [
    { id: 'anxiety-1', text: '초조하거나 불안하거나 조마조마하게 느낀다' },
    { id: 'anxiety-2', text: '걱정하는 것을 멈추거나 조절할 수가 없다' },
    { id: 'anxiety-3', text: '여러 가지 것들에 대해 걱정을 너무 많이 한다' },
    { id: 'anxiety-4', text: '편하게 있기가 어렵다' },
    { id: 'anxiety-5', text: '너무 안절부절못해서 가만히 있기가 힘들다' },
    { id: 'anxiety-6', text: '쉽게 짜증이 나거나 쉽게 성을 내게 된다' },
    { id: 'anxiety-7', text: '마치 끔찍한 일이 생길 것처럼 두렵게 느껴진다' },
  ],
};

// 평가 항목: 스트레스 (PSS)
export const stressSection: SurveySection = {
  category: 'stress',
  description:
    '📝 <span class="text-orange-500 font-bold">지난 30일</span> 동안 들었던 기분이나 생각에 대해 여쭤볼게요!',
  options: [
    { value: 0, label: '전혀 없음' },
    { value: 1, label: '거의 없음' },
    { value: 2, label: '가끔' },
    { value: 3, label: '자주' },
    { value: 4, label: '매우 자주' },
  ],
  questions: [
    { id: 'stress-1', text: '예상치 못한 일이 발생하여 기분이 좋지 않았던 적이 얼마나 있었나요?' },
    { id: 'stress-2', text: '살면서 중요한 일들을 뜻대로 하지 못한다고 느꼈던 적이 얼마나 있었나요?' },
    { id: 'stress-3', text: '불안하고 "스트레스를 받았던" 적이 얼마나 있었나요?' },
    {
      id: 'stress-4',
      reverse: true,
      text: '개인적인 문제들을 처리하는 능력에 대해 자신감이 있었던 적이 얼마나 있었나요?',
    },
    { id: 'stress-5', reverse: true, text: '일이 뜻대로 풀리는 것 같았던 적이 얼마나 있었나요?' },
    { id: 'stress-6', text: '해야 하는 모든 일에 대처할 수 없었던 적이 얼마나 있었나요?' },
    { id: 'stress-7', reverse: true, text: '생활에서 짜증을 조절할 수 있었던 적이 얼마나 있었나요?' },
    { id: 'stress-8', reverse: true, text: '자신이 모든 상황을 잘 통제하고 있다고 느꼈던 적이 얼마나 있었나요?' },
    { id: 'stress-9', text: '자신이 통제할 수 없는 일 때문에 화가 났던 적이 얼마나 있었나요?' },
    { id: 'stress-10', text: '힘든 일이 너무 많아져서 해결할 수 없을 것 같았던 적이 얼마나 있었나요?' },
  ],
};

// 평가 항목: 스트레스 요인
export const stressReasonSection: SurveySection = {
  category: 'stressReason',
  description: '💬 <span class="text-orange-500 font-bold">요즘 신경 쓰이는 일</span>이나 생각들이 있다면 나눠볼래요?',
  options: [],
  questions: [],
};

export const surveySections: SurveySection[] = [depressionSection, anxietySection, stressSection, stressReasonSection];
