/**
 * @file api/index.ts
 * 백엔드 API와 통신하기 위한 클라이언트 설정 파일입니다.
 * FSD 아키텍처에 따라 `shared` 레이어의 `api`에 위치합니다.
 * 이 파일에서는 fetch를 기반으로 간단한 API 호출 함수를 정의하고,
 * 향후 인증 토큰 처리, 공통 에러 핸들링 등을 추가할 수 있습니다.
 */

import { API_BASE_URL } from '../config';
/**
 * API 요청 시 사용될 공통 헤더입니다.
 * @returns {HeadersInit} 공통 헤더 객체
 */
const getCommonHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  // TODO: 인증 토큰이 있다면 여기에 추가합니다.
  // const token = localStorage.getItem('accessToken');
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }
  return headers;
};

/**
 * API 요청에 대한 기본 에러 핸들러입니다.
 * @param {Response} response - API 응답 객체
 * @throws {Error} API 요청 실패 시 에러를 던집니다.
 */
const handleApiResponseError = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // 응답 바디가 JSON이 아니거나 파싱 실패
      const textError = await response.text();
      errorMessage = textError || errorMessage;
    }
    console.error('API Response Error:', errorMessage, 'URL:', response.url);
    throw new Error(errorMessage);
  }
};

/**
 * 제네릭 타입을 사용하여 API GET 요청을 수행하는 함수입니다.
 *
 * @template T 응답 데이터의 타입
 * @param {string} endpoint - API 엔드포인트 경로 (예: '/users')
 * @param {RequestInit} [options] - fetch 요청에 전달할 추가 옵션
 * @returns {Promise<T>} API 응답 데이터를 포함하는 Promise
 */
export const apiClient = {
  get: async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getCommonHeaders(),
      ...options,
    });
    await handleApiResponseError(response);
    return response.json() as Promise<T>;
  },

  /**
   * 제네릭 타입을 사용하여 API POST 요청을 수행하는 함수입니다.
   *
   * @template TRequest 요청 바디의 타입
   * @template TResponse 응답 데이터의 타입
   * @param {string} endpoint - API 엔드포인트 경로
   * @param {TRequest} body - 요청 바디 데이터
   * @param {RequestInit} [options] - fetch 요청에 전달할 추가 옵션
   * @returns {Promise<TResponse>} API 응답 데이터를 포함하는 Promise
   */
  post: async <TRequest, TResponse>(endpoint: string, body: TRequest, options?: RequestInit): Promise<TResponse> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getCommonHeaders(),
      body: JSON.stringify(body),
      ...options,
    });
    await handleApiResponseError(response);
    // POST 요청 후 응답 바디가 없을 수도 있으므로, NoContent(204) 등의 경우를 고려
    if (response.status === 204) {
      return {} as TResponse; // 혹은 undefined나 null을 반환하도록 타입 조정
    }
    return response.json() as Promise<TResponse>;
  },

  /**
   * 제네릭 타입을 사용하여 API PATCH 요청을 수행하는 함수입니다.
   *
   * @template TRequest 요청 바디의 타입
   * @template TResponse 응답 데이터의 타입
   * @param {string} endpoint - API 엔드포인트 경로
   * @param {TRequest} body - 요청 바디 데이터
   * @param {RequestInit} [options] - fetch 요청에 전달할 추가 옵션
   * @returns {Promise<TResponse>} API 응답 데이터를 포함하는 Promise
   */
  patch: async <TRequest, TResponse>(endpoint: string, body: TRequest, options?: RequestInit): Promise<TResponse> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getCommonHeaders(),
      body: JSON.stringify(body),
      ...options,
    });
    await handleApiResponseError(response);
    if (response.status === 204) {
      return {} as TResponse;
    }
    return response.json() as Promise<TResponse>;
  },

  /**
   * API DELETE 요청을 수행하는 함수입니다.
   *
   * @param {string} endpoint - API 엔드포인트 경로
   * @param {RequestInit} [options] - fetch 요청에 전달할 추가 옵션
   * @returns {Promise<void>} 요청 성공 시 void를 반환하는 Promise
   */
  delete: async (endpoint: string, options?: RequestInit): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getCommonHeaders(),
      ...options,
    });
    await handleApiResponseError(response);
    // DELETE는 보통 응답 바디가 없으므로 void 반환
  },
};

// 사용 예시:
// interface User { id: number; name: string; }
// const fetchUsers = () => apiClient.get<User[]>('/users');
// const createUser = (data: { name: string }) => apiClient.post<{name: string}, User>('/users', data);
