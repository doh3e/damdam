export interface Report {
  id: string;
  date: string;
  time: string;
  summary: string;
  keywords: string[];
}

export interface ReportDetail {
  id: string;
  date: string;
  time: string;
  summary: string;
  analyze: string;
  valence: number; // -1(부정) ~ 1(긍정)
  arousal: number; // -1(저각성) ~ 1(고각성)
  emotionTrend: number[];
  keywords: string[];
  chat: ChatMessage[];
}

export interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
  time: string;
}
