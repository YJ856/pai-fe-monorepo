/**
 * useInfiniteScroll 훅 (React Native용)
 *
 * FlatList 무한 스크롤 구현
 * TanStack Query의 useInfiniteQuery와 함께 사용
 *
 * 사용처:
 * - 부모 퀴즈 > 지난 퀴즈 탭 (커서 기반 페이지네이션)
 * - 대화 목록
 * - 추천 콘텐츠 목록
 *
 * 사용 예시:
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 * } = useInfiniteQuery({
 *   queryKey: ['conversations'],
 *   queryFn: ({ pageParam = 1 }) => getConversations({ page: pageParam }),
 *   getNextPageParam: (lastPage) => lastPage.nextPage,
 * });
 *
 * const handleLoadMore = useInfiniteScroll({
 *   hasNextPage,
 *   fetchNextPage,
 *   isFetchingNextPage,
 * });
 *
 * <FlatList
 *   data={data?.pages.flatMap(page => page.items)}
 *   onEndReached={handleLoadMore}
 *   onEndReachedThreshold={0.5}
 * />
 */

import { useCallback } from 'react';

interface UseInfiniteScrollProps {
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

export function useInfiniteScroll({
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: UseInfiniteScrollProps) {
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return handleLoadMore;
}
