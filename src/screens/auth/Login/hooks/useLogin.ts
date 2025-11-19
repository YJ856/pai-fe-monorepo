/**
 * useLogin 훅
 *
 * 로그인 관련 로직 처리
 *
 * 주요 기능:
 * - 로그인 폼 상태 관리
 * - 로그인 API 호출 (TanStack Query useMutation)
 * - 토큰 저장 및 네비게이션
 *
 * API:
 * - POST /api/auth/login (api/auth.ts)
 *
 * 반환값:
 * - loginEmailUsername, setLoginEmailUsername
 * - loginEmailDomain, setLoginEmailDomain
 * - loginCustomDomain, setLoginCustomDomain
 * - loginPassword, setLoginPassword
 * - getLoginEmail
 * - handleLogin
 * - loginMutation
 */

import { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../../../../api/auth";
import type { LoginRequestDto } from "../../../../api/types";

export function useLogin() {
  const navigation = useNavigation<any>();

  // 로그인 상태
  const [loginEmailUsername, setLoginEmailUsername] = useState("");
  const [loginEmailDomain, setLoginEmailDomain] = useState("@gmail.com");
  const [loginCustomDomain, setLoginCustomDomain] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 로그인 Mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequestDto) => login(data),
    onSuccess: async (response) => {
      // 토큰 저장
      await AsyncStorage.setItem("accessToken", response.accessToken);
      await AsyncStorage.setItem("refreshToken", response.refreshToken);
      await AsyncStorage.setItem("userId", response.userId.toString());

      navigation.navigate("Profile");
    },
    onError: (error: any) => {
      Alert.alert("로그인 오류", error.message || "서버 오류가 발생했습니다");
    },
  });

  // 이메일 조합 함수
  const getLoginEmail = () => {
    const domain =
      loginEmailDomain === "직접 입력" ? loginCustomDomain : loginEmailDomain;
    return loginEmailUsername + "@" + domain;
  };

  // 로그인 핸들러
  const handleLogin = () => {
    const loginEmail = getLoginEmail();

    // 유효성 검사
    if (!loginEmailUsername || !loginEmail.includes("@") || !loginPassword) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 입력해주세요");
      return;
    }

    const loginData: LoginRequestDto = {
      email: loginEmail,
      password: loginPassword,
    };
    loginMutation.mutate(loginData);
  };

  return {
    loginEmailUsername,
    setLoginEmailUsername,
    loginEmailDomain,
    setLoginEmailDomain,
    loginCustomDomain,
    setLoginCustomDomain,
    loginPassword,
    setLoginPassword,
    getLoginEmail,
    handleLogin,
    loginMutation,
  };
}
