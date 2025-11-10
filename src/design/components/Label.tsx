 /**
 * Label 컴포넌트 (Design_v2 기반)
 *
 * 폼 라벨 컴포넌트
 * - Input과 함께 사용
 * - font-medium (500), text-sm (14px)
 *
 * 사용 예시:
 * <Label>이메일</Label>
 * <Input ... />
 */

import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';
import { colors, typography } from '../tokens';

export interface LabelProps extends TextProps {
  children: React.ReactNode;
  disabled?: boolean;
  style?: TextStyle;
}

export function Label({ children, disabled = false, style, ...props }: LabelProps) {
  return (
    <Text style={[styles.label, disabled && styles.disabled, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.foreground,
  },
  disabled: {
    opacity: 0.5,
  },
});
