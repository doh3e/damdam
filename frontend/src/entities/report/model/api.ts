import { apiClient } from '@/shared/api/axiosInstance';
import type { Report } from './types';

export const getReports = async ({
  category,
  start,
  end,
  keyword,
}: {
  category: '상담별' | '기간별';
  start?: string;
  end?: string;
  keyword?: string;
}): Promise<Report[]> => {
  return apiClient.get<Report[]>('/api/v1/damdam/reports', {
    category,
    start,
    end,
    keyword,
  });
};

export const getReportDetail = async (reportId: string): Promise<Report> => {
  return apiClient.get<Report>(`reports/${reportId}`);
};
