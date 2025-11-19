/**
 * 대시보드 > 추천 탭
 *
 * 주요 기능:
 * - 자녀 관심사 기반 추천 콘텐츠 표시
 * - 카테고리 필터링
 * - 카드 형식 목록
 * - 무한 스크롤
 *
 * API:
 * - GET /api/insights/recommendations/:childId?page=&pageSize=&category= (api/recommendations.ts)
 *
 * 사용 훅:
 * - useRecommendations (Dashboard/hooks/)
 */

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../../../design/tokens";
import { Card } from "../../../../design/components/Card";
import { useRecommendations } from "../hooks/useRecommendations";
import { useProfileStore } from "../../../../store/useProfileStore";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  link?: string;
  relevantKeywords: string[];
}

interface RecommendationsTabProps {
  childId: string;
}

const categories = [
  { key: "관광지", label: "관광지" },
  { key: "문화시설", label: "문화시설" },
  { key: "축제", label: "축제공연행사" },
];

export default function RecommendationsTab({
  childId,
}: RecommendationsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState("관광지");
  const { childProfiles } = useProfileStore();

  // 현재 선택된 자녀 찾기
  const selectedChild = useMemo(
    () => childProfiles.find((child) => String(child.profileId) === childId),
    [childProfiles, childId]
  );

  // 실제 API 호출
  const {
    recommendations,
    isLoading,
    isError,
    isFetchingNextPage,
  } = useRecommendations({
    childId,
    category: selectedCategory,
  });

  const filteredRecommendations = recommendations;

  // 관련 키워드 추출 (중복 제거)
  const relatedKeywords = useMemo(() => {
    const keywords = new Set<string>();
    filteredRecommendations.forEach((item) => {
      item.relevantKeywords?.forEach((keyword: string) => keywords.add(keyword));
    });
    return Array.from(keywords);
  }, [filteredRecommendations]);

  const renderHeader = () => {
    if (relatedKeywords.length === 0) return null;

    return (
      <View style={styles.relatedInterestHeader}>
        <Text style={styles.relatedInterestIcon}>💡</Text>
        <Text style={styles.relatedInterestText}>
          {selectedChild?.name || "아이"}가 관심있어하는 {relatedKeywords.slice(0, 3).join(", ")}
        </Text>
      </View>
    );
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryTabs}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.key}
          style={styles.categoryTab}
          onPress={() => setSelectedCategory(category.key)}
          activeOpacity={0.8}
        >
          {selectedCategory === category.key ? (
            <LinearGradient
              colors={["#5B9BD5", "#667BC6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.categoryTabActive}
            >
              <Text style={styles.categoryTabTextActive}>{category.label}</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.categoryTabTextInactive}>{category.label}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRecommendationCard = ({ item }: { item: Recommendation }) => (
    <TouchableOpacity
      style={styles.recommendationCard}
      onPress={() => console.log("Recommendation clicked:", item.id)}
      activeOpacity={0.8}
    >
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
      )}

      <View style={styles.recommendationContent}>
        <Text style={styles.recommendationTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.recommendationDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <Card style={styles.contentCard}>
        <View style={styles.cardPadding}>
          {renderHeader()}
          {renderCategoryFilter()}
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={colors.parent.from} />
            <Text style={styles.emptyText}>추천 콘텐츠를 불러오는 중...</Text>
          </View>
        </View>
      </Card>
    );
  }

  // 에러 상태 처리
  if (isError) {
    return (
      <Card style={styles.contentCard}>
        <View style={styles.cardPadding}>
          {renderHeader()}
          {renderCategoryFilter()}
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              추천 콘텐츠를 불러오지 못했습니다
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.contentCard}>
      <View style={styles.cardPadding}>
        {renderHeader()}
        {renderCategoryFilter()}

        <View style={styles.listContent}>
          {filteredRecommendations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>추천 콘텐츠가 없습니다</Text>
            </View>
          ) : (
            <>
              {filteredRecommendations.map((item) => (
                <View key={item.id}>
                  {renderRecommendationCard({ item })}
                </View>
              ))}

              {isFetchingNextPage && (
                <View style={styles.loadingFooter}>
                  <ActivityIndicator size="small" color={colors.parent.from} />
                </View>
              )}
            </>
          )}
        </View>
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
  relatedInterestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  relatedInterestIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  relatedInterestText: {
    ...typography.body1,
    fontSize: 15,
    color: "#5B9BD5",
    fontWeight: "600",
  },
  categoryTabs: {
    flexDirection: "row",
    padding: spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  categoryTab: {
    flex: 1,
  },
  categoryTabActive: {
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.lg,
  },
  categoryTabTextActive: {
    ...typography.button,
    fontSize: 13,
    color: colors.primaryForeground,
  },
  categoryTabTextInactive: {
    ...typography.button,
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    paddingVertical: spacing.sm,
  },
  listContent: {
    paddingTop: 0,
  },
  recommendationCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    overflow: "hidden",
    ...shadows.sm,
  },
  thumbnail: {
    width: "100%",
    height: 180,
    backgroundColor: "#f3f4f6",
  },
  recommendationContent: {
    padding: spacing.lg,
  },
  recommendationTitle: {
    ...typography.h4,
    fontSize: 18,
    color: "#111827",
    marginBottom: spacing.xs,
  },
  recommendationDescription: {
    ...typography.body1,
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  loadingFooter: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
});
