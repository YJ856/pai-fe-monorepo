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
import type { ParentsCompletedQueryParam, ParentsCompletedResponseData } from 'pai-shared-types';
import type { ParentQuizViewModel, ParentQuizChildViewModel } from '../_types/parentQuizViewModel';

export function usePastQuizzes() {
  // 1. 완료된 퀴즈 조회
  const {
    data: completedQuizzesData,
    isLoading,
    isError,
    error,
  } = useQuery<ParentsCompletedResponseData, Error>({
    queryKey: ['parent-quizzes', 'completed'],
    queryFn: () => {
      const params: ParentsCompletedQueryParam = { limit: 20 };
      return getParentCompletedQuizzes(params);
    }
  });

  // 2. 백엔드 데이터 → ParentQuizViewModel 형식으로 변환
  const pastQuizzes: ParentQuizViewModel[] =
    completedQuizzesData?.items.map((item) => ({
      id: item.quizId,
      question: item.question,
      answer: item.answer,
      reward: item.reward ?? '보상 없음',
      authorName: item.authorParentName,
      authorAvatarMediaId: item.authorParentAvatarMediaId,
      publishDate: new Date(item.publishDate),
      children: item.children.map<ParentQuizChildViewModel>((child) => ({
        childProfileId: child.childProfileId,
        childName: child.childName,
        childAvatarMediaId: child.childAvatarMediaId,
        isSolved: child.isSolved,
        rewardGranted: child.rewardGranted,
      }))
    })) ?? [];

  return {
    pastQuizzes,
    isLoading,
    isError,
    error,
  };
}
