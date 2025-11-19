/**
 * useProfileSelection 훅
 *
 * 프로필 선택 및 PIN 인증 로직
 *
 * 주요 기능:
 * - 자녀 프로필 직접 선택
 * - 부모 프로필 PIN 모달 표시
 * - PIN 검증 및 프로필 선택 API 호출
 * - 토큰 저장 및 네비게이션
 *
 * API:
 * - POST /api/profiles/select/:profileId (api/profiles.ts)
 *
 * 반환값:
 * - selectedProfile
 * - showPinModal, setShowPinModal
 * - pin, setPin
 * - pinError
 * - handleProfileClick
 * - handlePinSubmit
 */

import { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { selectProfile } from "../../../../api/profiles";
import { useProfileStore } from "../../../../store/useProfileStore";
import { Profile } from "pai-shared-types";

export function useProfileSelection() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const { setCurrentProfile } = useProfileStore();

  const handleProfileClick = async (profile: Profile) => {
    if (profile.profileType === "parent") {
      setSelectedProfile(profile);
      setShowPinModal(true);
      setPin("");
      setPinError("");
    } else {
      // 자녀 프로필 선택 (PIN 불필요)
      try {
        const result = await selectProfile(String(profile.profileId));

        // 토큰 저장
        if (result.accessToken) {
          await AsyncStorage.setItem("accessToken", result.accessToken);
          console.log(
            "[ProfileSelect-Child] AccessToken saved:",
            result.accessToken.substring(0, 20) + "..."
          );
        } else {
          console.warn("[ProfileSelect-Child] No accessToken in response!");
        }
        if (result.refreshToken) {
          await AsyncStorage.setItem("refreshToken", result.refreshToken);
        }

        // Zustand store에 현재 프로필 저장
        setCurrentProfile(profile);

        // React Query 캐시 삭제 (프로필 변경 시)
        queryClient.clear();
        console.log("[ProfileSelect] React Query cache cleared");

        // 자녀용 앱으로 네비게이션
        navigation.reset({
          index: 0,
          routes: [{ name: "ChildApp" }],
        });
      } catch (error: any) {
        console.error("자녀 프로필 선택 오류:", error);
        Alert.alert("오류", "프로필 선택 중 오류가 발생했습니다.");
      }
    }
  };

  const handlePinSubmit = async () => {
    if (!selectedProfile) return;

    try {
      setPinError("");

      // 백엔드에서 PIN 검증
      const result = await selectProfile(
        String(selectedProfile.profileId),
        pin
      );

      // PIN이 맞으면 토큰 저장
      if (result.accessToken) {
        await AsyncStorage.setItem("accessToken", result.accessToken);
        console.log(
          "[ProfileSelect-Parent] AccessToken saved:",
          result.accessToken.substring(0, 20) + "..."
        );
      } else {
        console.warn("[ProfileSelect-Parent] No accessToken in response!");
      }
      if (result.refreshToken) {
        await AsyncStorage.setItem("refreshToken", result.refreshToken);
      }

      // Zustand store에 현재 프로필 저장
      setCurrentProfile(selectedProfile);

      setShowPinModal(false);

      // React Query 캐시 삭제 (프로필 변경 시)
      queryClient.clear();
      console.log("[ProfileSelect] React Query cache cleared");

      // 부모용 앱으로 네비게이션
      navigation.reset({
        index: 0,
        routes: [{ name: "ParentApp" }],
      });
    } catch (error: any) {
      console.error("PIN 검증 오류:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setPinError("PIN이 일치하지 않습니다.");
      } else {
        setPinError("프로필 선택 중 오류가 발생했습니다.");
      }
    }
  };

  return {
    selectedProfile,
    showPinModal,
    setShowPinModal,
    pin,
    setPin,
    pinError,
    handleProfileClick,
    handlePinSubmit,
  };
}
