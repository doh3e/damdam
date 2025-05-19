import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAuthStore } from '@/app/store/authStore';
import { API_BASE_URL } from '../config';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 요청 타임아웃 10초
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터(Zustand token 사용)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().token;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config);
    return config;
  },
  (error: AxiosError) => {
    // 요청 에러 처리
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 응답 데이터 가공
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response.data; // 실제 API 응답에서는 response.data.data 또는 response.data.result 등을 반환할 수 있습니다.
  },
  async (error: AxiosError) => {
    // 응답 에러 처리
    console.error('Response interceptor error:', error);

    // 상세 에러 정보 로깅
    if (error.response) {
      const { status, data, config } = error.response;
      console.error(`[API Error] ${config.method?.toUpperCase()} ${config.url} - Status: ${status}`, {
        data,
        message: error.message,
        name: error.name,
        config: error.config,
      });

      // 예외처리 가이드에 따른 공통 에러 처리
      switch (status) {
        case 401:
          // 인증 에러 처리 (예: 로그인 페이지로 리디렉션, 토큰 갱신 시도)
          console.error('Unauthorized error:', data);
          // 예시: await refreshTokenAndRetryRequest(error.config);
          break;
        case 403:
          console.error('Forbidden error:', data);
          // 접근 권한 없음 처리
          break;
        case 404:
          console.error('Not found error:', data);
          // 리소스 없음 처리
          break;
        case 500:
          console.error('Server error:', data);
          // 서버 에러 처리
          break;
        // 기타 상태 코드에 따른 처리
        default:
          console.error(`Unhandled error: ${status}`, data);
      }
    } else if (error.request) {
      // 요청이 만들어졌으나 응답을 받지 못한 경우 (네트워크 오류 등)
      console.error('[API Error] No response received:', {
        request: error.request,
        message: error.message,
        config: error.config,
      });
    } else {
      // 요청 설정 중 에러 발생
      console.error('[API Error] Error setting up request:', {
        message: error.message,
        config: error.config,
      });
    }

    return Promise.reject(error); // 에러를 전파하여 개별 API 호출에서도 처리할 수 있도록 함
  }
);

/**
 * 확장된 API 클라이언트
 * 타입 안전성과 사용 편의성을 제공하는 메서드들을 포함합니다.
 */
export const apiClient = {
  /**
   * GET 요청을 수행합니다.
   * @template T 응답 데이터의 타입
   * @param endpoint API 엔드포인트 경로 (예: '/users')
   * @param params URL 쿼리 파라미터 (선택사항)
   * @returns Promise<T> 응답 데이터
   */
  get: <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    return axiosInstance.get(endpoint, { params });
  },

  /**
   * POST 요청을 수행합니다.
   * @template TRequest 요청 바디의 타입
   * @template TResponse 응답 데이터의 타입
   * @param endpoint API 엔드포인트 경로
   * @param data 요청 바디 데이터
   * @returns Promise<TResponse> 응답 데이터
   */
  post: <TRequest, TResponse>(endpoint: string, data: TRequest): Promise<TResponse> => {
    return axiosInstance.post(endpoint, data);
  },

  /**
   * PATCH 요청을 수행합니다.
   * @template TRequest 요청 바디의 타입
   * @template TResponse 응답 데이터의 타입
   * @param endpoint API 엔드포인트 경로
   * @param data 요청 바디 데이터
   * @returns Promise<TResponse> 응답 데이터
   */
  patch: <TRequest, TResponse>(endpoint: string, data: TRequest): Promise<TResponse> => {
    try {
      console.log(`[PATCH Request] ${endpoint}`, { data });
      return axiosInstance.patch(endpoint, data);
    } catch (error) {
      console.error(`[PATCH Error] ${endpoint}`, error);
      throw error;
    }
  },

  /**
   * PUT 요청을 수행합니다.
   * @template TRequest 요청 바디의 타입
   * @template TResponse 응답 데이터의 타입
   * @param endpoint API 엔드포인트 경로
   * @param data 요청 바디 데이터
   * @returns Promise<TResponse> 응답 데이터
   */
  put: <TRequest, TResponse>(endpoint: string, data: TRequest): Promise<TResponse> => {
    return axiosInstance.put(endpoint, data);
  },

  /**
   * DELETE 요청을 수행합니다.
   * @template T 응답 데이터의 타입 (응답이 있는 경우)
   * @param endpoint API 엔드포인트 경로
   * @param params URL 쿼리 파라미터 (선택사항)
   * @returns Promise<T | void> 응답 데이터 또는 void
   */
  delete: <T = void>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    try {
      console.log(`[DELETE Request] ${endpoint}`, { params });
      return axiosInstance.delete(endpoint, { params });
    } catch (error) {
      console.error(`[DELETE Error] ${endpoint}`, error);
      throw error;
    }
  },
};

export default axiosInstance;
