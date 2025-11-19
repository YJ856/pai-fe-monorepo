/**
 * 부모 대화 상세 조회 Custom Hook
 *
 * 역할:
 * - 특정 대화(conversationId)의 전체 질문/답변 목록 조회 (useQuery)
 * - 백엔드 DTO를 화면용 ViewModel로 변환
 * - firstMediaId + 각 질문의 imageMediaId의 이미지 URL 조회 (useMediaUrls)
 *
 * API:
 * - GET /api/conversations/:conversationId
 * - GET /api/media?mediaIds=...
 */

import { useQuery } from "@tanstack/react-query";
import { getConversationDetail } from "@/api/conversations";
import type { GetConversationDetailResponseData } from "pai-shared-types";
import { useMemo } from "react";
import { useMediaUrls } from "@/hooks/useMediaUrls";

// 상세 화면에서 사용할 ViewModel들
export interface ParentConversationDetailMessageViewModel {
  order: number;
  questionText: string;
  answerText: string;
  imageMediaId: string | null;
  imageUrl?: string;
  keyword: string | null;
}

export interface ParentConversationDetailViewModel {
  conversationId: string;
  childProfileId: number;
  startDate: Date;
  title: string | null;
  firstMediaId: string | null;
  firstMediaUrl?: string;
  messages: ParentConversationDetailMessageViewModel[];
}

export function useConversationDetail(conversationId: string) {
  // 1. 대화 상세 조회
  const {
    data: detailData,
    isLoading: isLoadingDetail,
    isError,
    error,
  } = useQuery<GetConversationDetailResponseData, Error>({
    queryKey: ['parent-conversations', 'detail', conversationId],
    queryFn: () => getConversationDetail(conversationId as string),
    enabled: !!conversationId,
  });

  // 2. firstMediaId + 각 질문의 imageMediaId 수집
  const allMediaIds = useMemo(() => {
    if (!detailData) return [];

    const ids: (string | null)[] = [];
    ids.push(detailData.firstMediaId);
    detailData.items.forEach((item) => {
      ids.push(item.imageMediaId);
    });
    return ids;
  }, [detailData]);

  // 3. Media URL 조회
  const { mediaUrlMap, isLoading: isLoadingMedia } = useMediaUrls(allMediaIds);

  // 4. DTO → ViewModel 변환
  const conversation: ParentConversationDetailViewModel | null = useMemo(() => {
    if (!detailData) return null;

    return {
      conversationId: detailData.conversationId,
      childProfileId: detailData.childProfileId,
      startDate: new Date(detailData.startDate),
      title: detailData.title,
      firstMediaId: detailData.firstMediaId,
      firstMediaUrl: detailData.firstMediaId
        ? mediaUrlMap[detailData.firstMediaId]
        : undefined,
      messages: detailData.items.map<ParentConversationDetailMessageViewModel>(
        (item) => ({
          order: item.order,
          questionText: item.questionText,
          answerText: item.answerText,
          imageMediaId: item.imageMediaId,
          imageUrl: item.imageMediaId
            ? mediaUrlMap[item.imageMediaId]
            : undefined,
          keyword: item.keyword,
        }),
      ),
    };
  }, [detailData, mediaUrlMap]);

  return {
    conversation,
    messages: conversation?.messages ?? [],

    isLoading: isLoadingDetail || isLoadingMedia,
    isError,
    error,
  };
}