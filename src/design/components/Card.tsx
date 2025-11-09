/**
 * Card 컴포넌트
 *
 * 공용 카드 컴포넌트
 * - 그림자 효과
 * - 터치 가능 옵션
 * - 여러 variant 지원
 *
 * 사용 예시:
 * <Card>
 *   <Text>카드 내용</Text>
 * </Card>
 *
 * <Card variant="outlined" onPress={() => console.log('pressed')}>
 *   <Text>클릭 가능한 카드</Text>
 * </Card>
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../tokens';

export interface CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  children: React.ReactNode;
  onPress?: TouchableOpacityProps['onPress'];
  style?: ViewStyle;
}

export function Card({
  variant = 'elevated',
  children,
  onPress,
  style,
}: CardProps) {
  const containerStyle = [
    styles.base,
    styles[variant],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },

  elevated: {
    backgroundColor: colors.background.primary,
    ...shadows.md,
  },

  outlined: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.background.tertiary,
  },

  filled: {
    backgroundColor: colors.background.secondary,
  },
});
