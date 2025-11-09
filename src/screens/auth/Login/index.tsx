/**
 * 로그인 화면
 *
 * 주요 기능:
 * - 이메일/비밀번호 입력
 * - 로그인 API 호출
 * - JWT 토큰 저장 (AsyncStorage)
 * - 프로필 선택 화면으로 이동
 *
 * API:
 * - POST /api/auth/login (api/auth.ts)
 *
 * 상태 관리:
 * - TanStack Query useMutation 사용
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../../design/layouts/ScreenContainer';
import { Input } from '../../../design/components/Input';
import { Button } from '../../../design/components/Button';
import { spacing, typography } from '../../../design/tokens';
// import { useMutation } from '@tanstack/react-query';
// import { login } from '../../../api/auth';
// import { tokenManager } from '../../../api/client/interceptors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // TODO: useMutation으로 로그인 API 호출
  // const loginMutation = useMutation({
  //   mutationFn: () => login(email, password),
  //   onSuccess: async (data) => {
  //     await tokenManager.setAccessToken(data.accessToken);
  //     await tokenManager.setRefreshToken(data.refreshToken);
  //     // Navigate to ProfileSelect
  //   },
  // });

  const handleLogin = () => {
    // TODO: 유효성 검사
    // TODO: loginMutation.mutate()
    console.log('Login:', email, password);
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>로그인</Text>

        <Input
          label="이메일"
          placeholder="이메일을 입력하세요"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          variant="primary"
          onPress={handleLogin}
          // loading={loginMutation.isPending}
        >
          로그인
        </Button>

        {/* TODO: 회원가입 화면으로 이동 버튼 */}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xl,
  },
});
