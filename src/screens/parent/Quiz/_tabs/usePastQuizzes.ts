/**
 * 부모 지난 퀴즈 Custom Hook
 *
 * 역할:
 * - 백엔드에서 완료된 퀴즈 데이터 가져오기 (useQuery)
 * - 백엔드 데이터를 화면에서 사용하는 Quiz 형식으로 변환
 *
 * API:
 * - GET /api/quiz/parents/completed
 */

import { useQuery } from '@tanstack/react-query';
import { getParentCompletedQuizzes } from '../../../../api/quizzes';
import type { ParentsCompletedResponseData } from 'pai-shared-types';

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

export function usePastQuizzes() {
  // 1. 완료된 퀴즈 조회
  const {
    data: completedQuizzesData,
    isLoading,
    error,
  } = useQuery<ParentsCompletedResponseData>({
    queryKey: ['parent-quizzes', 'completed'],
    queryFn: () => getParentCompletedQuizzes({ limit: 20 }),
  });

  // 2. 백엔드 데이터 → Quiz 형식으로 변환
  const pastQuizzes: Quiz[] =
    completedQuizzesData?.items.map((item) => ({
      id: item.quizId,
      question: item.question,
      answer: item.answer,
      hint: undefined, // 완료된 퀴즈 DTO에는 hint 정보 없음
      reward: item.reward || undefined,
      author: item.authorParentName,
      authorAvatar: item.authorParentAvatarMediaId || undefined,
      date: new Date(item.publishDate),
      childSolutions: item.children.map((child) => ({
        childId: child.childProfileId.toString(),
        childName: child.childName,
        childAvatar: child.childAvatarMediaId || undefined,
        solved: child.isSolved,
        rewardGiven: child.rewardGranted,
      })),
    })) ?? [];

  return {
    pastQuizzes,
    isLoading,
    error,
  };
}
