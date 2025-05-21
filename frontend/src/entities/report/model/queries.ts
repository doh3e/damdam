/**
 * @file entities/report/model/queries.ts
 * 레포트(Report) 엔티티 관련 데이터 조회를 위한 Tanstack Query 훅을 정의합니다.
 */
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getReports, getPeriodicReportDetail } from './api';
import type { SessionReport, PeriodReport, PeriodReportDetail } from './types';

// 쿼리 키를 정의합니다.
export const reportQueryKeys = {
  all: ['reports'] as const,
  lists: () => [...reportQueryKeys.all, 'list'] as const,
  list: (params: { category: 'session' | 'period'; start?: string; end?: string; keyword?: string }) =>
    [...reportQueryKeys.lists(), params] as const,
  details: () => [...reportQueryKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...reportQueryKeys.details(), id] as const,
  periodicDetail: (id: number) => [...reportQueryKeys.details(), 'periodic', id] as const,
};

// API 요청 파라미터 타입을 api.ts에서 가져오거나 여기서 다시 정의합니다.
interface GetReportsParams {
  category: 'session' | 'period';
  start?: string;
  end?: string;
  keyword?: string;
}

/**
 * 레포트 목록을 조회하는 Tanstack Query 훅입니다.
 * 세션 레포트 또는 기간별 레포트 목록을 가져올 수 있습니다.
 *
 * @param {GetReportsParams} params - API 요청 파라미터 (category, start, end, keyword)
 * @param {Omit<UseQueryOptions<SessionReport[] | PeriodReport[], Error>, 'queryKey' | 'queryFn'>} [options] - useQuery 옵션
 * @returns useQuery 결과
 */
export const useFetchReports = (
  params: GetReportsParams,
  options?: Omit<UseQueryOptions<SessionReport[] | PeriodReport[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SessionReport[] | PeriodReport[], Error>({
    queryKey: reportQueryKeys.list(params),
    queryFn: () => getReports(params),
    ...options,
  });
};

/**
 * 특정 기간별 레포트의 상세 정보를 조회하는 Tanstack Query 훅입니다.
 *
 * @param {number} preportId - 조회할 기간별 레포트의 ID
 * @param {Omit<UseQueryOptions<PeriodReportDetail, Error>, 'queryKey' | 'queryFn'>} [options] - useQuery 옵션
 * @returns useQuery 결과
 */
export const useFetchPeriodicReportDetail = (
  preportId: number,
  options?: Omit<UseQueryOptions<PeriodReportDetail, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PeriodReportDetail, Error>({
    queryKey: reportQueryKeys.periodicDetail(preportId),
    queryFn: () => getPeriodicReportDetail(preportId),
    enabled: !!preportId, // preportId가 있을 때만 쿼리 실행
    ...options,
  });
};
