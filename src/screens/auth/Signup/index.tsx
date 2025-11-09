/**
 * 회원가입 화면
 *
 * 주요 기능:
 * - 이메일/비밀번호/주소 입력
 * - 이메일 중복 확인
 * - 주소 입력 시 위도/경도 자동 변환 (Geocoding)
 * - 회원가입 API 호출
 * - 자동 로그인 후 프로필 선택 화면으로 이동
 *
 * API:
 * - POST /api/auth/check-email (api/auth.ts)
 * - POST /api/auth/signup (api/auth.ts)
 *
 * TODO:
 * - 주소 검색 컴포넌트 추가 (Daum Postcode API 등)
 * - Geocoding API 연동
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../../design/layouts/ScreenContainer';
import { Input } from '../../../design/components/Input';
import { Button } from '../../../design/components/Button';
import { spacing, typography } from '../../../design/tokens';
// import { validateEmail, validatePassword } from '../../../shared/utils/validation';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  // TODO: useMutation으로 회원가입 API 호출

  const handleSignup = () => {
    // TODO: 유효성 검사 (validateEmail, validatePassword)
    // TODO: 주소 → 위도/경도 변환
    // TODO: signupMutation.mutate()
    console.log('Signup:', { email, password, address, latitude, longitude });
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>회원가입</Text>

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

        <Input
          label="주소"
          placeholder="주소를 입력하세요"
          value={address}
          onChangeText={setAddress}
        />

        {/* TODO: 주소 검색 버튼 추가 */}

        <Button variant="primary" onPress={handleSignup}>
          회원가입
        </Button>
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
