/**
 * Input 컴포넌트
 *
 * 공용 텍스트 입력 컴포넌트
 * - 라벨 지원
 * - 에러 메시지 표시
 * - 다양한 키보드 타입
 * - 비밀번호 입력 (secureTextEntry)
 *
 * 사용 예시:
 * <Input
 *   label="이메일"
 *   placeholder="이메일을 입력하세요"
 *   value={email}
 *   onChangeText={setEmail}
 *   keyboardType="email-address"
 * />
 *
 * <Input
 *   label="비밀번호"
 *   error="비밀번호가 올바르지 않습니다"
 *   secureTextEntry
 * />
 */

import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../tokens';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  style,
  ...props
}: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.text.tertiary}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },

  label: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  input: {
    ...typography.body1,
    borderWidth: 1,
    borderColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
  },

  inputError: {
    borderColor: colors.status.error,
  },

  error: {
    ...typography.caption,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
});
