/**
 * 부모 퀴즈 수정 Custom Hook
 *
 * 역할:
 * - 퀴즈 상세 조회 (수정 폼 초기값용)
 * - 퀴즈 수정 (useMutation)
 * - 수정 성공 시 관련 목록 캐시 무효화
 *
 * API:
 * - GET   /api/quiz/:quizId
 * - PATCH /api/quiz/:quizId
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuizDetail, updateQuiz } from "@/api/quizzes";
import type { 
    ParentsQuizDetailPathParam,
    ParentsQuizDetailResponseData,
    UpdateQuizPathParam,
    UpdateQuizRequestDto,
    UpdateQuizResponseData,
 } from "pai-shared-types";

 export interface ParentQuizFormValue {
    question: string;
    answer: string;
    hint: string;
    reward: string;
    publishDate: string;
 }

 export function useEditQuiz(quizId: string) {
    const queryClient = useQueryClient();

    // 1. 상세 조회 (수정 폼 채우기용)
    const {
        data: quizDetail,
        isLoading,
        isError,
        error,
    } = useQuery<ParentsQuizDetailResponseData, Error>({
        queryKey: ['parent-quizzes', 'detail', quizId ],
        queryFn: () => {
            const params: ParentsQuizDetailPathParam = { quizId };
            return getQuizDetail(params);
        },
        enabled: !!quizId,
    });

    const initialFormValue: ParentQuizFormValue | null = quizDetail
        ? {
            question: quizDetail.question,
            answer: quizDetail.answer,
            hint: quizDetail.hint ?? '',
            reward: quizDetail.reward ?? '',
            publishDate: quizDetail.publishDate,
          }
        : null;
    const isEditable = quizDetail?.isEditable ?? false;

    // 2. 퀴즈 수정 Mutation
    const updateQuizMutation = useMutation<
        UpdateQuizResponseData,
        Error,
        ParentQuizFormValue
    >({
        mutationFn: (formValue) => {
            const path: UpdateQuizPathParam = { quizId };

            const payload: UpdateQuizRequestDto = {
                question: formValue.question.trim(),
                answer: formValue.answer.trim(),
                hint: formValue.hint.trim() === '' ? null :  formValue.hint,
                reward: formValue.reward.trim() === '' ? null : formValue.reward,
                publishDate: formValue.publishDate,
            };

            return updateQuiz(path, payload);
        },

        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['parent-quizzes', 'scheduled']});
            queryClient.invalidateQueries({ queryKey: ['parent-quizzes', 'detail', quizId]});
        },
    });

    return {
        quizDetail,
        initialFormValue,
        isEditable,
        isLoading,
        isError,
        error,

        updateQuiz: updateQuizMutation.mutate,
        isUpdating: updateQuizMutation.isPending,
        updateError: updateQuizMutation.error,
        updatedQuiz: updateQuizMutation.data,
    };
 }