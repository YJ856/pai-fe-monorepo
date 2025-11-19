/**
 * useProfileActions 훅
 *
 * 프로필 관련 액션 (생성, 로그아웃)
 *
 * 주요 기능:
 * - 프로필 생성 화면으로 네비게이션
 * - 로그아웃 처리 (토큰 삭제, store 초기화)
 *
 * API:
 * - POST /api/auth/logout (api/auth.ts)
 *
 * 반환값:
 * - handleCreateProfile
 * - handleLogout
 */

import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout } from "../../../../api/auth";
import { useProfileStore } from "../../../../store/useProfileStore";

export function useProfileActions() {
  const navigation = useNavigation<any>();

  const handleCreateProfile = () => {
    navigation.navigate("ProfileCreate");
  };

  const handleLogout = async () => {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            // AsyncStorage에서 토큰 가져오기
            const accessToken = await AsyncStorage.getItem("accessToken");

            if (accessToken) {
              // 토큰이 있으면 서버에 로그아웃 요청
              await logout();
            }
          } catch (error) {
            console.log("Logout API error:", error);
            // API 실패해도 로컬 토큰은 삭제하고 계속 진행
          } finally {
            // AsyncStorage에서 토큰 삭제
            await AsyncStorage.multiRemove([
              "accessToken",
              "refreshToken",
              "userId",
            ]);

            // Zustand store 프로필 데이터 삭제
            useProfileStore.getState().clearProfile();

            console.log("로그아웃 완료 - 로그인 화면으로 이동");

            // authEvents 발생시켜서 RootNavigator에서 자동으로 Auth 화면으로 이동
            // navigation.reset 대신 replace 사용
            navigation.replace("Auth");
          }
        },
      },
    ]);
  };

  return {
    handleCreateProfile,
    handleLogout,
  };
}
