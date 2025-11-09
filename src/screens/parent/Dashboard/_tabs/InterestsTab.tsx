/**
 * 대시보드 > 관심사 탭
 *
 * 주요 기능:
 * - 자녀 관심사 분석 데이터 표시
 * - 워드클라우드 (키워드 크기 = 점수)
 * - 트렌드 차트 (시간별 관심사 변화)
 *
 * API:
 * - GET /api/insights/interests/:childId/top?limit=10 (api/insights.ts)
 *
 * 사용 컴포넌트:
 * - InterestCloud (Dashboard/components/)
 * - TrendChart (Dashboard/components/)
 *
 * 사용 훅:
 * - useInterests (Dashboard/hooks/)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TrendingUp, Hash } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../../../design/tokens';

interface Interest {
  keyword: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

interface InterestsTabProps {
  childId: string;
}

// Mock data
const MOCK_INTERESTS: Interest[] = [
  { keyword: '공룡', score: 95, trend: 'up' },
  { keyword: '우주', score: 88, trend: 'up' },
  { keyword: '바다', score: 75, trend: 'stable' },
  { keyword: '로봇', score: 70, trend: 'down' },
  { keyword: '식물', score: 65, trend: 'stable' },
  { keyword: '동물', score: 60, trend: 'up' },
  { keyword: '과학', score: 55, trend: 'stable' },
  { keyword: '음악', score: 50, trend: 'down' },
];

export default function InterestsTab({ childId }: InterestsTabProps) {
  const [interests] = useState<Interest[]>(MOCK_INTERESTS);

  const renderInterestCloud = () => {
    return (
      <View style={styles.cloudContainer}>
        {interests.map((interest, index) => {
          const fontSize = 16 + (interest.score / 100) * 24; // 16-40px range
          const color =
            interest.score > 80
              ? colors.parent.from
              : interest.score > 60
              ? colors.primary[400]
              : colors.text.secondary;

          return (
            <View key={interest.keyword} style={styles.cloudItem}>
              <Text style={[styles.cloudText, { fontSize, color }]}>
                {interest.keyword}
              </Text>
              {interest.trend === 'up' && (
                <TrendingUp size={12} color={colors.status.success} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderTopInterests = () => {
    const topInterests = interests.slice(0, 5);

    return (
      <View style={styles.topContainer}>
        <Text style={styles.sectionTitle}>Top 5 관심사</Text>
        {topInterests.map((interest, index) => (
          <View key={interest.keyword} style={styles.topItem}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <Text style={styles.topKeyword}>{interest.keyword}</Text>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreBarFill,
                  { width: `${interest.score}%` },
                ]}
              />
            </View>
            <Text style={styles.scoreText}>{interest.score}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Word Cloud */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Hash size={20} color={colors.parent.from} />
          <Text style={styles.sectionTitle}>관심사 워드 클라우드</Text>
        </View>
        <View style={styles.card}>{renderInterestCloud()}</View>
      </View>

      {/* Top Interests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color={colors.parent.from} />
          <Text style={styles.sectionTitle}>인기 관심사</Text>
        </View>
        <View style={styles.card}>{renderTopInterests()}</View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  cloudContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  cloudItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cloudText: {
    ...typography.h4,
    fontWeight: '600',
  },
  topContainer: {
    gap: spacing.md,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.parent.from,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    ...typography.body2,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  topKeyword: {
    ...typography.body1,
    fontWeight: '600',
    width: 80,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: colors.parent.from,
    borderRadius: borderRadius.full,
  },
  scoreText: {
    ...typography.body2,
    color: colors.text.secondary,
    width: 32,
    textAlign: 'right',
  },
});
