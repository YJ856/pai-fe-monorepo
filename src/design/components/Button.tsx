/**
 * Button 컴포넌트
 *
 * 공용 버튼 컴포넌트
 * - 여러 variant 지원 (primary, secondary, outline, ghost, gradient)
 * - 크기 옵션 (sm, md, lg)
 * - 로딩 상태 표시
 * - disabled 상태
 * - Gradient 배경 지원
 *
 * 사용 예시:
 * <Button variant="primary" onPress={handleLogin}>
 *   로그인
 * </Button>
 *
 * <Button variant="outline" size="sm" loading>
 *   제출 중...
 * </Button>
 *
 * <Button variant="gradient" gradient={{ from: '#1e3a8a', to: '#3b82f6' }}>
 *   로그인
 * </Button>
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows } from '../tokens';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  gradient?: { from: string; to: string };
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  gradient,
  children,
  onPress,
  style,
  ...props
}: ButtonProps) {
  const getActivityIndicatorColor = () => {
    if (variant === 'outline' || variant === 'ghost') {
      return colors.primary[500];
    }
    return colors.text.inverse;
  };

  const content = loading ? (
    <ActivityIndicator color={getActivityIndicatorColor()} />
  ) : (
    <Text style={[styles.text, styles[`${variant}Text`]]}>{children}</Text>
  );

  if (variant === 'gradient' && gradient) {
    return (
      <TouchableOpacity
        disabled={disabled || loading}
        onPress={onPress}
        activeOpacity={0.7}
        style={style}
        {...props}
      >
        <LinearGradient
          colors={[gradient.from, gradient.to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            styles[size],
            styles.gradientButton,
            (disabled || loading) && styles.disabled,
          ]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary[500],
  },
  secondary: {
    backgroundColor: colors.secondary[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  gradientButton: {
    ...shadows.lg,
  },

  // Sizes
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },

  disabled: {
    opacity: 0.5,
  },

  // Text styles
  text: {
    ...typography.button,
  },
  primaryText: {
    color: colors.text.inverse,
  },
  secondaryText: {
    color: colors.text.inverse,
  },
  outlineText: {
    color: colors.primary[500],
  },
  ghostText: {
    color: colors.primary[500],
  },
  gradientText: {
    color: colors.text.inverse,
  },
});
