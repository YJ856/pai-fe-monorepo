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

import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { TrendingUp, Hash } from "lucide-react-native";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../../../design/tokens";
import { Card } from "../../../../design/components/Card";
import BubbleChart from "../components/BubbleChart";
import { useInterestsData } from "../hooks/useDashboardData";

interface InterestsTabProps {
  childId: string;
}

export default function InterestsTab({ childId }: InterestsTabProps) {
  // API 데이터 조회
  const {
    data: interestsData,
    isLoading,
    error,
  } = useInterestsData(childId);

  // 관심사 데이터 변환 (API → BubbleChart 형식)
  const interests =
    interestsData?.interests?.map((item: any) => ({
      topic: item.keyword,
      count: Math.round(item.rawScore * 10), // rawScore를 적절히 변환
      icon: "💡", // 기본 아이콘
    })) || [];

  // 로딩 상태
  if (isLoading) {
    return (
      <Card style={styles.contentCard}>
        <View style={styles.cardPadding}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.parent.from} />
            <Text style={styles.loadingText}>관심사 데이터 로딩 중...</Text>
          </View>
        </View>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card style={styles.contentCard}>
        <View style={styles.cardPadding}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              관심사 데이터를 불러올 수 없습니다
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.contentCard}>
      <View style={styles.cardPadding}>
        {/* Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.trendIcon}>📈</Text>
          <Text style={styles.sectionTitle}>관심사 TOP 10</Text>
        </View>

        {/* Bubble Chart */}
        <BubbleChart data={interests} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  contentCard: {
    backgroundColor: "#f9fafb",
    borderRadius: borderRadius["2xl"],
    ...shadows.sm,
  },
  cardPadding: {
    padding: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  trendIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 24,
    color: "#111827",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});
