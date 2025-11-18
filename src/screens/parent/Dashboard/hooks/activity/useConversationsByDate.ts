/**
 * 부모 대시보드 - 대화 갤러리 조회 Custom Hook
 *
 * 역할:
 * - 특정 자녀(childProfileId)와 날짜(date)를 기준으로 대화 목록 조회 (useQuery)
 * - 백엔드 ConversationGalleryItemDto → 화면용 ViewModel로 변환
 * - 첫 이미지(firstMediaId)에 대한 URL 조회 (useMediaUrls)
 *
 * API:
 * - GET /api/conversations
 *   - Query: childProfileId, date?, cursor?, limit?
 */
import { useQuery } from "@tanstack/react-query";
import { getConversationsByDate } from "@/api/conversations";
import type { GetConversationsQueryParam, GetConversationsResponseData } from "pai-shared-types";
import { useMediaUrls } from "@/hooks/useMediaUrls";
import { useMemo } from "react";

// 갤러리 카드에서 사용할 ViewModel
export interface ParentConversationGalleryItemViewModel {
  conversationId: string;
  title: string;
  startDate: Date;
  firstMediaId: string | null;
  firstMediaUrl?: string;
}

interface UseConversationsByDateParams {
  childProfileId: number;
  date?: string;   // "2025-11-03" 같은 문자열
  limit?: number;  // 기본 20
}

export function useConversationsByDate({
  childProfileId,
  date,
  limit = 20,
}: UseConversationsByDateParams) {
  // 1. 대화 목록 조회
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    isError,
    error,
  } = useQuery<GetConversationsResponseData, Error>({
    queryKey: ["parent-conversations", "gallery", { childProfileId, date, limit }],
    queryFn: () => {
      const params: GetConversationsQueryParam = {
        childProfileId,
        date,
        limit,
      };
      return getConversationsByDate(params);
    },
    enabled: !!childProfileId, // 자녀 선택된 경우에만 호출
  });

  // 2. 모든 firstMediaId 수집
  const allMediaIds = useMemo(() => {
    if (!conversationsData) return [];

    const ids: (string | null)[] = [];
    conversationsData.items.forEach((item) => {
      ids.push(item.firstMediaId);
    });
    return ids;
  }, [conversationsData]);

  // 3. Media URL 조회
  const { mediaUrlMap, isLoading: isLoadingMedia } = useMediaUrls(allMediaIds);

  // 4. 백엔드 DTO → ViewModel 변환
  const conversations: ParentConversationGalleryItemViewModel[] = useMemo(() => {
    if (!conversationsData) return [];

    return conversationsData.items.map((item) => ({
      conversationId: item.conversationId,
      title: item.title ?? "제목 없음",
      startDate: new Date(item.startDate),
      firstMediaId: item.firstMediaId,
      firstMediaUrl: item.firstMediaId
        ? mediaUrlMap[item.firstMediaId]
        : undefined,
    }));
  }, [conversationsData, mediaUrlMap]);

  return {
    // 화면에서 바로 쓸 수 있는 데이터
    conversations, // ParentConversationGalleryItemViewModel[]

    // 필요하면 페이지네이션 정보도 같이 사용 가능
    nextCursor: conversationsData?.nextCursor ?? null,
    hasNext: conversationsData?.hasNext ?? false,

    // 상태
    isLoading: isLoadingConversations || isLoadingMedia,
    isError,
    error,
  };
}