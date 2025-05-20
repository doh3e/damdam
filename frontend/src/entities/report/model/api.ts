import type { SessionReport, PeriodReport } from './types';
import { apiClient } from '@/shared/api';

interface GetReportsParams {
  category: 'session' | 'period';
  start?: string;
  end?: string;
  keyword?: string;
}

export async function getReports({ category, start, end, keyword }: GetReportsParams) {
  const searchParams = new URLSearchParams({
    category,
    ...(start ? { start } : {}),
    ...(end ? { end } : {}),
    ...(keyword ? { keyword } : {}),
  });

  const res = await fetch(`/api/reports?${searchParams.toString()}`);
  if (!res.ok) throw new Error('레포트 불러오기 실패');

  return res.json() as Promise<SessionReport[] | PeriodReport[]>;
}

// getReportDetail
export const getReportDetail = async (reportId: string): Promise<Report> => {
  return apiClient.get<Report>(`/reports/${reportId}`);
};

// getReportDates (예시)
export const getReportDates = async (): Promise<string[]> => {
  return apiClient.get<string[]>('/reports/dates');
};
