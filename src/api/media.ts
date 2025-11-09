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
 * - ownerType: string (예: 'profile', 'conversation')
 * - ownerId: string (프로필 ID, 대화 ID 등)
 * - profileId: string (업로드한 사용자 프로필 ID)
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
 * formData.append('ownerType', 'profile');
 * formData.append('ownerId', profileId);
 * const { mediaId, cdnUrl } = await uploadMedia(formData);
 */
export const uploadMedia = async (formData: FormData) => {
  const response = await mediaServiceClient.post('/api/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

/**
 * GET /api/media?ownerType=&ownerId=&profileId=
 * 미디어 조회
 *
 * Query (모두 선택적):
 * - ownerType: string (예: 'profile', 'conversation')
 * - ownerId: string (소유자 ID)
 * - profileId: string (프로필 ID)
 *
 * Response:
 * - media: Array<{
 *     id: string,
 *     fileName: string,
 *     mimeType: string,
 *     fileSize: number,
 *     cdnUrl: string,
 *     ownerType: string,
 *     ownerId: string,
 *     createdAt: string
 *   }>
 *
 * 사용 예시:
 * const { media } = await getMedia({ ownerType: 'conversation', ownerId: conversationId });
 */
export const getMedia = async (params?: {
  ownerType?: string;
  ownerId?: string;
  profileId?: string;
}) => {
  const response = await mediaServiceClient.get('/api/media', {
    params,
  });
  return response.data.data;
};
