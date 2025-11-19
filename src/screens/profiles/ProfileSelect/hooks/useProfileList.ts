/**
 * useProfileList 훅
 *
 * 프로필 목록 로드 및 관리
 *
 * 주요 기능:
 * - 프로필 목록 API 호출
 * - 아바타 이미지 URL 패칭
 * - Zustand store와 연동
 * - 새로고침 기능
 *
 * API:
 * - GET /api/profiles (api/profiles.ts)
 * - GET /api/media (api/media.ts)
 *
 * 반환값:
 * - profiles (from Zustand store)
 * - isLoading
 * - refreshing
 * - loadProfiles
 * - onRefresh
 */

import { useState } from "react";
import { Alert } from "react-native";
import { getProfiles } from "../../../../api/profiles";
import { getMedia } from "../../../../api/media";
import { useProfileStore } from "../../../../store/useProfileStore";

export function useProfileList() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { profiles, setProfiles } = useProfileStore();

  const loadProfiles = async () => {
    setIsLoading(true);

    try {
      // Zustand store에 이미 프로필 목록이 있는지 확인
      const storeProfiles = useProfileStore.getState().profiles;

      if (storeProfiles.length > 0) {
        console.log(
          "Zustand store에 저장된 프로필 사용 (API 호출 생략):",
          storeProfiles.length
        );
        setIsLoading(false);
        return;
      }

      // Store에 프로필이 없을 때만 API 호출
      console.log("프로필 목록 로드 시작...");
      const profileList = await getProfiles("all");
      console.log("프로필 목록 로드 완료:", profileList);
      console.log("프로필 개수:", profileList?.length || 0);

      // 배열인지 확인 및 데이터 변환
      if (Array.isArray(profileList)) {
        // API 응답 데이터를 앱 타입으로 변환
        const baseProfiles = profileList.map((profile: any) => ({
          profileId: Number(profile.profileId || profile.id),
          userId: Number(profile.userId),
          profileType: profile.profileType,
          name: profile.name,
          birthDate: profile.birthDate || profile.birthdate,
          gender: profile.gender?.toLowerCase(),

          avatarMediaId: profile.avatarMediaId
            ? BigInt(profile.avatarMediaId)
            : undefined,
          voiceMediaId: profile.voiceMediaId
            ? BigInt(profile.voiceMediaId)
            : undefined,
          avatarUrl: undefined,

          createdAt: profile.createdAt || profile.createAt, // 오타 가능성 고려
        }));

        const addUrlProfiles = baseProfiles.map(async (profile) => {
          let avatarUrl = undefined;
          if (profile.avatarMediaId) {
            try {
              const mediaId = String(profile.avatarMediaId);
              const mediaResponse = await getMedia({ mediaIds: mediaId });
              avatarUrl = mediaResponse?.[0].cdnUrl;
            } catch (error) {
              console.error(
                `Failed to fetch media URL for ID ${profile.avatarMediaId}:`,
                error
              );
            }
          }
          return { ...profile, avatarUrl };
        });

        const transformedProfiles = await Promise.all(addUrlProfiles);

        setProfiles(transformedProfiles); // Zustand store에 저장
        console.log("변환된 프로필:", transformedProfiles);
      } else {
        console.error("프로필 목록이 배열이 아닙니다:", profileList);
        setProfiles([]); // 빈 배열로 초기화
      }
    } catch (error: any) {
      // 401 에러는 axios 인터셉터에서 자동으로 처리하여 로그인 화면으로 이동하므로
      // 여기서는 사용자에게 에러 Alert을 표시하지 않음
      if (error.response?.status === 401) {
        console.log(
          "[ProfileSelect] 401 Unauthorized - 로그인 화면으로 리다이렉트됩니다."
        );
        setProfiles([]); // 스토어 비우기
        return; // Alert 표시하지 않고 조용히 종료
      }

      // 401이 아닌 다른 에러는 로그 출력 및 Alert 표시
      console.error("프로필 목록 로드 오류:", error);
      console.error("에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      setProfiles([]); // 오류 발생 시 스토어도 비웁니다.

      Alert.alert(
        "오류",
        error.response?.data?.message ||
          "프로필 목록을 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfiles();
  };

  return {
    profiles,
    isLoading,
    refreshing,
    loadProfiles,
    onRefresh,
  };
}
