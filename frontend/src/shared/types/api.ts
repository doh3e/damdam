// API 공통 응답 인터페이스 (예시)
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

// 페이지네이션 정보가 포함된 API 응답 (예시)
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// 요청 성공 여부만 반환하는 API 응답 (예시)
export interface SuccessResponse extends ApiResponse<null> {
  data: null; // 성공 시 데이터는 null
}

// 간단한 에러 응답 (예시)
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  data: null;
}
