/**
 * Dashboard 데이터 훅
 *
 * 주요 기능:
 * - 관심사 데이터 조회 (Insight Service)
 * - 대화 활동 데이터 조회 (Conversation Service)
 * - 자녀별 데이터 분리
 */

import { useQuery } from "@tanstack/react-query";
import { getTopInterests } from "../../../../api/insights";
import { getConversations } from "../../../../api/conversations";
import { getRecommendations } from "../../../../api/recommendations";

/**
 * 관심사 데이터 조회
 */
export const useInterestsData = (childId: string) => {
  return useQuery({
    queryKey: ["interests", childId],
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
    queryKey: ["activities", childId],
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
        const date = new Date(conv.startDate).toISOString().split("T")[0];
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
    queryKey: ["recent-conversations", childId, limit],
    queryFn: () =>
      getConversations({
        childProfileId: childId,
        page: 1,
        limit,
      }),
    enabled: !!childId,
    staleTime: 1000 * 60 * 2, // 2분
  });
};

/**
 * 추천 콘텐츠 조회 (최상위 관심사 키워드 기반)
 */
export const useRecommendations = (childId: string, topKeyword?: string) => {
  return useQuery({
    queryKey: ["recommendations", childId, topKeyword],
    queryFn: () =>
      getRecommendations(childId, {
        // category는 "축제", "관광지", "문화시설" 중 하나여야 하므로 전달하지 않음
        // topKeyword는 백엔드에서 제목/설명에서 검색하는 용도로 사용됨
        page: 1,
        pageSize: 20,
      }),
    enabled: !!childId && !!topKeyword, // childId와 topKeyword가 있을 때만 조회
    staleTime: 1000 * 60 * 10, // 10분
  });
};
