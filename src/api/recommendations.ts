/**
 * 추천 콘텐츠 API
 *
 * 백엔드: pai-service-insight (/api/insights/recommendations)
 *
 * 주요 기능:
 * - 자녀 관심사 기반 콘텐츠 추천
 * - 카테고리별 필터링
 * - 페이지네이션 지원
 *
 * 사용처:
 * - 부모 대시보드 > 추천 탭
 * - 관심사 기반 놀이/학습 콘텐츠 카드 목록
 */

import { insightServiceClient } from './client/axios';

/**
 * GET /api/insights/recommendations/:childId?page=1&pageSize=10&category=
 * 추천 콘텐츠 조회
 *
 * Path:
 * - childId: string (자녀 프로필 ID)
 *
 * Query:
 * - page: number (기본값: 1)
 * - pageSize: number (기본값: 10)
 * - category: string (선택적, 카테고리 필터링)
 *
 * Response:
 * - recommendations: Array<{
 *     id: string,
 *     title: string,
 *     description: string,
 *     category: string,
 *     thumbnailUrl?: string,
 *     relevanceScore: number (관심사 매칭 점수)
 *   }>
 * - totalCount: number
 * - totalPages: number
 *
 * 사용 예시:
 * const { recommendations } = await getRecommendations('child-123', { category: '놀이' });
 */
export const getRecommendations = async (
  childId: string,
  params?: {
    page?: number;
    pageSize?: number;
    category?: string;
  }
) => {
  const response = await insightServiceClient.get(`/api/insights/recommendations/${childId}`, {
    params: {
      page: 1,
      pageSize: 10,
      ...params,
    },
  });
  return response.data.data;
};
