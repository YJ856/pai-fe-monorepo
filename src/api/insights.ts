/**
 * 인사이트 API (관심사 분석)
 *
 * 백엔드: pai-service-insight (/api/insights)
 *
 * 주요 기능:
 * - AI 분석 결과 저장 (자녀 전용)
 * - 상위 관심사 조회 (워드클라우드용)
 * - 오래된 관심사 정리
 *
 * 사용처:
 * - 부모 대시보드 > 관심사 탭
 * - 워드클라우드, 트렌드 차트 표시
 */

import { insightServiceClient } from './client/axios';

/**
 * POST /api/insights/analytics
 * AI 분석 결과 저장 (자녀 전용)
 *
 * Request:
 * - childId: string
 * - conversationId: string
 * - extractedKeywords: string[] (AI가 추출한 키워드 목록)
 *
 * Note: 대화 종료 후 백그라운드에서 자동 호출 예정
 */
export const createAnalytics = async (data: {
  childId: string;
  conversationId: string;
  extractedKeywords: string[];
}) => {
  const response = await insightServiceClient.post('/api/insights/analytics', data);
  return response.data.data;
};

/**
 * GET /api/insights/interests/:childId/top?limit=10
 * 상위 관심사 조회
 *
 * Query:
 * - limit: number (기본값: 10)
 *
 * Response:
 * - interests: Array<{
 *     keyword: string,
 *     rawScore: number,
 *     lastUpdated: string
 *   }>
 *
 * 사용처:
 * - 워드클라우드 (단어 크기에 rawScore 반영)
 * - 관심사 트렌드 차트
 */
export const getTopInterests = async (childId: string, limit = 10) => {
  const response = await insightServiceClient.get(`/api/insights/interests/${childId}/top`, {
    params: { limit },
  });
  return response.data.data;
};

/**
 * DELETE /api/insights/interests/prune?minDays=14&maxScore=1.0
 * 오래되고 점수가 낮은 관심사 정리
 *
 * Query:
 * - minDays: number (기본값: 14, 14일 이상 된 것만)
 * - maxScore: number (기본값: 1.0, 점수 1.0 이하만)
 *
 * Note: 관리자용 또는 백그라운드 스케줄러에서 사용
 */
export const pruneOldInterests = async (params?: {
  minDays?: number;
  maxScore?: number;
}) => {
  const response = await insightServiceClient.delete('/api/insights/interests/prune', {
    params: {
      minDays: 14,
      maxScore: 1.0,
      ...params,
    },
  });
  return response.data;
};
