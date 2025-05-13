import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAuthStore } from '@/app/store/authStore';
import { API_BASE_URL } from '../config';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 요청 타임아웃 10초
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // 쿠키 기반 인증 시 필요
});

// 요청 인터셉터(Zustand token 사용)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().token;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // 요청 보내기 전에 수행할 작업 (예: 인증 토큰 추가)
    // const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    // if (accessToken) {
    //   config.headers.Authorization = `Bearer ${accessToken}`;
    // }
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
    return response.data; // 실제 API 응답에서는 response.data.data 또는 response.data.result 등을 반환할 수 있습니다.
  },
  async (error: AxiosError) => {
    // 응답 에러 처리
    console.error('Response interceptor error:', error);

    // if (error.response) {
    //   const { status, data } = error.response;
    //   // 예외처리 가이드에 따른 공통 에러 처리
    //   switch (status) {
    //     case 401:
    //       // 인증 에러 처리 (예: 로그인 페이지로 리디렉션, 토큰 갱신 시도)
    //       console.error('Unauthorized error:', data);
    //       // 예시: await refreshTokenAndRetryRequest(error.config);
    //       break;
    //     case 403:
    //       console.error('Forbidden error:', data);
    //       // 접근 권한 없음 처리
    //       break;
    //     case 404:
    //       console.error('Not found error:', data);
    //       // 리소스 없음 처리
    //       break;
    //     // 기타 상태 코드에 따른 처리
    //     default:
    //       console.error(`Unhandled error: ${status}`, data);
    //   }
    // } else if (error.request) {
    //   // 요청이 만들어졌으나 응답을 받지 못한 경우 (네트워크 오류 등)
    //   console.error('No response received:', error.request);
    // } else {
    //   // 요청 설정 중 에러 발생
    //   console.error('Error setting up request:', error.message);
    // }

    return Promise.reject(error); // 에러를 전파하여 개별 API 호출에서도 처리할 수 있도록 함
  }
);

export default axiosInstance;
