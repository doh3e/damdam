// 상담별 레포트
export interface SessionReport {
  sreportId: number;
  counsId: number;
  sreportTitle: string;
  createdAt: string;
}

// 기간별 레포트
export interface PeriodReport {
  preportId: number;
  preportTitle: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  time: string;
}

export interface ReportDetailResponse {
  userId: number;
  nickname: string;
  counsId: number;
  counsTitle: string;
  summary: string;
  analyze: string;
  valence: string; // e.g., 'neutral'
  arousal: string; // e.g., 'low'
  createdAt: string;
  sreportId: number;
  sreportTitle: string;
  emotionList: {
    timestamp: string;
    messageOrder: number;
    emotion: {
      happiness: number;
      sadness: number;
      angry: number;
      neutral: number;
      other: number;
    };
  }[];
}

export interface PeriodReportCreateRequest {
  startDate: string;
  endDate: string;
}

export interface PeriodReportCreateResponse {
  preportId: number;
}

export interface PeriodReportDetail {
  preportId: number;
  preportTitle: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  counselTime: number;
  advice: string;
  compliment: string;
  summary: string;
  worry: string;
  counselings: {
    counsId: number;
    counsTitle: string;
    createdAt: string;
    updatedAt: string;
    isClosed: boolean;
  }[];
}
