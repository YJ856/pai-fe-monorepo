/**
 * Badge 컴포넌트 (Design_v2 기반)
 *
 * 작은 상태 표시 배지
 * - variant: default, secondary, destructive, outline
 *
 * 사용 예시:
 * <Badge>New</Badge>
 * <Badge variant="destructive">오류</Badge>
 */

import React from 'react';
import { Text, StyleSheet, TextStyle, ViewStyle, View } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../tokens';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  style?: ViewStyle;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2, // 10px
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },

  default: {
    backgroundColor: colors.primary,
  },

  secondary: {
    backgroundColor: colors.secondary,
  },

  destructive: {
    backgroundColor: colors.destructive,
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },

  text: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },

  defaultText: {
    color: colors.primaryForeground,
  },

  secondaryText: {
    color: colors.secondaryForeground,
  },

  destructiveText: {
    color: colors.destructiveForeground,
  },

  outlineText: {
    color: colors.foreground,
  },
});
