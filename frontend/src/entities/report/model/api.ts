import type { SessionReport, PeriodReport, ReportDetailResponse } from './types';
import { apiClient } from '@/shared/api';

interface GetReportsParams {
  category: 'session' | 'period';
  start?: string;
  end?: string;
  keyword?: string;
}

// 레포트 목록 조회
export async function getReports({ category, start, end, keyword }: GetReportsParams) {
  const params = {
    category,
    ...(start && { start }),
    ...(end && { end }),
    ...(keyword && { keyword }),
  };

  return apiClient.get<SessionReport[] | PeriodReport[]>('/reports', params);
}

// 레포트 상세 조회
export const getReportDetail = async (reportId: string): Promise<ReportDetailResponse> => {
  return apiClient.get(`/reports/${reportId}`);
};

// 레포트 제목 수정 (PATCH)
export const updateReportTitle = async (reportId: number, sReportTitle: string): Promise<void> => {
  return apiClient.patch<{}, void>(`reports/${reportId}?sReportTitle=${encodeURIComponent(sReportTitle)}`, {});
};

// 레포트 삭제 (DELETE)
export const deleteReport = async (reportId: number): Promise<void> => {
  return apiClient.delete<void>(`reports/${reportId}`);
};
