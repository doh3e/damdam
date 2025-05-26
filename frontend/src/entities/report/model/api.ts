import { apiClient } from '@/shared/api';
import type {
  SessionReport,
  PeriodReport,
  ReportDetailResponse,
  PeriodReportCreateRequest,
  PeriodReportCreateResponse,
  PeriodReportDetail,
} from './types';

interface GetReportsParams {
  category: 'session' | 'period';
  start?: string;
  end?: string;
  keyword?: string;
}

// 세션 레포트 목록 조회
export async function getReports({ category, start, end, keyword }: GetReportsParams) {
  const params = {
    category,
    ...(start && { start }),
    ...(end && { end }),
    ...(keyword && { keyword }),
  };

  return apiClient.get<SessionReport[] | PeriodReport[]>('/reports', params);
}

// 세션 레포트 상세 조회
export const getReportDetail = async (reportId: string): Promise<ReportDetailResponse> => {
  return apiClient.get(`/reports/${reportId}`);
};

// 세션 레포트 제목 수정 (PATCH)
export const updateReportTitle = async (reportId: number, sReportTitle: string): Promise<void> => {
  return apiClient.patch<{}, void>(`reports/${reportId}?sReportTitle=${encodeURIComponent(sReportTitle)}`, {});
};

// 세션 레포트 삭제 (DELETE)
export const deleteReport = async (reportId: number): Promise<void> => {
  return apiClient.delete<void>(`reports/${reportId}`);
};

// 기간별 레포트 생성
export const createPeriodicReport = async (body: PeriodReportCreateRequest): Promise<PeriodReportCreateResponse> => {
  return apiClient.post<PeriodReportCreateRequest, PeriodReportCreateResponse>('/reports/periodic', body);
};

// 기간별 레포트 상세 조회
export const getPeriodicReportDetail = async (preportId: number): Promise<PeriodReportDetail> => {
  return apiClient.get<PeriodReportDetail>(`/reports/periodic/${preportId}`);
};

// 기간별 레포트 제목 수정
export const updatePeriodicReportTitle = async (preportId: number, title: string): Promise<void> => {
  return apiClient.patch<{}, void>(`/reports/periodic/${preportId}?pReportTitle=${encodeURIComponent(title)}`, {});
};

// 기간별 레포트 삭제
export const deletePeriodicReport = async (preportId: number): Promise<void> => {
  return apiClient.delete<void>(`/reports/periodic/${preportId}`);
};
