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
import { getConversationsCalendar, getConversationsByDate } from "../../../../api/conversations";
import { getRecommendations } from "../../../../api/recommendations";

/**
 * 관심사 데이터 조회
 */
export const useInterestsData = (childId: string | undefined) => {
  return useQuery({
    queryKey: ["interests", childId],
    queryFn: () => getTopInterests(childId!, 20), // 최대 20개
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
      // 캘린더 API 사용 (날짜별 대화 개수 집계)
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const data = await getConversationsCalendar({
        childProfileId: Number(childId),
        year,
        month,
      });

      // 응답 데이터를 캘린더 형식으로 변환
      return data.dates.map((item) => ({
        date: item.date,
        count: item.count,
      }));
    },
    enabled: !!childId,
    staleTime: 1000 * 60 * 5, // 5분
  });
};

/**
 * 최근 대화 목록 조회
 */
export const useRecentConversations = (childId: string, date?: string) => {
  return useQuery({
    queryKey: ["recent-conversations", childId, date],
    queryFn: () =>
      getConversationsByDate({
        childProfileId: Number(childId),
        date: date || new Date().toISOString().split("T")[0],
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
