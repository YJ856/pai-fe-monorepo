/**
 * Dashboard 데이터 훅
 *
 * 주요 기능:
 * - 관심사 데이터 조회 (Insight Service)
 * - 대화 활동 데이터 조회 (Conversation Service)
 * - 자녀별 데이터 분리
 */

import { useQuery } from '@tanstack/react-query';
import { getTopInterests } from '../../../../api/insights';
import { getConversations } from '../../../../api/conversations';

/**
 * 관심사 데이터 조회
 */
export const useInterestsData = (childId: string) => {
  return useQuery({
    queryKey: ['interests', childId],
    queryFn: () => getTopInterests(childId, 20), // 최대 20개
    enabled: !!childId,
    staleTime: 1000 * 60 * 5, // 5분
  });
};

/**
 * 대화 활동 데이터 조회 (활동 캘린더용)
 */
export const useActivityData = (childId: string) => {
  return useQuery({
    queryKey: ['activities', childId],
    queryFn: async () => {
      // 최근 100개 대화 가져오기
      const data = await getConversations({
        childProfileId: childId,
        page: 1,
        limit: 100,
      });

      // 날짜별로 대화 개수 집계
      const activityMap = new Map<string, number>();

      data.conversations.forEach((conv: any) => {
        const date = new Date(conv.startDate).toISOString().split('T')[0];
        activityMap.set(date, (activityMap.get(date) || 0) + 1);
      });

      // 배열로 변환
      return Array.from(activityMap.entries()).map(([date, count]) => ({
        date,
        count,
      }));
    },
    enabled: !!childId,
    staleTime: 1000 * 60 * 5, // 5분
  });
};

/**
 * 최근 대화 목록 조회
 */
export const useRecentConversations = (childId: string, limit = 10) => {
  return useQuery({
    queryKey: ['recent-conversations', childId, limit],
    queryFn: () => getConversations({
      childProfileId: childId,
      page: 1,
      limit,
    }),
    enabled: !!childId,
    staleTime: 1000 * 60 * 2, // 2분
  });
};
