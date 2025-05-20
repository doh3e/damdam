// 성별 Enum
export enum Gender {
  UNKNOWN = 'UNKNOWN',
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

// 연령대 Enum
export enum Age {
  UNKNOWN = 'UNKNOWN',
  UNDER_TEN = 'UNDER_TEN',
  TEENS = 'TEENS',
  TWENTIES = 'TWENTIES',
  THIRTIES = 'THIRTIES',
  FORTIES = 'FORTIES',
  FIFTIES = 'FIFTIES',
  SIXTIES = 'SIXTIES',
  SEVENTIES = 'SEVENTIES',
  EIGHTIES = 'EIGHTIES',
  NINETIES = 'NINETIES',
  HUNDRED_UP = 'HUNDRED_UP',
}

// MBTI Enum
export enum MBTI {
  UNKNOWN = 'UNKNOWN',
  ISTJ = 'ISTJ',
  ISTP = 'ISTP',
  ISFJ = 'ISFJ',
  ISFP = 'ISFP',
  INTJ = 'INTJ',
  INTP = 'INTP',
  INFJ = 'INFJ',
  INFP = 'INFP',
  ESTP = 'ESTP',
  ESFP = 'ESFP',
  ENFP = 'ENFP',
  ENTP = 'ENTP',
  ESTJ = 'ESTJ',
  ESFJ = 'ESFJ',
  ENFJ = 'ENFJ',
  ENTJ = 'ENTJ',
}

// 사용자 표시용 라벨 (같은 파일에 함께 정의)
export const GenderLabel: Record<Gender, string> = {
  [Gender.UNKNOWN]: '선택 안함',
  [Gender.MALE]: '남성',
  [Gender.FEMALE]: '여성',
  [Gender.OTHER]: '기타',
};

export const AgeLabel: Record<Age, string> = {
  [Age.UNKNOWN]: '선택 안함',
  [Age.UNDER_TEN]: '10세 이하',
  [Age.TEENS]: '10대',
  [Age.TWENTIES]: '20대',
  [Age.THIRTIES]: '30대',
  [Age.FORTIES]: '40대',
  [Age.FIFTIES]: '50대',
  [Age.SIXTIES]: '60대',
  [Age.SEVENTIES]: '70대',
  [Age.EIGHTIES]: '80대',
  [Age.NINETIES]: '90대',
  [Age.HUNDRED_UP]: '100세 이상',
};

export const MBTILabel: Record<MBTI, string> = {
  [MBTI.UNKNOWN]: '선택 안함',
  [MBTI.ISTJ]: 'ISTJ',
  [MBTI.ISTP]: 'ISTP',
  [MBTI.ISFJ]: 'ISFJ',
  [MBTI.ISFP]: 'ISFP',
  [MBTI.INTJ]: 'INTJ',
  [MBTI.INTP]: 'INTP',
  [MBTI.INFJ]: 'INFJ',
  [MBTI.INFP]: 'INFP',
  [MBTI.ESTP]: 'ESTP',
  [MBTI.ESFP]: 'ESFP',
  [MBTI.ENFP]: 'ENFP',
  [MBTI.ENTP]: 'ENTP',
  [MBTI.ESTJ]: 'ESTJ',
  [MBTI.ESFJ]: 'ESFJ',
  [MBTI.ENFJ]: 'ENFJ',
  [MBTI.ENTJ]: 'ENTJ',
};
