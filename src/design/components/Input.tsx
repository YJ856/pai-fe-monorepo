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
    ...typography.label,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },

  input: {
    ...typography.body1,
    height: 36, // h-9 = 36px
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md - 4, // px-3 = 12px
    paddingVertical: spacing.xs, // py-1 = 4px
    backgroundColor: colors.inputBackground, // #F3F3F5
    color: colors.foreground,
  },

  inputError: {
    borderColor: colors.destructive,
  },

  error: {
    ...typography.caption,
    color: colors.destructive,
    marginTop: spacing.xs,
  },
});
