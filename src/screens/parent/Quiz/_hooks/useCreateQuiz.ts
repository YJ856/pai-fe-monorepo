/**
 * 부모 퀴즈 생성 Custom Hook
 *
 * 역할:
 * - 기본 출제일(next publish date) 조회 (useQuery)
 * - 퀴즈 생성 (useMutation)
 * - 생성 후 오늘/예정 퀴즈 목록 캐시 무효화
 *
 * API:
 * - GET /api/quiz/next-publish-date
 * - POST /api/quiz
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNextPublishDate, createQuiz } from "@/api/quizzes";
import type { NextPublishDateData, CreateQuizRequestDto, CreateQuizResponseData } from "pai-shared-types";

export function useCreateQuiz() {
    const queryClient = useQueryClient();

    // 1. 기본 출제일 조회
    const {
        data: nextPublishDateData,
        isLoading,
        isError,
        error,
    } = useQuery<NextPublishDateData, Error>({
        queryKey: ['parent-quizzes', 'next-publish-date'],
        queryFn: () => getNextPublishDate(),
    });

    // 2. 퀴즈 생성 Mutation
    const createQuizMutation = useMutation<
        CreateQuizResponseData,
        Error,
        CreateQuizRequestDto
    >({
        mutationFn: (payload) => createQuiz(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['parent-quizzes', 'today']});
            queryClient.invalidateQueries({ queryKey: ['parent-quizzes', 'scheduled']});
        },
    });

    return {
        nextPublishDate: nextPublishDateData?.defaultPublishDate ?? null,
        isLoading,
        isError,
        error,
        
        createQuiz: createQuizMutation.mutate,
        isCreating: createQuizMutation.isPending,
        createError: createQuizMutation.error,
        createdQuiz: createQuizMutation.data,
    };
}