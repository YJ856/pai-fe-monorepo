/**
 * 부모 오늘의 퀴즈 Custom Hook
 *
 * 역할:
 * - 백엔드에서 오늘의 퀴즈 데이터 가져오기 (useQuery)
 * - 백엔드 데이터를 화면에서 사용하는 Quiz 형식으로 변환
 *
 * API:
 * - GET /api/quiz/parents/today
 */

import { useQuery } from '@tanstack/react-query';
import { getParentTodayQuizzes } from '../../../../api/quizzes';
import type { ParentsTodayResponseData } from 'pai-shared-types';

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

export function useTodayQuizzes() {
  // 1. 오늘의 퀴즈 조회
  const {
    data: todayQuizzesData,
    isLoading,
    error,
  } = useQuery<ParentsTodayResponseData>({
    queryKey: ['parent-quizzes', 'today'],
    queryFn: () => getParentTodayQuizzes({ limit: 20 }),
  });

  // 2. 백엔드 데이터 → Quiz 형식으로 변환
  const todayQuizzes: Quiz[] =
    todayQuizzesData?.items.map((item) => ({
      id: item.quizId,
      question: item.question,
      answer: item.answer,
      hint: item.hint || undefined,
      reward: item.reward || undefined,
      author: item.authorParentName,
      authorAvatar: item.authorParentAvatarMediaId || undefined,
      date: new Date(), // 오늘의 퀴즈이므로 현재 날짜
      childSolutions: item.children.map((child) => ({
        childId: child.childProfileId.toString(),
        childName: child.childName,
        childAvatar: child.childAvatarMediaId || undefined,
        solved: child.isSolved,
        rewardGiven: false, // 오늘의 퀴즈 DTO에는 rewardGiven 정보 없음
      })),
    })) ?? [];

  return {
    todayQuizzes,
    isLoading,
    error,
  };
}
