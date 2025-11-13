/**
 * 미디어 API (파일 업로드/조회)
 *
 * 백엔드: pai-service-media (/api/media)
 *
 * 주요 기능:
 * - 파일 업로드 (이미지, 음성 등)
 * - 미디어 조회 (소유자별 필터링)
 * - S3 업로드 + CDN URL 반환
 *
 * 사용처:
 * - 프로필 아바타 업로드
 * - 음성 파일 업로드
 * - 대화 중 이미지 업로드
 */

import { mediaServiceClient } from './client/axios';

/**
 * POST /api/media/upload
 * 파일 업로드 (multipart/form-data)
 *
 * Request (FormData):
 * - file: File (필수)
 *
 * Response:
 * - mediaId: string
 * - cdnUrl: string (CDN URL, 이미지 표시에 사용)
 * - fileName: string
 * - mimeType: string
 * - fileSize: number
 *
 * React Native 사용 예시:
 * const formData = new FormData();
 * formData.append('file', {
 *   uri: imageUri,
 *   type: 'image/jpeg',
 *   name: 'avatar.jpg',
 * });
 * const { mediaId, cdnUrl } = await uploadMedia(formData);
 */
export const uploadMedia = async (formData: FormData) => {
  console.log('[MEDIA] 업로드 요청 시작');
  console.log('[MEDIA] FormData 내용:', {
    // FormData는 직접 출력 불가하므로 설명만
    note: 'FormData에는 file만 포함됨'
  });

  const response = await mediaServiceClient.post('/api/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log('[MEDIA] 업로드 응답:', response.data);
  return response.data.data;
};

/**
 * GET /api/media
 * 미디어 조회
 *
 * Query: 없음 (전체 미디어 조회)
 *
 * Response:
 * - media: Array<{
 *     id: string,
 *     fileName: string,
 *     mimeType: string,
 *     fileSize: number,
 *     cdnUrl: string,
 *     createdAt: string
 *   }>
 *
 * 사용 예시:
 * const { media } = await getMedia();
 */
export const getMedia = async (params?: {
  // 향후 필터링 파라미터가 추가될 수 있음
}) => {
  const response = await mediaServiceClient.get('/api/media', {
    params,
  });
  return response.data.data;
};
