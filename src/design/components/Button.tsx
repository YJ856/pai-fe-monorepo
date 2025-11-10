/**
 * Button 컴포넌트 (Design_v2 기반)
 *
 * 공용 버튼 컴포넌트
 * - 여러 variant 지원 (default, destructive, outline, secondary, ghost, link, gradient)
 * - 크기 옵션 (sm, md, lg, icon)
 * - 로딩 상태 표시
 * - disabled 상태
 * - Gradient 배경 지원
 * - Sparkle 효과 지원 (원본 디자인의 별똥별 효과)
 *
 * 사용 예시:
 * <Button variant="default" onPress={handleLogin}>
 *   로그인
 * </Button>
 *
 * <Button variant="outline" size="sm" loading>
 *   제출 중...
 * </Button>
 *
 * <Button variant="gradient" gradient={{ from: '#1e3a8a', to: '#3b82f6' }} sparkle>
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
import { colors, spacing, typography, borderRadius, shadows, sparkleEffect } from '../tokens';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  gradient?: { from: string; to: string };
  sparkle?: boolean; // Sparkle 효과 활성화
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  variant = 'default',
  size = 'md',
  loading = false,
  disabled = false,
  gradient,
  sparkle = false,
  children,
  onPress,
  style,
  ...props
}: ButtonProps) {
  const getActivityIndicatorColor = () => {
    if (variant === 'outline' || variant === 'ghost' || variant === 'link') {
      return colors.primary;
    }
    return colors.primaryForeground;
  };

  const content = loading ? (
    <ActivityIndicator color={getActivityIndicatorColor()} />
  ) : (
    <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>{children}</Text>
  );

  // Sparkle 효과 렌더링
  const renderSparkles = () => {
    if (!sparkle) return null;

    return (
      <View style={styles.sparkleContainer}>
        {sparkleEffect.small.map((sparkle, index) => (
          <View
            key={index}
            style={[
              styles.sparkle,
              {
                left: sparkle.x,
                top: sparkle.y,
                width: sparkle.size,
                height: sparkle.size,
                opacity: sparkle.opacity,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  // Gradient variant
  if (variant === 'gradient' && gradient) {
    return (
      <TouchableOpacity
        disabled={disabled || loading}
        onPress={onPress}
        activeOpacity={0.8}
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
          {renderSparkles()}
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Default variants (non-gradient)
  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant !== 'gradient' && styles[variant],
        styles[size],
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      onPress={onPress}
      activeOpacity={0.8}
      {...props}
    >
      {sparkle && renderSparkles()}
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    overflow: 'hidden', // Sparkle 효과를 위해 필요
    position: 'relative',
  },

  // Variants (Design_v2 shadcn/ui 스타일)
  default: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  destructive: {
    backgroundColor: colors.destructive,
    ...shadows.sm,
  },
  outline: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  link: {
    backgroundColor: 'transparent',
  },
  gradientButton: {
    ...shadows.lg,
  },

  // Sizes (Design_v2 기준)
  sm: {
    height: 32,
    paddingHorizontal: spacing.md - 4, // 12px
    borderRadius: borderRadius.md,
  },
  md: {
    height: 36,
    paddingHorizontal: spacing.md, // 16px
    borderRadius: borderRadius.md,
  },
  lg: {
    height: 40,
    paddingHorizontal: spacing.lg, // 24px
    borderRadius: borderRadius.md,
  },
  icon: {
    width: 36,
    height: 36,
    paddingHorizontal: 0,
    borderRadius: borderRadius.md,
  },

  disabled: {
    opacity: 0.5,
  },

  // Text styles
  text: {
    ...typography.button,
    textAlign: 'center',
  },
  defaultText: {
    color: colors.primaryForeground,
  },
  destructiveText: {
    color: colors.destructiveForeground,
  },
  outlineText: {
    color: colors.foreground,
  },
  secondaryText: {
    color: colors.secondaryForeground,
  },
  ghostText: {
    color: colors.foreground,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  gradientText: {
    color: colors.primaryForeground,
  },

  // Text sizes
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 16,
  },
  iconText: {
    fontSize: 16,
  },

  // Sparkle 효과
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
    backgroundColor: sparkleEffect.color,
    borderRadius: 9999,
  },
});
