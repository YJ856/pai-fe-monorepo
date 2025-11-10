/**
 * Card 컴포넌트 (Design_v2 기반)
 *
 * shadcn/ui 스타일의 카드 컴포넌트
 * - 기본 카드 + Header, Title, Description, Content, Footer 서브 컴포넌트
 * - 터치 가능 옵션
 * - rounded-xl (14px) 기본 border radius
 *
 * 사용 예시:
 * <Card>
 *   <CardHeader>
 *     <CardTitle>제목</CardTitle>
 *     <CardDescription>설명</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <Text>카드 내용</Text>
 *   </CardContent>
 * </Card>
 *
 * <Card onPress={() => console.log('pressed')}>
 *   <CardContent>
 *     <Text>클릭 가능한 카드</Text>
 *   </CardContent>
 * </Card>
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../tokens';

export interface CardProps {
  children: React.ReactNode;
  onPress?: TouchableOpacityProps['onPress'];
  style?: ViewStyle;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface CardTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export interface CardDescriptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

// Main Card component
export function Card({ children, onPress, style }: CardProps) {
  const containerStyle = [styles.card, style];

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

// CardHeader component
export function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.cardHeader, style]}>{children}</View>;
}

// CardTitle component
export function CardTitle({ children, style }: CardTitleProps) {
  return <Text style={[styles.cardTitle, style]}>{children}</Text>;
}

// CardDescription component
export function CardDescription({ children, style }: CardDescriptionProps) {
  return <Text style={[styles.cardDescription, style]}>{children}</Text>;
}

// CardContent component
export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.cardContent, style]}>{children}</View>;
}

// CardFooter component
export function CardFooter({ children, style }: CardFooterProps) {
  return <View style={[styles.cardFooter, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl, // rounded-xl
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  cardHeader: {
    paddingHorizontal: spacing.lg, // px-6 = 24px
    paddingTop: spacing.lg, // pt-6 = 24px
    gap: spacing.xs + 2, // gap-1.5 = 6px
  },

  cardTitle: {
    ...typography.h4,
    color: colors.cardForeground,
    lineHeight: typography.h4.lineHeight * 0.8, // leading-none 효과
  },

  cardDescription: {
    ...typography.body2,
    color: colors.mutedForeground,
    lineHeight: typography.body2.lineHeight,
  },

  cardContent: {
    paddingHorizontal: spacing.lg, // px-6 = 24px
    paddingBottom: spacing.lg, // pb-6 = 24px (마지막 요소)
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg, // px-6 = 24px
    paddingBottom: spacing.lg, // pb-6 = 24px
  },
});
