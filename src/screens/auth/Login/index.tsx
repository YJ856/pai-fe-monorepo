/**
 * 로그인/회원가입 화면
 *
 * 주요 기능:
 * - 탭으로 로그인/회원가입 전환
 * - 이메일/비밀번호 입력
 * - Gradient 버튼 스타일
 * - 로그인 API 호출
 * - JWT 토큰 저장 (AsyncStorage)
 * - 프로필 선택 화면으로 이동
 *
 * API:
 * - POST /api/auth/login (api/auth.ts)
 * - POST /api/auth/signup (api/auth.ts)
 *
 * 상태 관리:
 * - TanStack Query useMutation 사용
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { Input } from "../../../design/components/Input";
import { Button } from "../../../design/components/Button";
import { Tab } from "../../../design/components/Tab";
import { Label } from "../../../design/components/Label";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../../design/tokens";
import { login, signup, checkEmail } from "../../../api/auth";
import type { LoginRequestDto, SignupRequestDto } from "../../../api/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 이메일 도메인 목록
const EMAIL_DOMAINS = ["gmail.com", "naver.com", "kakao.com", "직접 입력"];

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState("login");

  // 로그인 상태
  const [loginEmailUsername, setLoginEmailUsername] = useState("");
  const [loginEmailDomain, setLoginEmailDomain] = useState("@gmail.com");
  const [loginCustomDomain, setLoginCustomDomain] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginDomainModalVisible, setLoginDomainModalVisible] = useState(false);

  // 회원가입 상태
  const [signupEmailUsername, setSignupEmailUsername] = useState("");
  const [signupEmailDomain, setSignupEmailDomain] = useState("@gmail.com");
  const [signupCustomDomain, setSignupCustomDomain] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [signupDomainModalVisible, setSignupDomainModalVisible] =
    useState(false);

  // 이메일 중복 체크 상태
  const [emailCheckStatus, setEmailCheckStatus] = useState<
    "unchecked" | "checking" | "available" | "unavailable"
  >("unchecked");

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
  const getLoginEmail = () => {
    const domain =
      loginEmailDomain === "직접 입력" ? loginCustomDomain : loginEmailDomain;
    return loginEmailUsername + "@" + domain;
  };

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
    setSignupDomainModalVisible(false);
    setEmailCheckStatus("unchecked");
    if (domain === "직접 입력") {
      setSignupCustomDomain("");
    }
  };

  const handleSignupCustomDomainChange = (text: string) => {
    setSignupCustomDomain(text);
    setEmailCheckStatus("unchecked");
  };

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

  const handleSelectLoginDomain = (domain: string) => {
    setLoginEmailDomain(domain);
    setLoginDomainModalVisible(false);
    if (domain === "직접 입력") {
      setLoginCustomDomain("");
    }
  };

  const handleSelectSignupDomain = (domain: string) => {
    handleSignupDomainChange(domain);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../../assets/images/background.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require("../../../assets/images/mascot.png")}
                    style={styles.mascot}
                  />
                </View>
                <Text style={styles.title}>PAI</Text>
                <Text style={styles.subtitle}>Parent-Child AI Interaction</Text>
              </View>

              {/* Card */}
              <View style={styles.card}>
                {/* Tabs */}
                <Tab
                  tabs={[
                    { key: "login", label: "로그인" },
                    { key: "signup", label: "회원가입" },
                  ]}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  variant="full"
                  gradient={colors.auth}
                  sparkle
                  style={styles.tabs}
                />

                {/* Login Form */}
                {activeTab === "login" && (
                  <View style={styles.form}>
                    <View>
                      <Label>이메일</Label>
                      <View style={styles.emailContainer}>
                        <View style={styles.emailInputWrapper}>
                          <View style={styles.emailUsernameWrapper}>
                            <Input
                              placeholder="아이디"
                              value={loginEmailUsername}
                              onChangeText={setLoginEmailUsername}
                              keyboardType="email-address"
                              autoCapitalize="none"
                              style={[styles.input, styles.emailUsernameInput]}
                            />
                          </View>
                          <Text style={styles.atSymbol}>@</Text>
                          <View style={styles.domainSelectWrapper}>
                            <TouchableOpacity
                              style={styles.domainButton}
                              onPress={() =>
                                setLoginDomainModalVisible(
                                  !loginDomainModalVisible
                                )
                              }
                              activeOpacity={0.7}
                            >
                              <Text style={styles.domainButtonText}>
                                {loginEmailDomain.replace("@", "")}
                              </Text>
                              <Text style={styles.dropdownIcon}>▼</Text>
                            </TouchableOpacity>

                            {loginDomainModalVisible && (
                              <View style={styles.dropdownMenu}>
                                {EMAIL_DOMAINS.map((item) => (
                                  <TouchableOpacity
                                    key={item}
                                    style={[
                                      styles.dropdownItem,
                                      loginEmailDomain === item &&
                                        styles.dropdownItemSelected,
                                    ]}
                                    onPress={() =>
                                      handleSelectLoginDomain(item)
                                    }
                                  >
                                    <Text
                                      style={[
                                        styles.dropdownItemText,
                                        loginEmailDomain === item &&
                                          styles.dropdownItemTextSelected,
                                      ]}
                                    >
                                      {item}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                      {loginEmailDomain === "직접 입력" && (
                        <Input
                          placeholder="example.com"
                          value={loginCustomDomain}
                          onChangeText={setLoginCustomDomain}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          style={[styles.input, { marginTop: spacing.xs }]}
                        />
                      )}
                    </View>

                    <View>
                      <Label>비밀번호</Label>
                      <Input
                        placeholder="비밀번호 입력"
                        value={loginPassword}
                        onChangeText={setLoginPassword}
                        secureTextEntry
                        style={styles.input}
                      />
                    </View>

                    <TouchableOpacity>
                      <Text style={styles.forgotPassword}>비밀번호 찾기</Text>
                    </TouchableOpacity>

                    <Button
                      variant="gradient"
                      gradient={colors.auth}
                      sparkle
                      onPress={handleLogin}
                      style={styles.submitButton}
                      // loading={loginMutation.isPending}
                    >
                      로그인
                    </Button>
                  </View>
                )}

                {/* Signup Form */}
                {activeTab === "signup" && (
                  <View style={styles.form}>
                    <View>
                      <View style={styles.labelWithButtonRow}>
                        <Label>이메일</Label>

                        {/* 이메일 중복 확인 버튼 */}
                        <TouchableOpacity
                          style={[
                            styles.checkEmailButton,
                            emailCheckStatus === "available" &&
                              styles.checkEmailButtonSuccess,
                            emailCheckStatus === "unavailable" &&
                              styles.checkEmailButtonError,
                          ]}
                          onPress={handleCheckEmail}
                          disabled={emailCheckStatus === "checking"}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.checkEmailButtonText}>
                            {emailCheckStatus === "checking"
                              ? "확인 중..."
                              : emailCheckStatus === "available"
                              ? "✓ 사용 가능"
                              : emailCheckStatus === "unavailable"
                              ? "✗ 사용 불가"
                              : "중복 확인"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.emailContainer}>
                        <View style={styles.emailInputWrapper}>
                          <View style={styles.emailUsernameWrapper}>
                            <Input
                              placeholder="아이디"
                              value={signupEmailUsername}
                              onChangeText={handleSignupEmailUsernameChange}
                              keyboardType="email-address"
                              autoCapitalize="none"
                              style={[styles.input, styles.emailUsernameInput]}
                            />
                          </View>
                          <Text style={styles.atSymbol}>@</Text>
                          <View style={styles.domainSelectWrapper}>
                            <TouchableOpacity
                              style={styles.domainButton}
                              onPress={() =>
                                setSignupDomainModalVisible(
                                  !signupDomainModalVisible
                                )
                              }
                              activeOpacity={0.7}
                            >
                              <Text style={styles.domainButtonText}>
                                {signupEmailDomain.replace("@", "")}
                              </Text>
                              <Text style={styles.dropdownIcon}>▼</Text>
                            </TouchableOpacity>

                            {signupDomainModalVisible && (
                              <View style={styles.dropdownMenu}>
                                {EMAIL_DOMAINS.map((item) => (
                                  <TouchableOpacity
                                    key={item}
                                    style={[
                                      styles.dropdownItem,
                                      signupEmailDomain === item &&
                                        styles.dropdownItemSelected,
                                    ]}
                                    onPress={() =>
                                      handleSelectSignupDomain(item)
                                    }
                                  >
                                    <Text
                                      style={[
                                        styles.dropdownItemText,
                                        signupEmailDomain === item &&
                                          styles.dropdownItemTextSelected,
                                      ]}
                                    >
                                      {item}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            )}
                          </View>
                        </View>
                      </View>

                      {signupEmailDomain === "직접 입력" && (
                        <Input
                          placeholder="example.com"
                          value={signupCustomDomain}
                          onChangeText={handleSignupCustomDomainChange}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          style={[styles.input, { marginTop: spacing.xs }]}
                        />
                      )}
                    </View>

                    <View>
                      <Label>비밀번호</Label>
                      <Input
                        placeholder="비밀번호 입력"
                        value={signupPassword}
                        onChangeText={setSignupPassword}
                        secureTextEntry
                        style={styles.input}
                      />
                    </View>

                    <View>
                      <Label>주소</Label>
                      <Input
                        placeholder="주소 입력"
                        value={signupAddress}
                        onChangeText={setSignupAddress}
                        style={styles.input}
                      />
                    </View>

                    <Button
                      variant="gradient"
                      gradient={colors.auth}
                      sparkle
                      onPress={handleSignup}
                      style={styles.submitButton}
                      // loading={signupMutation.isPending}
                    >
                      회원가입
                    </Button>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 400,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.sm,
  },
  mascot: {
    width: 96,
    height: 96,
  },
  title: {
    ...typography.h1,
    fontSize: 36,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: "rgba(255, 255, 255, 0.9)",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius["3xl"], // rounded-3xl = 24px
    padding: spacing.lg,
    ...shadows["2xl"], // shadow-2xl
  },
  tabs: {
    marginBottom: spacing.lg,
    backgroundColor: colors.muted, // TabsList 배경 (회색)
  },
  form: {
    gap: spacing.md,
  },
  input: {
    marginTop: spacing.xs,
    marginBottom: 0,
  },
  forgotPassword: {
    ...typography.body2,
    fontSize: 14,
    color: colors.auth.from,
    textAlign: "left",
  },
  submitButton: {
    width: "100%",
    marginTop: spacing.xs,
  },
  labelWithButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  emailContainer: {
    position: "relative",
  },
  emailInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: spacing.md - 4,
    overflow: "visible",
  },
  emailUsernameWrapper: {
    flex: 1,
    height: "100%",
  },
  emailUsernameInput: {
    marginTop: 0,
    marginBottom: 0,
    height: 36,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  atSymbol: {
    ...typography.body1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.secondary,
    paddingHorizontal: 4,
  },
  domainSelectWrapper: {
    position: "relative",
  },
  domainButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
    gap: 4,
  },
  domainButtonText: {
    ...typography.body2,
    fontSize: 15,
    fontWeight: "500",
    color: colors.auth.from,
  },
  dropdownIcon: {
    fontSize: 9,
    color: colors.auth.from,
  },
  dropdownMenu: {
    position: "absolute",
    top: 36,
    right: 0,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 140,
    maxHeight: 200,
    zIndex: 1000,
    ...shadows.lg,
  },
  dropdownItem: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: "rgba(91, 155, 213, 0.1)",
  },
  dropdownItemText: {
    ...typography.body2,
    fontSize: 15,
    color: colors.text.primary,
  },
  dropdownItemTextSelected: {
    color: colors.auth.from,
    fontWeight: "600",
  },
  checkEmailButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.auth.from,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
    height: 36,
  },
  checkEmailButtonSuccess: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  checkEmailButtonError: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  checkEmailButtonText: {
    ...typography.body2,
    fontSize: 13,
    fontWeight: "600",
    color: colors.auth.from,
  },
});
