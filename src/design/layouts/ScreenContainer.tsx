/**
 * ScreenContainer 레이아웃 컴포넌트
 *
 * 모든 화면의 기본 레이아웃
 * - SafeAreaView 적용
 * - 공통 패딩
 * - 스크롤 가능 옵션
 *
 * 사용 예시:
 * <ScreenContainer>
 *   <Text>화면 내용</Text>
 * </ScreenContainer>
 *
 * <ScreenContainer scrollable>
 *   <Text>스크롤 가능한 화면</Text>
 * </ScreenContainer>
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../tokens';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  noPadding?: boolean;
}

export function ScreenContainer({
  children,
  scrollable = false,
  style,
  noPadding = false,
}: ScreenContainerProps) {
  const containerStyle = [
    styles.container,
    !noPadding && styles.padding,
    style,
  ];

  if (scrollable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={containerStyle}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={containerStyle}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  padding: {
    paddingHorizontal: spacing.md,
  },

  scrollContent: {
    paddingBottom: spacing.xl,
  },
});
