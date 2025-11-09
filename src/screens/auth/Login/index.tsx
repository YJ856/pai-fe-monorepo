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

import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../../../design/layouts/ScreenContainer';
import { Input } from '../../../design/components/Input';
import { Button } from '../../../design/components/Button';
import { Tab } from '../../../design/components/Tab';
import { colors, spacing, typography, borderRadius, shadows } from '../../../design/tokens';
// import { useMutation } from '@tanstack/react-query';
// import { login, signup } from '../../../api/auth';
// import { tokenManager } from '../../../api/client/interceptors';

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState('login');

  // 로그인 상태
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 회원가입 상태
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupAddress, setSignupAddress] = useState('');

  // TODO: useMutation으로 로그인 API 호출
  // const loginMutation = useMutation({
  //   mutationFn: () => login(loginEmail, loginPassword),
  //   onSuccess: async (data) => {
  //     await tokenManager.setAccessToken(data.accessToken);
  //     await tokenManager.setRefreshToken(data.refreshToken);
  //     // Navigate to ProfileSelect
  //   },
  // });

  // TODO: useMutation으로 회원가입 API 호출
  // const signupMutation = useMutation({
  //   mutationFn: () => signup(signupEmail, signupPassword, signupAddress),
  //   onSuccess: async (data) => {
  //     await tokenManager.setAccessToken(data.accessToken);
  //     await tokenManager.setRefreshToken(data.refreshToken);
  //     // Navigate to ProfileSelect
  //   },
  // });

  const handleLogin = () => {
    // TODO: 유효성 검사
    // TODO: loginMutation.mutate()
    console.log('Login:', loginEmail, loginPassword);
  };

  const handleSignup = () => {
    // TODO: 유효성 검사
    // TODO: signupMutation.mutate()
    console.log('Signup:', signupEmail, signupPassword, signupAddress);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.auth.from, colors.auth.to]}
        style={styles.background}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              {/* TODO: Replace with actual mascot image */}
              <View style={styles.mascotPlaceholder} />
            </View>
            <Text style={styles.title}>PAI</Text>
            <Text style={styles.subtitle}>Parent-Child AI Interaction</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Tabs */}
            <Tab
              tabs={[
                { key: 'login', label: '로그인' },
                { key: 'signup', label: '회원가입' },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              variant="full"
              gradient={colors.auth}
              style={styles.tabs}
            />

            {/* Login Form */}
            {activeTab === 'login' && (
              <View style={styles.form}>
                <Input
                  label="이메일"
                  placeholder="이메일 입력"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Input
                  label="비밀번호"
                  placeholder="비밀번호 입력"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry
                />

                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>비밀번호 찾기</Text>
                </TouchableOpacity>

                <Button
                  variant="gradient"
                  gradient={colors.auth}
                  onPress={handleLogin}
                  // loading={loginMutation.isPending}
                >
                  로그인
                </Button>
              </View>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <View style={styles.form}>
                <Input
                  label="이메일"
                  placeholder="이메일 입력"
                  value={signupEmail}
                  onChangeText={setSignupEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Input
                  label="비밀번호"
                  placeholder="비밀번호 입력"
                  value={signupPassword}
                  onChangeText={setSignupPassword}
                  secureTextEntry
                />

                <Input
                  label="주소"
                  placeholder="주소 입력"
                  value={signupAddress}
                  onChangeText={setSignupAddress}
                />

                <Button
                  variant="gradient"
                  gradient={colors.auth}
                  onPress={handleSignup}
                  // loading={signupMutation.isPending}
                >
                  회원가입
                </Button>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.sm,
  },
  mascotPlaceholder: {
    width: 96,
    height: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.full,
  },
  title: {
    ...typography.h1,
    fontSize: 36,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 24,
    padding: spacing.lg,
    ...shadows.lg,
  },
  tabs: {
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  forgotPassword: {
    ...typography.body2,
    color: colors.auth.from,
    textAlign: 'left',
  },
});
