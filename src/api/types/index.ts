/**
 * API 타입 정의
 *
 * pai-shared-types 패키지의 타입을 여기서 재export하거나
 * 프론트엔드 전용 타입을 정의
 *
 * 사용 예시:
 * import { BaseResponse, LoginRequestDto } from '@/api/types';
 */

// pai-shared-types에서 공통 타입 가져오기
export * from 'pai-shared-types';

// 페이지네이션 응답 타입 (프론트엔드 전용)
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
