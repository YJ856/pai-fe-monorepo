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
  CreateVoiceResponseData,
  DeleteProfileResponseData,
  GetProfileResponseData,
  GetProfilesResponseData,
  ProfileType,
  SelectProfileResponseData,
  SynthesizeVoiceRequestDto,
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

/**
 * PATCH /api/profiles/:profileId/voice
 * 음성 등록/수정
 *
 * Request (FormData):
 * - name: string (음성 이름)
 * - files: File[] (음성 파일들)
 *
 * Response:
 * - voiceId: string (ElevenLabs 음성 ID)
 *
 * 사용 예시:
 * const formData = new FormData();
 * formData.append('name', 'Parent Voice');
 * formData.append('files', {
 *   uri: recordingUri,
 *   type: 'audio/wav',
 *   name: 'voice.wav',
 * });
 * const { voiceId } = await createProfileVoice(profileId, formData);
 */
export const createProfileVoice = async (
  profileId: string,
  formData: FormData
) => {
  console.log("[VOICE] 음성 등록 요청 시작, profileId:", profileId);

  const response = await userServiceClient.patch<
    BaseResponse<CreateVoiceResponseData>
  >(`/api/profiles/${profileId}/voice`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  console.log("[VOICE] 음성 등록 응답:", response.data);
  return response.data.data!;
};

/**
 * POST /api/profiles/:profileId/voice/synthesize
 * TTS 음성 합성 (텍스트 → 음성)
 *
 * Request:
 * - text: string (음성으로 변환할 텍스트)
 *
 * Response:
 * - audio/mpeg (MP3 오디오 데이터)
 *
 * 사용 예시:
 * const audioBlob = await synthesizeVoice('6', { text: 'Hello, World!' });
 * // audioBlob을 Audio 컴포넌트에서 재생
 */
export const synthesizeVoice = async (
  profileId: string,
  data: SynthesizeVoiceRequestDto
): Promise<Blob> => {
  console.log("[TTS] 음성 합성 요청 시작, profileId:", profileId, "text:", data.text);

  const response = await userServiceClient.post(
    `/api/profiles/${profileId}/voice/synthesize`,
    data,
    {
      responseType: 'blob', // 바이너리 오디오 데이터를 blob으로 받음
    }
  );

  console.log("[TTS] 음성 합성 응답 받음, size:", response.data.size);
  return response.data;
};
