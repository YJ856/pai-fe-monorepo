/**
 * 완료한 퀴즈 Custom Hook
 *
 * 역할:
 * - 백엔드에서 완료한 퀴즈 데이터 가져오기 (useQuery)
 * - 백엔드 데이터를 index.tsx의 Quiz 형식으로 변환
 * - 날짜별로 그룹화
 * - 아바타 이미지 URL 조회 (useMediaUrls)
 *
 * API:
 * - GET /api/quiz/children/completed
 * - GET /api/media?mediaIds=...
 */

import { useQuery } from '@tanstack/react-query';
import { getChildCompletedQuizzes } from '../../../../api/quizzes';
import type { ChildrenCompletedQueryParam, ChildrenCompletedResponseData } from 'pai-shared-types';
import type { ChildQuizViewModel } from '../_types/childQuizViewModel';
import { useMediaUrls } from '../../../../hooks/useMediaUrls';
import { useMemo } from 'react';

export function usePastQuizzes() {
  // 1. 완료한 퀴즈 조회
  const {
    data: completedQuizzesData,
    isLoading: isLoadingQuizzes,
    isError,
    error,
  } = useQuery<ChildrenCompletedResponseData, Error>({
    queryKey: ['child-quizzes', 'completed'],
    queryFn: () => {
      const params: ChildrenCompletedQueryParam = { limit: 20 };
      return getChildCompletedQuizzes(params);
    },
  });

  // 2. 모든 mediaId 수집 (부모 아바타)
  const allMediaIds = useMemo(() => {
    if (!completedQuizzesData) return [];

    const ids: (string | null)[] = [];
    completedQuizzesData.items.forEach((item) => {
      ids.push(item.authorParentAvatarMediaId);
    });
    return ids;
  }, [completedQuizzesData]);

  // 3. Media URL 조회
  const { mediaUrlMap, isLoading: isLoadingMedia } = useMediaUrls(allMediaIds);

  // 4. 백엔드 데이터 → ChildQuizViewModel 형식으로 변환 (URL 포함)
  const pastQuizzes: ChildQuizViewModel[] = useMemo(() => {
    if (!completedQuizzesData) return [];

    return completedQuizzesData.items.map((item) => ({
      id: item.quizId,
      question: item.question,
      answer: item.answer,
      hint: undefined, // 완료된 퀴즈에는 hint 필드가 없으니까 일단 비워두기
      reward: item.reward ?? '보상 없음',
      authorName: item.authorParentName,
      authorAvatarMediaId: item.authorParentAvatarMediaId,
      authorAvatarUrl: item.authorParentAvatarMediaId ? mediaUrlMap[item.authorParentAvatarMediaId] : undefined,
      date: new Date(item.publishDate), // 예전처럼 그냥 new Date(...) 그대로 사용
      solved: true,
      childAnswer: item.answer,
    }));
  }, [completedQuizzesData, mediaUrlMap]);

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
    isLoading: isLoadingQuizzes || isLoadingMedia,
    isError,
    error,
  };
}
