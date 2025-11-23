/**
 * useProfileCreate 훅
 *
 * 프로필 생성 API 로직 처리
 *
 * 주요 기능:
 * - 프로필 생성 API 호출
 * - 이미지 업로드 및 프로필 업데이트
 * - 로딩 상태 관리
 * - 성공/실패 처리
 *
 * API:
 * - POST /api/profiles (api/profiles.ts)
 * - POST /api/media (api/media.ts)
 * - PATCH /api/profiles/:id (api/profiles.ts)
 *
 * 반환값:
 * - isLoading
 * - handleSubmit
 * - handleCancel
 */

import { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { createProfile, updateProfile } from "../../../../api/profiles";
import { uploadMedia } from "../../../../api/media";
import { useProfileStore } from "../../../../store/useProfileStore";
import { ProfileType, Gender } from "../../../../shared/types";

// 기본 이미지 URI 가져오기
async function getDefaultImageUri(): Promise<string | null> {
  try {
    const defaultImage = Asset.fromModule(
      require("../../../../assets/images/default_image.png")
    );
    await defaultImage.downloadAsync();
    return defaultImage.localUri || defaultImage.uri;
  } catch (error) {
    console.error("기본 이미지 로드 오류:", error);
    return null;
  }
}

export function useProfileCreate(
  profileType: ProfileType,
  name: string,
  birthdate: string,
  gender: Gender,
  avatarImage: string | null,
  pin: string,
  validateForm: () => boolean
) {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 1단계: 프로필 먼저 생성 (이미지 없이)
      const profileData: any = {
        profileType,
        name: name.trim(),
        birthDate: birthdate.trim() || undefined,
        gender: gender,
      };

      // 부모 프로필인 경우만 pin 추가
      if (profileType === "parent" && pin) {
        profileData.pin = pin;
      }

      const createdProfile = await createProfile(profileData);

      console.log("프로필 생성 완료:", createdProfile);

      // 2단계: 이미지 처리 (선택된 이미지 또는 기본 이미지)
      const imageToUpload = avatarImage || await getDefaultImageUri();

      if (imageToUpload) {
        try {
          // 프로필 ID 추출 (백엔드 응답에 따라 profileId 또는 id)
          const profileId = createdProfile.profileId || createdProfile.id;

          if (!profileId) {
            throw new Error(
              "프로필 ID를 찾을 수 없습니다. createdProfile: " +
                JSON.stringify(createdProfile)
            );
          }

          console.log("이미지 업로드 시작:");
          console.log("- createdProfile 전체:", createdProfile);
          console.log("- 추출된 프로필 ID:", profileId);
          console.log("- 이미지 URI:", imageToUpload);
          console.log("- 이미지 타입:", avatarImage ? "사용자 선택" : "기본 이미지");

          // FormData 생성 (파일만 전송)
          const formData = new FormData();
          formData.append("file", {
            uri: imageToUpload,
            type: "image/jpeg",
            name: "avatar.jpg",
          } as any);

          // 미디어 업로드
          const uploadResult = await uploadMedia(formData);
          console.log("이미지 업로드 결과:", uploadResult);

          const mediaId = uploadResult.mediaId;
          console.log("추출된 mediaId:", mediaId);

          // 3단계: 프로필에 이미지 연결
          const updatedProfile = await updateProfile(profileId, {
            avatarMediaId: mediaId,
          });

          console.log("프로필 업데이트 완료:", updatedProfile);
        } catch (uploadError: any) {
          console.error("이미지 업로드 오류:", uploadError);
          console.error("에러 상세:", {
            message: uploadError.message,
            response: uploadError.response?.data,
            status: uploadError.response?.status,
          });
          // 이미지 업로드 실패해도 프로필은 생성되었으므로 경고만 표시
          Alert.alert(
            "경고",
            "프로필은 생성되었으나 이미지 업로드에 실패했습니다.\n나중에 프로필 편집에서 이미지를 추가할 수 있습니다.",
            [
              {
                text: "확인",
                onPress: () => {
                  // Zustand store 비우기 -> ProfileSelect에서 API 재호출하도록
                  useProfileStore.getState().setProfiles([]);
                  navigation.goBack();
                },
              },
            ]
          );
          return;
        }
      }

      // 성공 메시지
      Alert.alert("성공", "프로필이 생성되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            // Zustand store 비우기 -> ProfileSelect에서 API 재호출하도록
            useProfileStore.getState().setProfiles([]);
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error("프로필 생성 오류:", error);
      Alert.alert(
        "오류",
        error.response?.data?.message || "프로필 생성 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert("취소", "프로필 생성을 취소하시겠습니까?", [
      {
        text: "계속 작성",
        style: "cancel",
      },
      {
        text: "취소",
        style: "destructive",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return {
    isLoading,
    handleSubmit,
    handleCancel,
  };
}
