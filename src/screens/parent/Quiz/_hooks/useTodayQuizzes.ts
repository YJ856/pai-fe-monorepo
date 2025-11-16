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
import type { ParentsTodayQueryParam, ParentsTodayResponseData } from 'pai-shared-types';
import type { ParentQuizViewModel, ParentQuizChildViewModel } from '../_types/parentQuizViewModel';

export function useTodayQuizzes() {
  // 1. 오늘의 퀴즈 조회
  const {
    data: todayQuizzesData,
    isLoading,
    isError,
    error,
  } = useQuery<ParentsTodayResponseData, Error>({
    queryKey: ['parent-quizzes', 'today'],
    queryFn: () => {
      const params: ParentsTodayQueryParam = { limit: 20 };
      return getParentTodayQuizzes(params);
    },
  });

  // 2. 백엔드 데이터 → ParentQuizViewModel 형식으로 변환
  const todayQuizzes: ParentQuizViewModel[] =
    todayQuizzesData?.items.map((item) => ({
      id: item.quizId,
      question: item.question,
      answer: item.answer,
      hint: item.hint ?? undefined,
      reward: item.reward ?? '보상 없음',
      authorName: item.authorParentName,
      authorAvatarMediaId: item.authorParentAvatarMediaId,
      publishDate: new Date(), // 오늘의 퀴즈이므로 현재 날짜
      children: item.children.map<ParentQuizChildViewModel>((child) => ({
        childProfileId: child.childProfileId,
        childName: child.childName,
        childAvatarMediaId: child.childAvatarMediaId,
        isSolved: child.isSolved,
        rewardGranted: undefined,
      })),
      isEditable: undefined,
    })) ?? [];

  return {
    todayQuizzes,
    isLoading,
    isError,
    error,
  };
}
