/**
 * 부모 퀴즈 보상 지급 Custom Hook
 *
 * 역할:
 * - 특정 퀴즈에 대해 특정 자녀에게 보상 지급 (useMutation)
 * - 지급 성공 시 관련 목록 캐시 무효화
 *
 * API:
 * - PATCH /api/quiz/:quizId/:childProfileId/reward
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { grantQuizReward } from "@/api/quizzes";
import type { ParentsGrantRewardPathParam, ParentsGrantRewardRequestDto, ParentsGrantRewardResponseData } from "pai-shared-types";

interface GrantRewardVariables {
    quizId: string;
    childProfileId: number;
    payload: ParentsGrantRewardRequestDto;
}

export function useGrantQuizReward() {
    const queryClient = useQueryClient();

    const grantRewardMutation = useMutation<
        ParentsGrantRewardResponseData,
        Error,
        GrantRewardVariables
    >({
        // 1. 실제 API 호출 부분
        mutationFn: ({ quizId, childProfileId, payload }) => {
            const path: ParentsGrantRewardPathParam = { quizId, childProfileId };
            return grantQuizReward(path, payload);
        },

        // 2. 성공 시 캐시 무효화 및 리패치
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['parent-quizzes', 'completed'],
                refetchType: 'active' // 활성화된 쿼리만 즉시 리패치
            });
        },
    });

    return {
        grantReward: grantRewardMutation.mutate,
        isGranting: grantRewardMutation.isPending,
        grantError: grantRewardMutation.error,
        grantedResult: grantRewardMutation.data,
    };
}