/**
 * useSignup 훅
 *
 * 회원가입 관련 로직 처리
 *
 * 주요 기능:
 * - 회원가입 폼 상태 관리
 * - 이메일 중복 체크
 * - 회원가입 API 호출 (TanStack Query useMutation)
 * - 토큰 저장 및 네비게이션
 *
 * API:
 * - POST /api/auth/signup (api/auth.ts)
 * - POST /api/auth/check-email (api/auth.ts)
 *
 * 반환값:
 * - signupEmailUsername, setSignupEmailUsername
 * - signupEmailDomain, setSignupEmailDomain
 * - signupCustomDomain, setSignupCustomDomain
 * - signupPassword, setSignupPassword
 * - signupAddress, setSignupAddress
 * - emailCheckStatus
 * - getSignupEmail
 * - handleCheckEmail
 * - handleSignupEmailUsernameChange
 * - handleSignupDomainChange
 * - handleSignupCustomDomainChange
 * - handleSignup
 * - signupMutation
 */

import { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signup, checkEmail } from "../../../../api/auth";
import type { SignupRequestDto } from "../../../../api/types";

type EmailCheckStatus = "unchecked" | "checking" | "available" | "unavailable";

export function useSignup() {
  const navigation = useNavigation<any>();

  // 회원가입 상태
  const [signupEmailUsername, setSignupEmailUsername] = useState("");
  const [signupEmailDomain, setSignupEmailDomain] = useState("@gmail.com");
  const [signupCustomDomain, setSignupCustomDomain] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupAddress, setSignupAddress] = useState("");

  // 이메일 중복 체크 상태
  const [emailCheckStatus, setEmailCheckStatus] =
    useState<EmailCheckStatus>("unchecked");

  // 회원가입 Mutation
  const signupMutation = useMutation({
    mutationFn: (data: SignupRequestDto) => signup(data),
    onSuccess: async (response) => {
      if (response.success && response.data) {
        // 토큰 저장
        await AsyncStorage.setItem("accessToken", response.data.accessToken);
        await AsyncStorage.setItem("refreshToken", response.data.refreshToken);
        await AsyncStorage.setItem("userId", response.data.userId.toString());

        Alert.alert("회원가입 성공", "프로필을 생성해주세요");
        navigation.navigate("Profile");
      } else {
        Alert.alert(
          "회원가입 실패",
          response.message || "회원가입에 실패했습니다"
        );
      }
    },
    onError: (error: any) => {
      Alert.alert("회원가입 오류", error.message || "서버 오류가 발생했습니다");
    },
  });

  // 이메일 조합 함수
  const getSignupEmail = () => {
    const domain =
      signupEmailDomain === "직접 입력"
        ? signupCustomDomain
        : signupEmailDomain;
    return signupEmailUsername + "@" + domain;
  };

  // 이메일 중복 체크 함수
  const handleCheckEmail = async () => {
    const signupEmail = getSignupEmail();

    // 유효성 검사
    if (!signupEmailUsername || !signupEmail.includes("@")) {
      Alert.alert("입력 오류", "올바른 이메일을 입력해주세요");
      return;
    }

    setEmailCheckStatus("checking");

    try {
      const response = await checkEmail(signupEmail);

      if (response.success && response.data) {
        setEmailCheckStatus("available");
        Alert.alert("확인 완료", "사용 가능한 이메일입니다");
      } else {
        setEmailCheckStatus("unavailable");
        Alert.alert(
          "사용 불가",
          response.message || "이미 사용 중인 이메일입니다"
        );
      }
    } catch (error: any) {
      setEmailCheckStatus("unavailable");
      Alert.alert(
        "오류",
        error.message || "이메일 확인 중 오류가 발생했습니다"
      );
    }
  };

  // 이메일 변경 시 체크 상태 초기화
  const handleSignupEmailUsernameChange = (text: string) => {
    setSignupEmailUsername(text);
    setEmailCheckStatus("unchecked");
  };

  const handleSignupDomainChange = (domain: string) => {
    setSignupEmailDomain(domain);
    setEmailCheckStatus("unchecked");
    if (domain === "직접 입력") {
      setSignupCustomDomain("");
    }
  };

  const handleSignupCustomDomainChange = (text: string) => {
    setSignupCustomDomain(text);
    setEmailCheckStatus("unchecked");
  };

  // 회원가입 핸들러
  const handleSignup = () => {
    const signupEmail = getSignupEmail();

    // 이메일 중복 체크 확인
    if (emailCheckStatus !== "available") {
      Alert.alert("이메일 확인 필요", "이메일 중복 확인을 먼저 진행해주세요");
      return;
    }

    // 유효성 검사
    if (
      !signupEmailUsername ||
      !signupEmail.includes("@") ||
      !signupPassword ||
      !signupAddress
    ) {
      Alert.alert("입력 오류", "모든 필드를 입력해주세요");
      return;
    }

    const signupData: SignupRequestDto = {
      email: signupEmail,
      password: signupPassword,
      address: signupAddress,
    };
    signupMutation.mutate(signupData);
  };

  return {
    signupEmailUsername,
    setSignupEmailUsername,
    signupEmailDomain,
    setSignupEmailDomain,
    signupCustomDomain,
    setSignupCustomDomain,
    signupPassword,
    setSignupPassword,
    signupAddress,
    setSignupAddress,
    emailCheckStatus,
    getSignupEmail,
    handleCheckEmail,
    handleSignupEmailUsernameChange,
    handleSignupDomainChange,
    handleSignupCustomDomainChange,
    handleSignup,
    signupMutation,
  };
}
