/**
 * @file frontend/src/shared/api/index.ts
 * @description API 관련 모듈들을 re-export합니다.
 */
export { apiClient, apiClient as 상담_API } from './axiosInstance'; // apiClient를 상담_API 별칭으로도 export
export { default } from './axiosInstance'; // axiosInstance를 default export
