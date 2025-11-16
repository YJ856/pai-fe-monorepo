/**
 * 오늘의 퀴즈 Custom Hook
 *
 * 역할:
 * - 백엔드에서 오늘의 퀴즈 데이터 가져오기 (useQuery)
 * - 정답 제출 (useMutation)
 * - 백엔드 데이터를 index.tsx의 Quiz 형식으로 변환
 *
 * API:
 * - GET /api/quiz/children/today
 * - POST /api/quiz/children/:quizId/answer
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChildTodayQuizzes, answerQuiz } from '../../../../api/quizzes';
import type {
  ChildrenTodayQueryParam,
  ChildrenTodayResponseData,
  AnswerQuizPathParam,
  AnswerQuizRequestDto,
  AnswerQuizResponseData,
} from 'pai-shared-types';
import type { ChildQuizViewModel } from '../_types/childQuizViewModel';

export function useTodayQuizzes() {
  const queryClient = useQueryClient();

  // 1. 오늘의 퀴즈 조회
  const {
    data: todayQuizzesData,
    isLoading,
    isError,
    error,
  } = useQuery<ChildrenTodayResponseData, Error>({
    queryKey: ['child-quizzes', 'today'],
    queryFn: () => {
      const params: ChildrenTodayQueryParam = { limit: 20 };
      return getChildTodayQuizzes(params);
    }
  });

  // 2. 백엔드 데이터 → ChildQuizViewModel 형식으로 변환
  const todayQuizzes: ChildQuizViewModel[] =
    todayQuizzesData?.items.map((item) => ({
      id: item.quizId,
      question: item.question,
      answer: item.answer ?? '', // isSolved일 때는 정답이 내려옴
      hint: item.hint ?? undefined,
      reward: item.reward ?? '보상 없음',
      authorName: item.authorParentName,
      authorAvatarMediaId: item.authorParentAvatarMediaId,
      date: new Date(), // 오늘의 퀴즈이니, 일단 "지금" 날짜로 세팅 (필요하면 서버 기준 날짜 필드 추가해서 매핑 가능)
      solved: item.isSolved,
      childAnswer: undefined, // 아이가 제출한 답을 따로 내려주면 여기에 매핑 가능 (지금은 없음)
    })) ?? [];

  // 3. 정답 제출 Mutation
  const submitAnswerMutation = useMutation<
    AnswerQuizResponseData,
    Error,
    { quizId: string; answer: string }
  >({
    mutationFn: ({ quizId, answer }) => {
      const path: AnswerQuizPathParam = { quizId };
      const body: AnswerQuizRequestDto = { answer };
      return answerQuiz(path, body);
    },
    onSuccess: (result) => {
      // 정답 처리 후 오늘의 퀴즈를 다시 불러오도록 캐시 무효화
      if (result.isSolved) {
        queryClient.invalidateQueries({ queryKey: ['child-quizzes', 'today'] });
      }
    },
  });

  return {
    todayQuizzes,
    isLoading,
    isError,
    error,
    submitAnswer: submitAnswerMutation.mutate,
    isSubmitting: submitAnswerMutation.isPending,
    submitResult: submitAnswerMutation.data,
  };
}
