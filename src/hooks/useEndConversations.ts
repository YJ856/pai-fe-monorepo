/**
 * 대화 종료 Custom Hook
 *
 * 역할:
 * - 대화 세션(conversationSessionId)을 종료 (useMutation)
 * - mutation 상태/결과를 한 번에 반환
 *
 * API:
 * - POST /api/conversations/:conversationSessionId/end
 */

import { useMutation } from "@tanstack/react-query";
import { endConversation } from "@/api/conversations";
import type { EndConversationPathParam, EndConversationResponseData } from "pai-shared-types";

export function useEndConversation() {
  
  // 1. 대화 종료 Mutation
  const endConversationMutation = useMutation<
    EndConversationResponseData,
    Error,
    EndConversationPathParam
  >({
    mutationFn: (payload) => endConversation(payload),
  });

  return {
    // 호출 함수
    endConversation: endConversationMutation.mutate,
    endConversationAsync: endConversationMutation.mutateAsync,
    // 상태
    isEnding: endConversationMutation.isPending,
    isEndSuccess: endConversationMutation.isSuccess,
    isEndError: endConversationMutation.isError,
    // 결과 / 에러
    endResult: endConversationMutation.data,
    endError: endConversationMutation.error,
  };
}