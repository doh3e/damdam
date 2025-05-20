// 상담별 레포트
export interface SessionReport {
  sReportId: number;
  counsId: number;
  sReportTitle: string;
  createdAt: string;
}

// 기간별 레포트
export interface PeriodReport {
  pReportId: number;
  pReportTitle: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  time: string;
}

export interface ReportDetail {
  id: string;
  date: string;
  time: string;
  valence: number;
  arousal: number;
  emotionTrend: number[];
  summary: string;
  analyze: string;
  keywords: string[];
  chat: ChatMessage[];
}
