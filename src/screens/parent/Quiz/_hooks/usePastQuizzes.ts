/**
 * 부모 지난 퀴즈 Custom Hook
 *
 * 역할:
 * - 백엔드에서 완료된 퀴즈 데이터 가져오기 (useQuery)
 * - 백엔드 데이터를 화면에서 사용하는 Quiz 형식으로 변환
 * - 아바타 이미지 URL 조회 (useMediaUrls)
 *
 * API:
 * - GET /api/quiz/parents/completed
 * - GET /api/media?mediaIds=...
 */

import { useQuery } from '@tanstack/react-query';
import { getParentCompletedQuizzes } from '../../../../api/quizzes';
import type { ParentsCompletedQueryParam, ParentsCompletedResponseData } from 'pai-shared-types';
import type { ParentQuizViewModel, ParentQuizChildViewModel } from '../_types/parentQuizViewModel';
import { useMediaUrls } from '../../../../hooks/useMediaUrls';
import { useMemo } from 'react';

export function usePastQuizzes() {
  // 1. 완료된 퀴즈 조회
  const {
    data: completedQuizzesData,
    isLoading: isLoadingQuizzes,
    isError,
    error,
  } = useQuery<ParentsCompletedResponseData, Error>({
    queryKey: ['parent-quizzes', 'completed'],
    queryFn: () => {
      const params: ParentsCompletedQueryParam = { limit: 20 };
      return getParentCompletedQuizzes(params);
    }
  });

  // 2. 모든 mediaId 수집 (부모 아바타 + 자녀 아바타)
  const allMediaIds = useMemo(() => {
    if (!completedQuizzesData) return [];

    const ids: (string | null)[] = [];
    completedQuizzesData.items.forEach((item) => {
      ids.push(item.authorParentAvatarMediaId);
      item.children.forEach((child) => {
        ids.push(child.childAvatarMediaId);
      });
    });
    return ids;
  }, [completedQuizzesData]);

  // 3. Media URL 조회
  const { mediaUrlMap, isLoading: isLoadingMedia } = useMediaUrls(allMediaIds);

  // 4. 백엔드 데이터 → ParentQuizViewModel 형식으로 변환 (URL 포함)
  const pastQuizzes: ParentQuizViewModel[] = useMemo(() => {
    if (!completedQuizzesData) return [];

    return completedQuizzesData.items.map((item) => ({
      id: item.quizId,
      question: item.question,
      answer: item.answer,
      reward: item.reward ?? '보상 없음',
      authorName: item.authorParentName,
      authorAvatarMediaId: item.authorParentAvatarMediaId,
      authorAvatarUrl: item.authorParentAvatarMediaId ? mediaUrlMap[item.authorParentAvatarMediaId] : undefined,
      publishDate: new Date(item.publishDate),
      children: item.children.map<ParentQuizChildViewModel>((child) => ({
        childProfileId: child.childProfileId,
        childName: child.childName,
        childAvatarMediaId: child.childAvatarMediaId,
        childAvatarUrl: child.childAvatarMediaId ? mediaUrlMap[child.childAvatarMediaId] : undefined,
        isSolved: child.isSolved,
        rewardGranted: child.rewardGranted,
      }))
    }));
  }, [completedQuizzesData, mediaUrlMap]);

  return {
    pastQuizzes,
    isLoading: isLoadingQuizzes || isLoadingMedia,
    isError,
    error,
  };
}
