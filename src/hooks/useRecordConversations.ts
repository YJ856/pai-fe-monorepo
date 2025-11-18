/**
 * 대화 기록 Custom Hook
 *
 * 역할:
 * - 대화 세션(conversationSessionId)에 질문/답변, 이미지, 키워드 기록 (useMutation)
 * - mutation 상태/결과를 한 번에 반환
 *
 * API:
 * - POST /api/conversations/record
 */

import { useMutation } from "@tanstack/react-query";
import { recordConversation } from "@/api/conversations";
import type { RecordConversationRequestDto, RecordConversationResponseData } from "pai-shared-types";

export function useRecordConversation() {
  
  // 1. 대화 기록 Mutation
  const recordConversationMutation = useMutation<
    RecordConversationResponseData,
    Error,
    RecordConversationRequestDto
  >({
    mutationFn: (payload) => recordConversation(payload),
  });

  return {
    // 호출 함수
    recordConversation: recordConversationMutation.mutate,
    recordConversationAsync: recordConversationMutation.mutateAsync,
    // 상태
    isRecording: recordConversationMutation.isPending,
    isRecordSuccess: recordConversationMutation.isSuccess,
    isRecordError: recordConversationMutation.isError,
    // 결과 / 에러
    recordResult: recordConversationMutation.data,
    recordError: recordConversationMutation.error,
  }
}