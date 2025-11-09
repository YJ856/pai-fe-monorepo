/**
 * API 타입 정의
 *
 * pai-shared-types 패키지의 타입을 여기서 재export하거나
 * 프론트엔드 전용 타입을 정의
 *
 * 사용 예시:
 * import { BaseResponse, PaginatedResponse } from '@/api/types';
 */

// 백엔드 공통 응답 타입
export interface BaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// TODO: pai-shared-types 패키지 설치 후 여기서 재export
// export * from 'pai-shared-types';
