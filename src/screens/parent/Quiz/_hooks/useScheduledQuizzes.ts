/**
 * 부모 예정된 퀴즈 Custom Hook
 *
 * 역할:
 * - 백엔드에서 예정된 퀴즈 데이터 가져오기 (useQuery)
 * - 백엔드 데이터를 화면에서 사용하는 Quiz 형식으로 변환
 * - 아바타 이미지 URL 조회 (useMediaUrls)
 *
 * API:
 * - GET /api/quiz/parents/scheduled
 * - GET /api/media?mediaIds=...
 */

import { useQuery } from '@tanstack/react-query';
import { getParentScheduledQuizzes } from '../../../../api/quizzes';
import type { ParentsScheduledQueryParam, ParentsScheduledResponseData } from 'pai-shared-types';
import type { ParentQuizViewModel } from '../_types/parentQuizViewModel';
import { useMediaUrls } from '../../../../hooks/useMediaUrls';
import { useMemo } from 'react';

export function useScheduledQuizzes() {
  // 1. 예정된 퀴즈 조회
  const {
    data: scheduledQuizzesData,
    isLoading: isLoadingQuizzes,
    isError,
    error,
  } = useQuery<ParentsScheduledResponseData, Error>({
    queryKey: ['parent-quizzes', 'scheduled'],
    queryFn: () => {
      const params: ParentsScheduledQueryParam = { limit: 20 };
      return getParentScheduledQuizzes(params);
    },
  });

  // 2. 모든 mediaId 수집 (부모 아바타)
  const allMediaIds = useMemo(() => {
    if (!scheduledQuizzesData) return [];

    const ids: (string | null)[] = [];
    scheduledQuizzesData.items.forEach((item) => {
      ids.push(item.authorParentAvatarMediaId);
    });
    return ids;
  }, [scheduledQuizzesData]);

  // 3. Media URL 조회
  const { mediaUrlMap, isLoading: isLoadingMedia } = useMediaUrls(allMediaIds);

  // 4. 백엔드 데이터 → ParentQuizViewModel 형식으로 변환 (URL 포함)
  const scheduledQuizzes: ParentQuizViewModel[] = useMemo(() => {
    if (!scheduledQuizzesData) return [];

    return scheduledQuizzesData.items.map((item) => ({
      id: item.quizId,
      question: item.question,
      answer: item.answer,
      hint: item.hint ?? undefined,
      reward: item.reward ?? '보상 없음',
      authorName: item.authorParentName,
      authorAvatarMediaId: item.authorParentAvatarMediaId,
      authorAvatarUrl: item.authorParentAvatarMediaId ? mediaUrlMap[item.authorParentAvatarMediaId] : undefined,
      publishDate: new Date(item.publishDate),
      isEditable: item.isEditable,
      children: [],
    }));
  }, [scheduledQuizzesData, mediaUrlMap]);

  return {
    scheduledQuizzes,
    isLoading: isLoadingQuizzes || isLoadingMedia,
    isError,
    error,
  };
}
