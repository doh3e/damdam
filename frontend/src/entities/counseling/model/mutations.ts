/**
 * @file frontend/src/entities/counseling/model/mutations.ts
 * 상담(Counseling) 엔티티 관련 데이터 변경(생성, 수정, 삭제)을 위한 Tanstack Query 뮤테이션 훅을 정의합니다.
 * FSD 아키텍처에 따라 `entities` 레이어의 `counseling` 슬라이스 내 `model`에 위치합니다.
 */
import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
  createCounselingSession,
  updateCounselingTitle,
  closeCounselingSession,
  deleteCounselingSession,
  createSessionReport,
  type CreateCounselingSessionPayload,
  type UpdateCounselingTitlePayload,
  type CreateSessionReportResponse, // createSessionReport의 반환 타입
} from './api'; // 정의된 API 함수 및 관련 타입을 가져옵니다.
import type { CounselingSession } from './types';
import { counselingQueryKeys } from './queries'; // 쿼리 키 관리를 위해 import

/**
 * 새 상담 세션을 생성하는 Tanstack Query 뮤테이션 훅입니다.
 *
 * @param {Omit<UseMutationOptions<CounselingSession, Error, CreateCounselingSessionPayload | undefined, unknown>, 'mutationFn'>} [options] - `useMutation`에 전달될 추가 옵션
 * @returns {import('@tanstack/react-query').UseMutationResult<CounselingSession, Error, CreateCounselingSessionPayload | undefined, unknown>} useMutation의 반환 값
 */
export const useCreateCounselingSession = (
  options?: Omit<
    UseMutationOptions<
      CounselingSession, // API 함수 반환 타입
      Error, // 에러 타입
      CreateCounselingSessionPayload | undefined, // API 함수 파라미터 타입 (optional이므로 undefined 추가)
      unknown // context 타입 (낙관적 업데이트 등에 사용)
    >,
    'mutationFn' // mutationFn은 여기서 직접 제공
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<CounselingSession, Error, CreateCounselingSessionPayload | undefined, unknown>({
    mutationFn: (payload) => createCounselingSession(payload),
    onSuccess: (newSession, variables, context) => {
      // 새 세션 생성 성공 시, 상담 목록 및 해당 세션 상세 쿼리를 무효화하여 최신 데이터 반영
      queryClient.invalidateQueries({ queryKey: counselingQueryKeys.lists() });
      // queryClient.invalidateQueries({ queryKey: counselingQueryKeys.detail(newSession.couns_id) }); // 생성 응답에 couns_id가 있다면 사용
      options?.onSuccess?.(newSession, variables, context);
    },
    ...options,
  });
};

/**
 * 상담 세션의 제목을 수정하는 Tanstack Query 뮤테이션 훅입니다.
 *
 * @param {Omit<UseMutationOptions<CounselingSession, Error, { counsId: string; payload: UpdateCounselingTitlePayload }, unknown>, 'mutationFn'>} [options]
 * @returns {import('@tanstack/react-query').UseMutationResult<CounselingSession, Error, { counsId: string; payload: UpdateCounselingTitlePayload }, unknown>}
 */
export const useUpdateCounselingTitle = (
  options?: Omit<
    UseMutationOptions<
      CounselingSession,
      Error,
      { counsId: string; payload: UpdateCounselingTitlePayload }, // mutate 함수에 전달될 변수 타입
      unknown
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<CounselingSession, Error, { counsId: string; payload: UpdateCounselingTitlePayload }, unknown>({
    mutationFn: ({ counsId, payload }) => updateCounselingTitle(counsId, payload),
    onSuccess: (updatedSession, variables, context) => {
      // 제목 수정 성공 시, 해당 세션 상세 및 관련 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: counselingQueryKeys.detail(variables.counsId) });
      queryClient.invalidateQueries({ queryKey: counselingQueryKeys.lists() }); // 목록에도 제목이 표시될 수 있으므로
      options?.onSuccess?.(updatedSession, variables, context);
    },
    ...options,
  });
};

/**
 * 상담 세션을 종료하는 Tanstack Query 뮤테이션 훅입니다.
 *
 * @param {Omit<UseMutationOptions<void, Error, string, unknown>, 'mutationFn'>} [options]
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, string, unknown>}
 */
export const useCloseCounselingSession = (
  options?: Omit<UseMutationOptions<void, Error, string, unknown>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, unknown>({
    mutationFn: (counsId: string) => closeCounselingSession(counsId),
    onSuccess: (data, counsId, context) => {
      // 세션 종료 성공 시, 해당 세션 상세 및 목록 쿼리 무효화 (is_closed 상태 변경 반영)
      queryClient.invalidateQueries({ queryKey: counselingQueryKeys.detail(counsId) });
      queryClient.invalidateQueries({ queryKey: counselingQueryKeys.lists() });
      options?.onSuccess?.(data, counsId, context);
    },
    ...options,
  });
};

/**
 * 상담 세션을 삭제하는 Tanstack Query 뮤테이션 훅입니다.
 *
 * @param {Omit<UseMutationOptions<void, Error, string, unknown>, 'mutationFn'>} [options]
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, string, unknown>}
 */
export const useDeleteCounselingSession = (
  options?: Omit<UseMutationOptions<void, Error, string, unknown>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, unknown>({
    mutationFn: (counsId: string) => deleteCounselingSession(counsId),
    onSuccess: (data, counsId, context) => {
      // 세션 삭제 성공 시, 해당 세션 상세 및 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: counselingQueryKeys.detail(counsId) });
      queryClient.invalidateQueries({ queryKey: counselingQueryKeys.lists() });
      // 삭제 후 특정 ID의 쿼리 키를 직접 제거할 수도 있음
      // queryClient.removeQueries({ queryKey: counselingQueryKeys.detail(counsId) });
      options?.onSuccess?.(data, counsId, context);
    },
    ...options,
  });
};

/**
 * 상담 세션에 대한 개별 레포트를 생성하는 Tanstack Query 뮤테이션 훅입니다.
 *
 * @param {Omit<UseMutationOptions<CreateSessionReportResponse, Error, string, unknown>, 'mutationFn'>} [options]
 * @returns {import('@tanstack/react-query').UseMutationResult<CreateSessionReportResponse, Error, string, unknown>}
 */
export const useCreateSessionReport = (
  options?: Omit<UseMutationOptions<CreateSessionReportResponse, Error, string, unknown>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<CreateSessionReportResponse, Error, string, unknown>({
    mutationFn: (counsId: string) => createSessionReport(counsId),
    onSuccess: (response, counsId, context) => {
      // 레포트 생성 성공 시, 관련 쿼리 무효화 (예: 레포트 목록, 해당 상담 세션 정보 등)
      // queryClient.invalidateQueries({ queryKey: ['reports', 'list'] }); // 레포트 목록이 있다면
      // queryClient.invalidateQueries({ queryKey: counselingQueryKeys.detail(counsId) }); // 세션 정보에 레포트 관련 내용이 있다면
      console.log('세션 리포트 생성 성공:', response, 'for session:', counsId);
      options?.onSuccess?.(response, counsId, context);
    },
    ...options,
  });
};
