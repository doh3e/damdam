export interface Report {
  userId: number;
  nickname: string;
  counsId: number;
  counsTitle: string;
  summary: string;
  analyze: string;
  valence: string;
  arousal: string;
  createdAt: string;
  sreportId: number;
  sreportTitle: string;
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
