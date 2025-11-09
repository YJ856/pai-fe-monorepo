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

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Book, Video, Gamepad2, Music, ExternalLink } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../../../design/tokens';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'book' | 'video' | 'game' | 'music';
  thumbnailUrl?: string;
  url?: string;
  matchedInterests: string[];
}

interface RecommendationsTabProps {
  childId: string;
}

const categories = [
  { key: 'all', label: '전체', icon: null },
  { key: 'book', label: '도서', icon: Book },
  { key: 'video', label: '영상', icon: Video },
  { key: 'game', label: '게임', icon: Gamepad2 },
  { key: 'music', label: '음악', icon: Music },
];

// Mock data
const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    title: '공룡 대탐험',
    description: '공룡의 종류와 특징을 배울 수 있는 재미있는 책',
    category: 'book',
    matchedInterests: ['공룡', '과학'],
  },
  {
    id: '2',
    title: '우주의 신비',
    description: '우주와 행성에 대해 알아보는 다큐멘터리',
    category: 'video',
    matchedInterests: ['우주', '과학'],
  },
  {
    id: '3',
    title: '해양 생물 퍼즐',
    description: '바다 동물들을 배우며 놀 수 있는 교육 게임',
    category: 'game',
    matchedInterests: ['바다', '동물'],
  },
  {
    id: '4',
    title: '자연의 소리',
    description: '숲과 바다의 자연 소리로 편안함을 주는 음악',
    category: 'music',
    matchedInterests: ['자연', '음악'],
  },
];

export default function RecommendationsTab({ childId }: RecommendationsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recommendations] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS);

  const filteredRecommendations =
    selectedCategory === 'all'
      ? recommendations
      : recommendations.filter((r) => r.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'book':
        return <Book size={24} color={colors.parent.from} />;
      case 'video':
        return <Video size={24} color={colors.parent.from} />;
      case 'game':
        return <Gamepad2 size={24} color={colors.parent.from} />;
      case 'music':
        return <Music size={24} color={colors.parent.from} />;
      default:
        return null;
    }
  };

  const renderCategoryFilter = () => (
    <View style={styles.filterContainer}>
      <FlatList
        data={categories}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === item.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory(item.key)}
            >
              {Icon && (
                <Icon
                  size={16}
                  color={
                    selectedCategory === item.key
                      ? colors.text.inverse
                      : colors.text.secondary
                  }
                />
              )}
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
      onPress={() => console.log('Recommendation clicked:', item.id)}
    >
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          {getCategoryIcon(item.category)}
        </View>
      )}

      <View style={styles.recommendationInfo}>
        <View style={styles.recommendationHeader}>
          <Text style={styles.recommendationTitle}>{item.title}</Text>
          {item.url && <ExternalLink size={16} color={colors.text.tertiary} />}
        </View>

        <Text style={styles.recommendationDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.interestTags}>
          {item.matchedInterests.map((interest) => (
            <View key={interest} style={styles.interestTag}>
              <Text style={styles.interestTagText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderCategoryFilter()}

      <FlatList
        data={filteredRecommendations}
        renderItem={renderRecommendationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  filterContainer: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  filterList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
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
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.lg,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.background.tertiary,
    ...shadows.sm,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  thumbnailPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  recommendationInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  recommendationTitle: {
    ...typography.h4,
    flex: 1,
  },
  recommendationDescription: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  interestTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.parent.from}20`,
  },
  interestTagText: {
    ...typography.caption,
    color: colors.parent.from,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
});
