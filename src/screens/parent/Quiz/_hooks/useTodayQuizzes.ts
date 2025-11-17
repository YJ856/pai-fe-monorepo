/**
 * 부모 오늘의 퀴즈 Custom Hook
 *
 * 역할:
 * - 백엔드에서 오늘의 퀴즈 데이터 가져오기 (useQuery)
 * - 백엔드 데이터를 화면에서 사용하는 Quiz 형식으로 변환
 * - 아바타 이미지 URL 조회 (useMediaUrls)
 *
 * API:
 * - GET /api/quiz/parents/today
 * - GET /api/media?mediaIds=...
 */

import { useQuery } from '@tanstack/react-query';
import { getParentTodayQuizzes } from '../../../../api/quizzes';
import type { ParentsTodayQueryParam, ParentsTodayResponseData } from 'pai-shared-types';
import type { ParentQuizViewModel, ParentQuizChildViewModel } from '../_types/parentQuizViewModel';
import { useMediaUrls } from '../../../../hooks/useMediaUrls';
import { useMemo } from 'react';

export function useTodayQuizzes() {
  // 1. 오늘의 퀴즈 조회
  const {
    data: todayQuizzesData,
    isLoading: isLoadingQuizzes,
    isError,
    error,
  } = useQuery<ParentsTodayResponseData, Error>({
    queryKey: ['parent-quizzes', 'today'],
    queryFn: () => {
      const params: ParentsTodayQueryParam = { limit: 20 };
      return getParentTodayQuizzes(params);
    },
  });

  // 2. 모든 mediaId 수집 (부모 아바타 + 자녀 아바타)
  const allMediaIds = useMemo(() => {
    if (!todayQuizzesData) return [];

    const ids: (string | null)[] = [];
    todayQuizzesData.items.forEach((item) => {
      ids.push(item.authorParentAvatarMediaId);
      item.children.forEach((child) => {
        ids.push(child.childAvatarMediaId);
      });
    });
    return ids;
  }, [todayQuizzesData]);

  // 3. Media URL 조회
  const { mediaUrlMap, isLoading: isLoadingMedia } = useMediaUrls(allMediaIds);

  // 4. 백엔드 데이터 → ParentQuizViewModel 형식으로 변환 (URL 포함)
  const todayQuizzes: ParentQuizViewModel[] = useMemo(() => {
    if (!todayQuizzesData) return [];

    return todayQuizzesData.items.map((item) => ({
      id: item.quizId,
      question: item.question,
      answer: item.answer,
      hint: item.hint ?? undefined,
      reward: item.reward ?? '보상 없음',
      authorName: item.authorParentName,
      authorAvatarMediaId: item.authorParentAvatarMediaId,
      authorAvatarUrl: item.authorParentAvatarMediaId ? mediaUrlMap[item.authorParentAvatarMediaId] : undefined,
      publishDate: new Date(), // 오늘의 퀴즈이므로 현재 날짜
      children: item.children.map<ParentQuizChildViewModel>((child) => ({
        childProfileId: child.childProfileId,
        childName: child.childName,
        childAvatarMediaId: child.childAvatarMediaId,
        childAvatarUrl: child.childAvatarMediaId ? mediaUrlMap[child.childAvatarMediaId] : undefined,
        isSolved: child.isSolved,
        rewardGranted: undefined,
      })),
      isEditable: undefined,
    }));
  }, [todayQuizzesData, mediaUrlMap]);

  return {
    todayQuizzes,
    isLoading: isLoadingQuizzes || isLoadingMedia,
    isError,
    error,
  };
}
