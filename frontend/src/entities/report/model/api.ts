import type { SessionReport, PeriodReport } from './types';
import { apiClient } from '@/shared/api';

interface GetReportsParams {
  category: 'session' | 'period';
  start?: string;
  end?: string;
  keyword?: string;
}

export async function getReports({ category, start, end, keyword }: GetReportsParams) {
  const params = {
    category,
    ...(start && { start }),
    ...(end && { end }),
    ...(keyword && { keyword }),
  };

  return apiClient.get<SessionReport[] | PeriodReport[]>('/reports', params);
}

// getReportDetail
import { ReportDetailResponse } from './types';

export const getReportDetail = async (reportId: string): Promise<ReportDetailResponse> => {
  return apiClient.get(`/reports/${reportId}`);
};

// getReportDates (예시)
// export const getReportDates = async (): Promise<string[]> => {
//   return apiClient.get<string[]>('/reports/dates');
// };
