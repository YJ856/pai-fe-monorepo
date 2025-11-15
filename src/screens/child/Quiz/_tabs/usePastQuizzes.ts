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

import { useQuery } from '@tanstack/react-query';
import { getChildCompletedQuizzes } from '../../../../api/quizzes';
import type { ChildrenCompletedResponseData } from 'pai-shared-types';

export interface Quiz {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  reward: string;
  author: string;
  date: Date;
  solved?: boolean;
  childAnswer?: string;
}

export function usePastQuizzes() {
  // 1. 완료한 퀴즈 조회
  const {
    data: completedQuizzesData,
    isLoading,
    error,
  } = useQuery<ChildrenCompletedResponseData>({
    queryKey: ['child-quizzes', 'completed'],
    queryFn: () => getChildCompletedQuizzes({ limit: 20 }),
  });

  // 2. 백엔드 데이터 → Quiz 형식으로 변환
  const pastQuizzes: Quiz[] =
    completedQuizzesData?.items.map((item) => ({
      id: item.quizId,
      question: item.question,
      answer: item.answer,
      reward: item.reward || '보상 없음',
      author: item.authorParentName,
      date: new Date(item.publishDate),
      solved: true,
      childAnswer: item.answer,
    })) ?? [];

  // 3. 날짜별로 그룹화
  const groupQuizzesByDate = (quizzes: Quiz[]) => {
    const grouped: Record<string, Quiz[]> = {};

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
    error,
  };
}
