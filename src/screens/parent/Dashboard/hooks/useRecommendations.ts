/**
 * useRecommendations 훅
 *
 * 추천 콘텐츠 패칭 및 필터링
 *
 * 주요 기능:
 * - TanStack Query useInfiniteQuery로 추천 콘텐츠 조회
 * - 카테고리 필터링
 * - 무한 스크롤
 *
 * API:
 * - GET /api/insights/recommendations/:childId (api/recommendations.ts)
 *
 * 파라미터:
 * - childId: string
 * - category?: string
 *
 * 반환값:
 * - recommendations: 추천 콘텐츠 배열
 * - fetchNextPage, hasNextPage, isFetchingNextPage
 */

import { useInfiniteQuery } from "@tanstack/react-query";
import { getRecommendations } from "../../../../api/recommendations";

interface UseRecommendationsParams {
  childId: string;
  category?: string;
}

export const useRecommendations = ({ childId, category }: UseRecommendationsParams) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["recommendations", childId, category],
    queryFn: ({ pageParam = 1 }) =>
      getRecommendations(childId, {
        page: pageParam,
        pageSize: 10,
        category,
      }),
    getNextPageParam: (lastPage, allPages) => {
      // hasMore가 true면 다음 페이지 번호 반환
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // 모든 페이지의 recommendations를 평탄화
  const recommendations = data?.pages.flatMap((page) => page.recommendations) ?? [];

  return {
    recommendations,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  };
};
