/**
 * Child Dashboard (아동용 대시보드)
 *
 * 주요 기능:
 * - 관심사 TOP 10 표시
 * - 버블 크기로 관심도 시각화
 * - 총 질문 수 표시
 *
 * 디자인:
 * - 밝은 크림색 배경 (#FFF9E6)
 * - 노란색→초록색 그라디언트
 * - 귀여운 폰트 (Ownglyph)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent } from '../../../design/components/Card';
import { Badge } from '../../../design/components/Badge';
import { Avatar } from '../../../design/components/Avatar';
import { colors, spacing, typography, borderRadius, shadows } from '../../../design/tokens';

interface Interest {
  id: string;
  topic: string;
  count: number;
  icon: string;
}

const MOCK_INTERESTS: Interest[] = [
  { id: '1', topic: '공룡', count: 15, icon: '🦕' },
  { id: '2', topic: '우주', count: 12, icon: '🚀' },
  { id: '3', topic: '동물', count: 10, icon: '🐶' },
  { id: '4', topic: '바다', count: 8, icon: '🌊' },
  { id: '5', topic: '식물', count: 7, icon: '🌱' },
  { id: '6', topic: '곤충', count: 6, icon: '🦋' },
  { id: '7', topic: '날씨', count: 5, icon: '🌤️' },
  { id: '8', topic: '음악', count: 4, icon: '🎵' },
  { id: '9', topic: '미술', count: 3, icon: '🎨' },
  { id: '10', topic: '스포츠', count: 2, icon: '⚽' },
];

export default function ChildDashboard() {
  const maxCount = Math.max(...MOCK_INTERESTS.map((i) => i.count));
  const totalQuestions = MOCK_INTERESTS.reduce((sum, i) => sum + i.count, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar emoji="👧" size="xl" />
        <Text style={styles.headerTitle}>지우의 관심사</Text>
        <Text style={styles.headerSubtitle}>내가 좋아하는 것들이에요!</Text>
      </View>

      {/* Interests Card */}
      <Card style={styles.card}>
        <CardContent style={styles.cardContent}>
          {/* Title */}
          <View style={styles.cardHeader}>
            <Text style={styles.trendIcon}>📈</Text>
            <Text style={styles.cardTitle}>관심사 TOP 10</Text>
          </View>

          {/* Interest List */}
          <View style={styles.interestList}>
            {MOCK_INTERESTS.map((interest, index) => {
              const percentage = (interest.count / maxCount) * 100;
              const size = 60 + (percentage / 100) * 80; // 60-140px range

              return (
                <LinearGradient
                  key={interest.id}
                  colors={['#FFF9E6', '#FFFFFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.interestItem}
                >
                  {/* Rank */}
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>

                  {/* Interest Bubble */}
                  <LinearGradient
                    colors={[colors.child.from, colors.child.to]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.interestBubble,
                      { width: size, height: size },
                    ]}
                  >
                    <Text style={styles.interestIcon}>{interest.icon}</Text>
                    <Text style={styles.interestCount}>{interest.count}</Text>
                  </LinearGradient>

                  {/* Topic Info */}
                  <View style={styles.interestInfo}>
                    <Text style={styles.interestTopic}>{interest.topic}</Text>
                    <Text style={styles.interestDescription}>
                      {interest.count}번 질문했어요
                    </Text>
                  </View>
                </LinearGradient>
              );
            })}
          </View>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <LinearGradient
        colors={[colors.child.from, colors.child.to]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.summaryCard}
      >
        <Text style={styles.starIcon}>⭐</Text>
        <Text style={styles.summaryTitle}>대단해요!</Text>
        <Text style={styles.summaryText}>
          총 {totalQuestions}개의 질문을 했어요
        </Text>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.child.background, // #FFF9E6
  },

  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },

  headerTitle: {
    ...typography.h1,
    fontSize: 28,
    color: colors.foreground,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },

  headerSubtitle: {
    ...typography.body1,
    color: colors.mutedForeground,
  },

  card: {
    marginBottom: spacing.lg,
    ...shadows.lg,
  },

  cardContent: {
    paddingVertical: spacing.lg,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },

  trendIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },

  cardTitle: {
    ...typography.h2,
    fontSize: 24,
    color: colors.foreground,
  },

  interestList: {
    gap: spacing.md,
  },

  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius['2xl'],
    gap: spacing.md,
    ...shadows.sm,
  },

  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.child.primary, // #FFD93D
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },

  rankText: {
    ...typography.h4,
    color: colors.primaryForeground,
    fontSize: 18,
    fontWeight: '600',
  },

  interestBubble: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },

  interestIcon: {
    fontSize: 32,
    marginBottom: spacing.xs - 2,
  },

  interestCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryForeground,
  },

  interestInfo: {
    flex: 1,
  },

  interestTopic: {
    ...typography.h4,
    fontSize: 20,
    color: colors.foreground,
    marginBottom: 2,
  },

  interestDescription: {
    ...typography.body2,
    fontSize: 14,
    color: colors.mutedForeground,
  },

  summaryCard: {
    borderRadius: borderRadius['3xl'],
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.lg,
  },

  starIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },

  summaryTitle: {
    ...typography.h2,
    fontSize: 24,
    color: colors.primaryForeground,
    marginBottom: spacing.sm,
  },

  summaryText: {
    ...typography.body1,
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
