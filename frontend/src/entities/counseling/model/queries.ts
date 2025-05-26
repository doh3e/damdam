/**
 * @file frontend/src/entities/counseling/model/queries.ts
 * 상담(Counseling) 엔티티 관련 데이터 조회를 위한 Tanstack Query 훅을 정의합니다.
 * FSD 아키텍처에 따라 `entities` 레이어의 `counseling` 슬라이스 내 `model`에 위치합니다.
 */
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  fetchPastCounselingSessions,
  fetchCounselingSessionDetails,
  type FetchPastCounselingSessionsParams,
} from './api'; // 정의된 API 함수 및 타입을 가져옵니다.
import type { CounselingSession } from './types';

/**
 * 상담 엔티티 관련 쿼리를 위한 기본 쿼리 키입니다.
 * 배열 형태로 사용되며, 목록, 상세 등 특정 쿼리를 구분하기 위해 추가적인 키를 조합합니다.
 * 예: ['counseling', 'list', { page: 1 }], ['counseling', 'detail', 'some-id']
 */
export const counselingQueryKeys = {
  all: ['counseling'] as const, // 모든 상담 관련 쿼리의 루트
  lists: () => [...counselingQueryKeys.all, 'list'] as const, // 모든 상담 목록 쿼리
  list: (params?: FetchPastCounselingSessionsParams) => [...counselingQueryKeys.lists(), params ?? {}] as const, // 특정 조건의 상담 목록
  details: () => [...counselingQueryKeys.all, 'detail'] as const, // 모든 상담 상세 쿼리
  detail: (counsId: string) => [...counselingQueryKeys.details(), counsId] as const, // 특정 상담 상세
};

/**
 * 지난 상담 세션 목록을 조회하는 Tanstack Query 훅입니다.
 *
 * @param {FetchPastCounselingSessionsParams} [params] - 목록 조회 시 사용될 파라미터 (페이지, 개수, 종료 여부 등)
 * @param {Omit<UseQueryOptions<CounselingSession[], Error, CounselingSession[], unknown[]>, 'queryKey' | 'queryFn'>} [options] - Tanstack Query `useQuery` 훅에 전달될 추가 옵션들.
 * @returns {import('@tanstack/react-query').UseQueryResult<CounselingSession[], Error>} useQuery의 반환 값 (data, isLoading, error 등 포함)
 */
export const useFetchPastCounselingSessions = (
  params?: FetchPastCounselingSessionsParams,
  options?: Omit<
    UseQueryOptions<
      CounselingSession[], // QueryFn 반환 타입
      Error, // 에러 타입
      CounselingSession[], // select 사용 시 반환될 데이터 타입 (여기서는 동일)
      readonly (string | Record<string, unknown>)[] // 쿼리 키 타입
    >,
    'queryKey' | 'queryFn' // queryKey와 queryFn은 여기서 직접 제공하므로 제외
  >
) => {
  return useQuery<CounselingSession[], Error, CounselingSession[], readonly (string | Record<string, unknown>)[]>({
    queryKey: counselingQueryKeys.list(params),
    queryFn: () => fetchPastCounselingSessions(params),
    ...options, // 외부에서 전달된 추가 옵션들 (staleTime, gcTime 등)
  });
};

/**
 * 특정 상담 세션의 상세 정보 (메시지 포함 가능성 있음)를 조회하는 Tanstack Query 훅입니다.
 *
 * @param {string} counsId - 조회할 상담 세션의 ID.
 * @param {Omit<UseQueryOptions<CounselingSession, Error, CounselingSession, unknown[]>, 'queryKey' | 'queryFn'>} [options] - Tanstack Query `useQuery` 훅에 전달될 추가 옵션들.
 * @returns {import('@tanstack/react-query').UseQueryResult<CounselingSession, Error>} useQuery의 반환 값
 */
export const useFetchCounselingSessionDetail = (
  counsId: string,
  options?: Omit<
    UseQueryOptions<CounselingSession, Error, CounselingSession, readonly (string | Record<string, unknown>)[]>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<CounselingSession, Error, CounselingSession, readonly (string | Record<string, unknown>)[]>({
    queryKey: counselingQueryKeys.detail(counsId),
    queryFn: () => fetchCounselingSessionDetails(counsId),
    ...options,
  });
};
