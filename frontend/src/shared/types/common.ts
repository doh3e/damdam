// 공통으로 사용될 수 있는 타입 정의 (예시)

// 페이지네이션 파라미터 (요청 시)
export interface PaginationParams {
  page?: number;
  size?: number; // 또는 limit
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 간단한 ID를 가지는 객체
export interface Identifiable {
  id: number | string;
}

// 날짜 관련 필드를 가지는 객체 (예: 생성/수정일)
export interface Timestampable {
  createdAt: string; // 또는 Date
  updatedAt: string; // 또는 Date
}
