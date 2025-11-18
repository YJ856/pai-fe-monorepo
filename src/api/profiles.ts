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

import {
  BaseResponse,
  CreateProfileRequestDto,
  DeleteProfileResponseData,
  GetProfileResponseData,
  GetProfilesResponseData,
  ProfileType,
  SelectProfileResponseData,
  UpdateProfileRequestDto,
  UpdateProfileResponseData,
} from "pai-shared-types";
import { userServiceClient } from "./client/axios";

/**
 * POST /api/profiles
 * 프로필 생성
 */
export const createProfile = async (data: CreateProfileRequestDto) => {
  const response = await userServiceClient.post("/api/profiles", data);
  return response.data.data;
};

/**
 * GET /api/profiles?profileType=parent|child
 * 프로필 목록 조회
 *
 * Query:
 * - profileType: 'parent' | 'child' (선택적, 필터링용)
 *
 * Response:
 * - { profiles: [...] }
 */
export const getProfiles = async (profileType?: ProfileType) => {
  const response = await userServiceClient.get<
    BaseResponse<GetProfilesResponseData>
  >("/api/profiles", {
    params: { profileType },
  });
  return response.data.data?.profiles;
};

export const getProfile = async (profileId: string) => {
  const response = await userServiceClient.get<
    BaseResponse<GetProfileResponseData>
  >("/api/profiles", {
    params: profileId,
  });
  return response.data.data;
};

/**
 * PATCH /api/profiles/:profileId
 * 프로필 수정
 */
export const updateProfile = async (
  profileId: string,
  data: UpdateProfileRequestDto
) => {
  const response = await userServiceClient.patch<
    BaseResponse<UpdateProfileResponseData>
  >(`/api/profiles/${profileId}`, data);
  return response.data.data;
};

/**
 * DELETE /api/profiles/:profileId
 * 프로필 삭제
 */
export const deleteProfile = async (profileId: string) => {
  const response = await userServiceClient.delete<
    BaseResponse<DeleteProfileResponseData>
  >(`/api/profiles/${profileId}`);
  return response.data;
};

/**
 * POST /api/profiles/select
 * 프로필 선택
 *
 * Request:
 * - profileId: string
 * - pin?: string (부모 프로필 선택 시 필수)
 *
 * Note: 선택 후 tokenManager.setProfileId()로 저장 필요
 */
export const selectProfile = async (profileId: string, pin?: string) => {
  const response = await userServiceClient.post<
    BaseResponse<SelectProfileResponseData>
  >("/api/profiles/select", {
    profileId,
    pin,
  });
  return response.data.data!;
};
