/**
 * 프로필 API
 *
 * 백엔드: pai-service-user (/api/profiles)
 *
 * 주요 기능:
 * - 프로필 생성 (부모/자녀)
 * - 프로필 목록 조회
 * - 프로필 수정
 * - 프로필 삭제
 * - 프로필 선택 (앱 진입 시)
 *
 * 프로필 타입:
 * - parent: 부모 프로필
 * - child: 자녀 프로필
 */

import { userServiceClient } from './client/axios';

export type ProfileType = 'parent' | 'child';

export interface CreateProfileRequest {
  profileType: ProfileType;
  name: string;
  birthDate?: string; // YYYY-MM-DD
  gender?: 'male' | 'female' | 'other';
  avatarMediaId?: string; // media 서비스에서 업로드 후 받은 ID
  voiceMediaId?: string; // 음성 파일 ID
  pinHash?: string; // 자녀 프로필용 PIN
}

export interface UpdateProfileRequest {
  name?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  avatarMediaId?: string;
  voiceMediaId?: string;
  pinHash?: string;
}

/**
 * POST /api/profiles
 * 프로필 생성
 */
export const createProfile = async (data: CreateProfileRequest) => {
  const response = await userServiceClient.post('/api/profiles', data);
  return response.data.data;
};

/**
 * GET /api/profiles?profileType=parent|child
 * 프로필 목록 조회
 *
 * Query:
 * - profileType: 'parent' | 'child' (선택적, 필터링용)
 */
export const getProfiles = async (profileType?: ProfileType) => {
  const response = await userServiceClient.get('/api/profiles', {
    params: { profileType },
  });
  return response.data.data;
};

/**
 * PATCH /api/profiles/:profileId
 * 프로필 수정
 */
export const updateProfile = async (profileId: string, data: UpdateProfileRequest) => {
  const response = await userServiceClient.patch(`/api/profiles/${profileId}`, data);
  return response.data.data;
};

/**
 * DELETE /api/profiles/:profileId
 * 프로필 삭제
 */
export const deleteProfile = async (profileId: string) => {
  const response = await userServiceClient.delete(`/api/profiles/${profileId}`);
  return response.data;
};

/**
 * POST /api/profiles/select
 * 프로필 선택
 *
 * Request:
 * - profileId: string
 *
 * Note: 선택 후 tokenManager.setProfileId()로 저장 필요
 */
export const selectProfile = async (profileId: string) => {
  const response = await userServiceClient.post('/api/profiles/select', {
    profileId,
  });
  return response.data.data;
};
