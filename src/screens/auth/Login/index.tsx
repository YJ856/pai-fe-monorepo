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

import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { useLogin } from "./hooks/useLogin";
import { useSignup } from "./hooks/useSignup";
import { useEmailDomain } from "./hooks/useEmailDomain";

// 이메일 도메인 목록
const EMAIL_DOMAINS = ["gmail.com", "naver.com", "kakao.com", "직접 입력"];

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState("login");

  // 로그인 Hook
  const {
    loginEmailUsername,
    setLoginEmailUsername,
    loginEmailDomain,
    setLoginEmailDomain,
    loginCustomDomain,
    setLoginCustomDomain,
    loginPassword,
    setLoginPassword,
    handleLogin,
    loginMutation,
  } = useLogin();

  // 회원가입 Hook
  const {
    signupEmailUsername,
    signupEmailDomain,
    signupCustomDomain,
    signupPassword,
    setSignupPassword,
    signupAddress,
    setSignupAddress,
    emailCheckStatus,
    handleCheckEmail,
    handleSignupEmailUsernameChange,
    handleSignupDomainChange,
    handleSignupCustomDomainChange,
    handleSignup,
    signupMutation,
  } = useSignup();

  // 이메일 도메인 선택 Hook
  const {
    loginDomainModalVisible,
    setLoginDomainModalVisible,
    signupDomainModalVisible,
    setSignupDomainModalVisible,
    handleSelectLoginDomain,
    handleSelectSignupDomain,
  } = useEmailDomain(
    setLoginEmailDomain,
    setLoginCustomDomain,
    handleSignupDomainChange
  );

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
