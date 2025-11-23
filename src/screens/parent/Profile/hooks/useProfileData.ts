/**
 * useProfileData 훅
 *
 * 프로필 데이터 로드 및 새로고침
 *
 * 주요 기능:
 * - 프로필 데이터 로드 (Zustand store에서)
 * - API로부터 프로필 새로고침
 * - 로딩 상태 관리
 *
 * API:
 * - GET /api/profiles (api/profiles.ts)
 * - GET /api/media (api/media.ts)
 *
 * 반환값:
 * - currentProfile
 * - familyMembers
 * - isLoading
 * - refreshing
 * - loadProfiles
 * - refreshProfilesFromAPI
 * - onRefresh
 */

import { useState } from "react";
import { Alert } from "react-native";
import { getProfiles } from "../../../../api/profiles";
import { getMedia } from "../../../../api/media";
import { useProfileStore } from "../../../../store/useProfileStore";

export function useProfileData() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentProfile = useProfileStore((state) => state.currentProfile);
  const profiles = useProfileStore((state) => state.profiles);
  const familyMembers =
    profiles.filter((p) => p.profileId !== currentProfile?.profileId) || [];

  const loadProfiles = async () => {
    // Zustand store에서 프로필 데이터 가져오기 (API 호출 없음)
    setIsLoading(true);
    const { profiles, currentProfile } = useProfileStore.getState();
    setIsLoading(false);
  };

  // API를 호출하여 프로필 목록을 새로고침하는 함수
  const refreshProfilesFromAPI = async () => {
    setRefreshing(true);

    try {
      const {
        currentProfile,
        setCurrentProfile,
        setProfiles: storeSetProfiles,
      } = useProfileStore.getState();

      // API에서 최신 프로필 목록 가져오기
      const profileList = await getProfiles("all");

      if (Array.isArray(profileList) && profileList.length > 0) {
        // API 응답을 앱 타입으로 변환 (ProfileSelect와 동일한 로직)
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
            ? String(profile.voiceMediaId)
            : undefined,
          avatarUrl: undefined,
          createdAt: profile.createdAt || profile.createAt,
        }));

        // 각 프로필의 avatarUrl 가져오기
        const addUrlProfiles = baseProfiles.map(async (profile) => {
          let avatarUrl = undefined;
          if (profile.avatarMediaId) {
            try {
              const mediaId = String(profile.avatarMediaId);
              const mediaResponse = await getMedia({ mediaIds: mediaId });
              avatarUrl = mediaResponse?.[0]?.cdnUrl;
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

        // Zustand store 업데이트
        storeSetProfiles(transformedProfiles);

        // 현재 프로필 업데이트 (최신 정보로)
        if (currentProfile) {
          const updatedCurrentProfile = transformedProfiles.find(
            (p) => p.profileId === currentProfile.profileId
          );

          if (updatedCurrentProfile) {
            setCurrentProfile(updatedCurrentProfile);
          }
        }
      }
    } catch (error: any) {
      console.error("프로필 목록 새로고침 오류:", error);
      Alert.alert("오류", "프로필 정보를 새로고침하는데 실패했습니다.");
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    // Pull-to-refresh 시 API에서 최신 데이터 가져오기
    await refreshProfilesFromAPI();
  };

  return {
    currentProfile,
    familyMembers,
    isLoading,
    refreshing,
    loadProfiles,
    refreshProfilesFromAPI,
    onRefresh,
  };
}
