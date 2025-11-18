/**
 * Media URL 조회 Custom Hook
 *
 * 역할:
 * - mediaId 배열을 받아서 cdnUrl Map으로 반환
 * - React Query로 캐싱 처리
 *
 * 사용 예시:
 * const { mediaUrlMap, isLoading } = useMediaUrls(['123', '456']);
 * const avatarUrl = mediaUrlMap['123'];
 */

import { useQuery } from '@tanstack/react-query';
import { getMedia } from '../api/media';

interface MediaItem {
  mediaId: string;
  cdnUrl: string;
  fileName: string;
  mimeType: string;
  createdAt: string;
}

export function useMediaUrls(mediaIds: (string | null | undefined)[]) {
  // null, undefined 제거하고 unique한 값만 추출
  const validMediaIds = [...new Set(mediaIds.filter((id): id is string => !!id))];

  const {
    data: mediaList,
    isLoading,
    isError,
    error,
  } = useQuery<MediaItem[], Error>({
    queryKey: ['media', 'urls', validMediaIds.sort().join(',')],
    queryFn: async () => {
      if (validMediaIds.length === 0) {
        return [];
      }
      // 백엔드: GET /api/media?mediaIds=123,456,789
      const response = await getMedia({ mediaIds: validMediaIds.join(',') });

      // getMedia()는 이미 배열을 반환함
      const mediaArray = Array.isArray(response) ? response : (response.media || []);
      return mediaArray;
    },
    enabled: validMediaIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: 1,
  });

  // mediaId → cdnUrl 매핑
  const mediaUrlMap: Record<string, string> = {};
  mediaList?.forEach((item) => {
    mediaUrlMap[item.mediaId] = item.cdnUrl;
  });

  return {
    mediaUrlMap,
    isLoading,
    isError,
    error,
  };
}
