/**
 * 완료한 퀴즈 Custom Hook
 *
 * 역할:
 * - 백엔드에서 완료한 퀴즈 데이터 가져오기 (useQuery)
 * - 백엔드 데이터를 index.tsx의 Quiz 형식으로 변환
 * - 날짜별로 그룹화
 *
 * API:
 * - GET /api/quiz/children/completed
 */

// 

import { useQuery } from '@tanstack/react-query';
import { getChildCompletedQuizzes } from '../../../../api/quizzes';
import type { ChildrenCompletedQueryParam, ChildrenCompletedResponseData } from 'pai-shared-types';
import type { ChildQuizViewModel } from '../_types/childQuizViewModel';

export function usePastQuizzes() {
  // 1. 완료한 퀴즈 조회
  const {
    data: completedQuizzesData,
    isLoading,
    isError,
    error,
  } = useQuery<ChildrenCompletedResponseData, Error>({
    queryKey: ['child-quizzes', 'completed'],
    queryFn: () => {
      const params: ChildrenCompletedQueryParam = { limit: 20 };
      return getChildCompletedQuizzes(params);
    },
  });

  // 2. 백엔드 데이터 → ChildQuizViewModel 형식으로 변환
  const pastQuizzes: ChildQuizViewModel[] =
    completedQuizzesData?.items.map((item) => ({
      id: item.quizId,
      question: item.question,
      answer: item.answer,
      hint: undefined, // 완료된 퀴즈에는 hint 필드가 없으니까 일단 비워두기
      reward: item.reward ?? '보상 없음',
      authorName: item.authorParentName,
      authorAvatarMediaId: item.authorParentAvatarMediaId,
      date: new Date(item.publishDate), // 예전처럼 그냥 new Date(...) 그대로 사용
      solved: true,
      childAnswer: item.answer,
    })) ?? [];

  // 3. 날짜별로 그룹화
  const groupQuizzesByDate = (quizzes: ChildQuizViewModel[]) => {
    const grouped: Record<string, ChildQuizViewModel[]> = {};

    quizzes.forEach((quiz) => {
      const dateKey = quiz.date.toLocaleDateString('ko-KR');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(quiz);
    });

    return grouped;
  };

  const pastQuizzesByDate = groupQuizzesByDate(pastQuizzes);

  return {
    pastQuizzes,
    pastQuizzesByDate,
    isLoading,
    isError,
    error,
  };
}
