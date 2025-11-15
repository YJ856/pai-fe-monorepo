/**
 * 부모 예정된 퀴즈 Custom Hook
 *
 * 역할:
 * - 백엔드에서 예정된 퀴즈 데이터 가져오기 (useQuery)
 * - 백엔드 데이터를 화면에서 사용하는 Quiz 형식으로 변환
 *
 * API:
 * - GET /api/quiz/parents/scheduled
 */

import { useQuery } from '@tanstack/react-query';
import { getParentScheduledQuizzes } from '../../../../api/quizzes';
import type { ParentsScheduledResponseData } from 'pai-shared-types';

// 화면에서 쓰는 Quiz 뷰 모델
export interface Quiz {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  reward?: string;
  author: string;
  authorAvatar?: string;
  date: Date;
  childSolutions: ChildSolution[];
}

export interface ChildSolution {
  childId: string;
  childName: string;
  childAvatar?: string;
  solved: boolean;
  rewardGiven?: boolean;
}

export function useScheduledQuizzes() {
  // 1. 예정된 퀴즈 조회
  const {
    data: scheduledQuizzesData,
    isLoading,
    error,
  } = useQuery<ParentsScheduledResponseData>({
    queryKey: ['parent-quizzes', 'scheduled'],
    queryFn: () => getParentScheduledQuizzes({ limit: 20 }),
  });

  // 2. 백엔드 데이터 → Quiz 형식으로 변환
  const scheduledQuizzes: Quiz[] =
    scheduledQuizzesData?.items.map((item) => ({
      id: item.quizId,
      question: item.question,
      answer: item.answer,
      hint: item.hint || undefined,
      reward: item.reward || undefined,
      author: item.authorParentName,
      authorAvatar: item.authorParentAvatarMediaId || undefined,
      date: new Date(item.publishDate),
      childSolutions: [], // 예정된 퀴즈 DTO에는 자녀 정보가 없음
    })) ?? [];

  return {
    scheduledQuizzes,
    isLoading,
    error,
  };
}
