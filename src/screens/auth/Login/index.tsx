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
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../../../design/components/Input';
import { Button } from '../../../design/components/Button';
import { Tab } from '../../../design/components/Tab';
import { Label } from '../../../design/components/Label';
import { colors, spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import { login, signup } from '../../../api/auth';
import type { LoginRequestDto, SignupRequestDto } from '../../../api/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('login');

  // 로그인 상태
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 회원가입 상태
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupAddress, setSignupAddress] = useState('');

  // 로그인 Mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequestDto) => login(data),
    onSuccess: async (response) => {
      // 토큰 저장
      await AsyncStorage.setItem('accessToken', response.accessToken);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);
      await AsyncStorage.setItem('userId', response.userId.toString());

      Alert.alert('로그인 성공', '프로필을 선택해주세요');
      navigation.navigate('Profile');
    },
    onError: (error: any) => {
      Alert.alert('로그인 오류', error.message || '서버 오류가 발생했습니다');
    },
  });

  // 회원가입 Mutation
  const signupMutation = useMutation({
    mutationFn: (data: SignupRequestDto) => signup(data),
    onSuccess: async (response) => {
      if (response.success && response.data) {
        // 토큰 저장
        await AsyncStorage.setItem('accessToken', response.data.accessToken);
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
        await AsyncStorage.setItem('userId', response.data.userId.toString());

        Alert.alert('회원가입 성공', '프로필을 생성해주세요');
        navigation.navigate('Profile');
      } else {
        Alert.alert('회원가입 실패', response.message || '회원가입에 실패했습니다');
      }
    },
    onError: (error: any) => {
      Alert.alert('회원가입 오류', error.message || '서버 오류가 발생했습니다');
    },
  });

  const handleLogin = () => {
    // 유효성 검사
    if (!loginEmail || !loginPassword) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요');
      return;
    }

    const loginData: LoginRequestDto = {
      email: loginEmail,
      password: loginPassword,
    };
    loginMutation.mutate(loginData);
  };

  const handleSignup = () => {
    // 유효성 검사
    if (!signupEmail || !signupPassword || !signupAddress) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요');
      return;
    }

    const signupData: SignupRequestDto = {
      email: signupEmail,
      password: signupPassword,
      address: signupAddress,
    };
    signupMutation.mutate(signupData);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../../../assets/images/background.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                source={require('../../../assets/images/mascot.png')}
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
                { key: 'login', label: '로그인' },
                { key: 'signup', label: '회원가입' },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              variant="full"
              gradient={colors.auth}
              sparkle
              style={styles.tabs}
            />

            {/* Login Form */}
            {activeTab === 'login' && (
              <View style={styles.form}>
                <View>
                  <Label>이메일</Label>
                  <Input
                    placeholder="이메일 입력"
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
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
            {activeTab === 'signup' && (
              <View style={styles.form}>
                <View>
                  <Label>이메일</Label>
                  <Input
                    placeholder="이메일 입력"
                    value={signupEmail}
                    onChangeText={setSignupEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
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
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
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
    color: 'rgba(255, 255, 255, 0.9)',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['3xl'], // rounded-3xl = 24px
    padding: spacing.lg,
    ...shadows['2xl'], // shadow-2xl
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
    textAlign: 'left',
  },
  submitButton: {
    width: '100%',
    marginTop: spacing.xs,
  },
});
