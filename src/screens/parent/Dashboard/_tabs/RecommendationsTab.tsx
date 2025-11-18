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

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../../../design/tokens";
import { useRecommendations } from "../hooks/useRecommendations";

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
  { key: "all", label: "전체" },
  { key: "book", label: "도서" },
  { key: "video", label: "영상" },
  { key: "game", label: "게임" },
  { key: "music", label: "음악" },
];

export default function RecommendationsTab({
  childId,
}: RecommendationsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // 실제 API 호출
  const {
    recommendations,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRecommendations({
    childId,
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  const filteredRecommendations = recommendations;

  const renderHeader = () => null;

  const renderCategoryFilter = () => (
    <View style={styles.filterContainer}>
      <FlatList
        data={categories}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === item.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory(item.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === item.key && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  const renderRecommendationCard = ({ item }: { item: Recommendation }) => (
    <TouchableOpacity
      style={styles.recommendationCard}
      onPress={() => console.log("Recommendation clicked:", item.id)}
    >
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
      )}

      <View style={styles.recommendationInfo}>
        <View>
          <Text style={styles.recommendationTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.relevantKeywords && item.relevantKeywords.length > 0 && (
            <Text style={styles.cardKeyword} numberOfLines={1}>
              관련 관심사: {item.relevantKeywords[0]}
            </Text>
          )}
        </View>

        <Text style={styles.recommendationAddress} numberOfLines={1}>
          {item.location || item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderCategoryFilter()}
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.parent.from} />
          <Text style={styles.emptyText}>추천 콘텐츠를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  // 에러 상태 처리
  if (isError) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderCategoryFilter()}
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            추천 콘텐츠를 불러오지 못했습니다
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderCategoryFilter()}

      <FlatList
        data={filteredRecommendations}
        renderItem={renderRecommendationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={colors.parent.from} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>추천 콘텐츠가 없습니다</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  headerTitle: {
    ...typography.h3,
    fontWeight: "700",
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
    fontWeight: "400",
  },
  filterContainer: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  filterList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  filterButtonActive: {
    backgroundColor: colors.parent.from,
  },
  filterText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.inverse,
    fontWeight: "600",
  },
  listContent: {
    padding: spacing.lg,
  },
  recommendationCard: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.background,
    ...shadows.sm,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  recommendationInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  recommendationTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  cardKeyword: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  recommendationAddress: {
    ...typography.body2,
    color: colors.text.secondary,
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
