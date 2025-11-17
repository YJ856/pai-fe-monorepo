/**
 * 부모 퀴즈 삭제 Custom Hook
 *
 * 역할:
 * - 특정 퀴즈 삭제 (useMutation)
 * - 삭제 성공 시 관련 목록/상세 캐시 무효화
 *
 * API:
 * - DELETE /api/quiz/:quizId
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteQuiz } from "@/api/quizzes";
import type { DeleteQuizPathParam, DeleteQuizResponseData } from "pai-shared-types";

export function useDeleteQuiz() {
    const queryClient = useQueryClient();

    // 1. 삭제 Mutation
    const deleteQuizMutation = useMutation<
        DeleteQuizResponseData,
        Error,
        { quizId: string }
    >({
        mutationFn: ({ quizId }) => {
            const path: DeleteQuizPathParam = { quizId };
            return deleteQuiz(path);
        },
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ['parent-quizzes', 'today']});
            queryClient.invalidateQueries({ queryKey: ['parent-quizzes', 'scheduled']});
            queryClient.invalidateQueries({
                queryKey: ['parent-quizzes', 'detail', variables.quizId],
            });
            // 퀴즈 삭제 시 다음 출제일이 변경될 수 있으므로 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ['parent-quizzes', 'next-publish-date']});
        },
    });

    return {
        deleteQuiz: deleteQuizMutation.mutate,
        isDeleting: deleteQuizMutation.isPending,
        deleteError: deleteQuizMutation.error,
        deletedQuiz: deleteQuizMutation.data,
    };
}