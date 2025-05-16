import axiosInstance from '@/shared/api/axiosInstance';
import { Report, ReportDetail } from './types';

// 전체 레포트 조회 (초기용)
export async function getAllReports(): Promise<Report[]> {
  const res = await axiosInstance.get(`/reports?category=전체&start=&end=&keyword=&page=1`);
  return res.data;
}
// 특정 날짜의 레포트 목록 조회
export async function getReportsByDate(date: string): Promise<Report[]> {
  const res = await axiosInstance.get(`/reports?category=SESSION&start=${date}&end=${date}&keyword=&page=1`);
  return res.data;
}

// 레포트가 있는 날짜 목록 조회
export async function getReportDates(month: string): Promise<string[]> {
  const res = await axiosInstance.get(`/reports/dates?month=${month}`);
  return res.data; // ["2025-05-13", "2025-05-15", ...]
}

// 레포트 상세 조회
export async function getReportDetail(reportId: string): Promise<ReportDetail> {
  const res = await axiosInstance.get(`/reports/${reportId}`);
  return res.data;
}
