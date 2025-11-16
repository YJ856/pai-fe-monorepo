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
import type { ParentsScheduledQueryParam, ParentsScheduledResponseData } from 'pai-shared-types';
import type { ParentQuizViewModel } from '../_types/parentQuizViewModel';

export function useScheduledQuizzes() {
  // 1. 예정된 퀴즈 조회
  const {
    data: scheduledQuizzesData,
    isLoading,
    isError,
    error,
  } = useQuery<ParentsScheduledResponseData, Error>({
    queryKey: ['parent-quizzes', 'scheduled'],
    queryFn: () => {
      const params: ParentsScheduledQueryParam = { limit: 20 };
      return getParentScheduledQuizzes(params);
    },
  });

  // 2. 백엔드 데이터 → ParentQuizViewModel 형식으로 변환
  const scheduledQuizzes: ParentQuizViewModel[] =
    scheduledQuizzesData?.items.map((item) => ({
      id: item.quizId,
      question: item.question,
      answer: item.answer,
      hint: item.hint ?? undefined,
      reward: item.reward ?? '보상 없음',
      authorName: item.authorParentName,
      authorAvatarMediaId: item.authorParentAvatarMediaId,
      publishDate: new Date(item.publishDate),
      isEditable: item.isEditable,
      children: [],
    })) ?? [];

  return {
    scheduledQuizzes,
    isLoading,
    isError,
    error,
  };
}
