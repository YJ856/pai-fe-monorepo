/**
 * VQA 답변 Custom Hook
 *
 * 역할:
 * - AI 서비스를 통해 이미지 기반 질문에 대한 답변 받기 (useMutation)
 * - mutation 상태/결과를 한 번에 반환
 *
 * API:
 * - POST /api/ai/vqa
 */

import { useMutation } from "@tanstack/react-query";
import { getVqaAnswer } from "@/api/ai";
import type { VqaRequestDto, VqaResponseData } from "@/api/ai";

export function useVqaAnswer() {

  // 1. VQA 답변 Mutation
  const vqaAnswerMutation = useMutation<
    VqaResponseData,
    Error,
    VqaRequestDto
  >({
    mutationFn: (payload) => getVqaAnswer(payload),
  });

  return {
    // 호출 함수
    getVqaAnswer: vqaAnswerMutation.mutate,
    getVqaAnswerAsync: vqaAnswerMutation.mutateAsync,
    // 상태
    isGettingAnswer: vqaAnswerMutation.isPending,
    isAnswerSuccess: vqaAnswerMutation.isSuccess,
    isAnswerError: vqaAnswerMutation.isError,
    // 결과 / 에러
    answerResult: vqaAnswerMutation.data,
    answerError: vqaAnswerMutation.error,
  };
}
