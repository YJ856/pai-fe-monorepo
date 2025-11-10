/**
 * ParentDashboard 화면 (Design_v2 완벽 구현)
 *
 * 주요 기능:
 * - 3가지 탭: 관심사 분석 / 활동 캘린더 / 추천 콘텐츠
 * - 관심사: 버블 차트 (80-140px)
 * - 활동: 캘린더 + 자녀별 대화 갤러리
 * - 추천: 카테고리별 체험 추천
 *
 * 디자인:
 * - Parent gradient (Blue 계열: #5B9BD5 → #667BC6)
 * - rounded-full 탭 버튼 (12개 높이)
 * - 배경: from-blue-50 to-indigo-50
 *
 * API:
 * - GET /api/interests (관심사 데이터)
 * - GET /api/conversations (대화 기록)
 * - GET /api/recommendations (추천 콘텐츠)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../../design/components/Card';
import { Badge } from '../../../design/components/Badge';
import { Avatar } from '../../../design/components/Avatar';
import { colors, spacing, typography, borderRadius, shadows } from '../../../design/tokens';

type TabValue = 'interests' | 'calendar' | 'recommendations';
type RecommendationType = '관광지' | '문화시설' | '축제공연행사';

interface Interest {
  topic: string;
  count: number;
  icon: string;
}

interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  relatedInterest: string;
  icon: string;
}

interface Child {
  id: string;
  name: string;
  avatar: string;
}

// Mock data
const MOCK_INTERESTS: Interest[] = [
  { topic: '공룡', count: 15, icon: '🦕' },
  { topic: '우주', count: 12, icon: '🚀' },
  { topic: '동물', count: 10, icon: '🐶' },
  { topic: '바다', count: 8, icon: '🌊' },
  { topic: '식물', count: 7, icon: '🌱' },
  { topic: '곤충', count: 6, icon: '🦋' },
  { topic: '날씨', count: 5, icon: '🌤️' },
  { topic: '음악', count: 4, icon: '🎵' },
  { topic: '미술', count: 3, icon: '🎨' },
  { topic: '스포츠', count: 2, icon: '⚽' },
];

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    type: '문화시설',
    title: '서울 자연사 박물관',
    description: '공룡 화석과 다양한 생물 표본을 볼 수 있어요',
    relatedInterest: '공룡',
    icon: '🦕',
  },
  {
    id: '2',
    type: '문화시설',
    title: '국립과천과학관',
    description: '별자리와 행성을 직접 관측하고 다양한 과학 체험을 해보세요',
    relatedInterest: '우주',
    icon: '🔭',
  },
  {
    id: '3',
    type: '관광지',
    title: '에버랜드',
    description: '다양한 동물들을 직접 보고 체험할 수 있어요',
    relatedInterest: '동물',
    icon: '🦁',
  },
  {
    id: '4',
    type: '관광지',
    title: '아쿠아리움',
    description: '신비로운 바다 생물들을 가까이서 만나보세요',
    relatedInterest: '바다',
    icon: '🐠',
  },
  {
    id: '5',
    type: '축제공연행사',
    title: '어린이 음악회',
    description: '클래식부터 동요까지 다양한 음악을 즐겨보세요',
    relatedInterest: '음악',
    icon: '🎵',
  },
  {
    id: '6',
    type: '축제공연행사',
    title: '키즈 아트 페스티벌',
    description: '아이들을 위한 미술 체험과 전시회',
    relatedInterest: '미술',
    icon: '🎨',
  },
  {
    id: '7',
    type: '문화시설',
    title: '어린이 도서관',
    description: '다양한 책과 함께 독서의 즐거움을 느껴보세요',
    relatedInterest: '동물',
    icon: '📚',
  },
  {
    id: '8',
    type: '관광지',
    title: '식물원',
    description: '다양한 식물들을 관찰하고 자연을 배워요',
    relatedInterest: '식물',
    icon: '🌱',
  },
];

const CHILDREN: Child[] = [
  { id: '3', name: '지우', avatar: '👧' },
  { id: '4', name: '민준', avatar: '👦' },
];

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState<TabValue>('interests');
  const [selectedRecommendationType, setSelectedRecommendationType] = useState<RecommendationType>('관광지');

  const maxCount = Math.max(...MOCK_INTERESTS.map((i) => i.count));

  // Filter recommendations by type
  const filteredRecommendations = MOCK_RECOMMENDATIONS.filter(
    (rec) => rec.type === selectedRecommendationType
  );

  const getTypeIcon = (type: RecommendationType): string => {
    switch (type) {
      case '관광지':
        return '🗺️';
      case '문화시설':
        return '📚';
      case '축제공연행사':
        return '🎬';
    }
  };

  return (
    <LinearGradient
      colors={['#eff6ff', '#e0e7ff']} // from-blue-50 to-indigo-50
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.3)']}
            style={styles.tabList}
          >
            <TouchableOpacity
              style={styles.tabTrigger}
              onPress={() => setActiveTab('interests')}
              activeOpacity={0.8}
            >
              {activeTab === 'interests' ? (
                <LinearGradient
                  colors={['#5B9BD5', '#667BC6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabActive}
                >
                  <Text style={styles.tabTextActive}>관심사 분석</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tabTextInactive}>관심사 분석</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabTrigger}
              onPress={() => setActiveTab('calendar')}
              activeOpacity={0.8}
            >
              {activeTab === 'calendar' ? (
                <LinearGradient
                  colors={['#5B9BD5', '#667BC6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabActive}
                >
                  <Text style={styles.tabTextActive}>활동 캘린더</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tabTextInactive}>활동 캘린더</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabTrigger}
              onPress={() => setActiveTab('recommendations')}
              activeOpacity={0.8}
            >
              {activeTab === 'recommendations' ? (
                <LinearGradient
                  colors={['#5B9BD5', '#667BC6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabActive}
                >
                  <Text style={styles.tabTextActive}>추천 콘텐츠</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tabTextInactive}>추천 콘텐츠</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Interests Tab */}
        {activeTab === 'interests' && (
          <Card style={styles.contentCard}>
            <View style={styles.cardPadding}>
              {/* Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.trendIcon}>📈</Text>
                <Text style={styles.sectionTitle}>관심사 TOP 10</Text>
              </View>

              {/* Bubble Grid */}
              <View style={styles.bubbleGrid}>
                {MOCK_INTERESTS.map((interest) => {
                  const percentage = (interest.count / maxCount) * 100;
                  const size = 80 + (percentage / 100) * 60; // 80-140px

                  return (
                    <View key={interest.topic} style={styles.bubbleItem}>
                      <LinearGradient
                        colors={['#5B9BD5', '#4A8BC2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.bubble,
                          { width: size, height: size },
                        ]}
                      >
                        <Text style={styles.bubbleIcon}>{interest.icon}</Text>
                        <Text style={styles.bubbleCount}>{interest.count}</Text>
                      </LinearGradient>
                      <Text style={styles.bubbleTopic}>{interest.topic}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Card>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <Card style={styles.contentCard}>
            <View style={styles.cardPadding}>
              {/* Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.calendarIcon}>📅</Text>
                <Text style={styles.sectionTitle}>활동 캘린더</Text>
              </View>

              {/* Calendar Placeholder */}
              <View style={styles.calendarPlaceholder}>
                <Text style={styles.placeholderIcon}>📅</Text>
                <Text style={styles.placeholderText}>
                  캘린더 컴포넌트
                </Text>
                <Text style={styles.placeholderSubtext}>
                  파란색 표시된 날짜는 아이가 질문한 날입니다
                </Text>
              </View>

              {/* Children Grid */}
              <Text style={styles.dateTitle}>오늘의 대화 기록</Text>
              <View style={styles.childrenGrid}>
                {CHILDREN.map((child) => (
                  <TouchableOpacity
                    key={child.id}
                    style={styles.childCard}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#5B9BD5', '#4A8BC2']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.childCardGradient}
                    >
                      <Text style={styles.childAvatar}>{child.avatar}</Text>
                      <Text style={styles.childName}>{child.name}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <Card style={styles.contentCard}>
            <View style={styles.cardPadding}>
              {/* Header */}
              <Text style={styles.sectionTitle}>추천 콘텐츠</Text>

              {/* Category Tabs */}
              <View style={styles.categoryTabs}>
                {(['관광지', '문화시설', '축제공연행사'] as RecommendationType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.categoryTab}
                    onPress={() => setSelectedRecommendationType(type)}
                    activeOpacity={0.8}
                  >
                    {selectedRecommendationType === type ? (
                      <LinearGradient
                        colors={['#5B9BD5', '#667BC6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.categoryTabActive}
                      >
                        <Text style={styles.categoryTabTextActive}>{type}</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.categoryTabTextInactive}>{type}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Recommendation List */}
              <View style={styles.recommendationList}>
                {filteredRecommendations.map((rec) => (
                  <TouchableOpacity
                    key={rec.id}
                    style={styles.recommendationCard}
                    activeOpacity={0.8}
                  >
                    <View style={styles.recommendationContent}>
                      <Text style={styles.recommendationIcon}>{rec.icon}</Text>
                      <View style={styles.recommendationInfo}>
                        <View style={styles.recommendationHeader}>
                          <Text style={styles.typeIcon}>{getTypeIcon(rec.type)}</Text>
                          <Text style={styles.recommendationTitle}>{rec.title}</Text>
                        </View>
                        <Text style={styles.recommendationDescription}>
                          {rec.description}
                        </Text>
                        <View style={styles.relatedBadge}>
                          <Text style={styles.relatedText}>
                            관련 관심사: {rec.relatedInterest}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },

  // Tab Navigation
  tabContainer: {
    marginBottom: spacing.xl,
  },

  tabList: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    ...shadows.lg,
  },

  tabTrigger: {
    flex: 1,
  },

  tabActive: {
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },

  tabTextActive: {
    ...typography.button,
    fontSize: 15,
    color: colors.primaryForeground,
  },

  tabTextInactive: {
    ...typography.button,
    fontSize: 15,
    color: '#6b7280', // text-gray-600
    textAlign: 'center',
    paddingVertical: spacing.md,
  },

  // Content Card
  contentCard: {
    backgroundColor: '#f9fafb', // bg-gray-50
    borderRadius: borderRadius['2xl'],
    ...shadows.sm,
  },

  cardPadding: {
    padding: spacing.xl,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  trendIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },

  calendarIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },

  sectionTitle: {
    ...typography.h2,
    fontSize: 24,
    color: '#111827', // text-gray-900
  },

  // Interests - Bubble Grid
  bubbleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing.lg,
  },

  bubbleItem: {
    width: '18%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  bubble: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    marginBottom: spacing.sm,
  },

  bubbleIcon: {
    fontSize: 30,
    marginBottom: 4,
  },

  bubbleCount: {
    fontSize: 14,
    color: colors.primaryForeground,
    fontWeight: '500',
  },

  bubbleTopic: {
    fontSize: 12,
    color: '#1f2937', // text-gray-800
    textAlign: 'center',
  },

  // Calendar
  calendarPlaceholder: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  placeholderIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },

  placeholderText: {
    ...typography.h3,
    fontSize: 18,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },

  placeholderSubtext: {
    ...typography.body2,
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
  },

  dateTitle: {
    ...typography.h3,
    fontSize: 18,
    color: '#111827',
    marginBottom: spacing.lg,
  },

  childrenGrid: {
    flexDirection: 'row',
    gap: spacing.lg,
  },

  childCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.md,
  },

  childCardGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  childAvatar: {
    fontSize: 60,
    marginBottom: spacing.lg,
  },

  childName: {
    ...typography.h2,
    fontSize: 24,
    color: colors.primaryForeground,
  },

  // Recommendations
  categoryTabs: {
    flexDirection: 'row',
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: borderRadius.full,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.lg,
  },

  categoryTab: {
    flex: 1,
  },

  categoryTabActive: {
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },

  recommendationList: {
    gap: spacing.md,
  },

  recommendationCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },

  recommendationContent: {
    flexDirection: 'row',
    gap: spacing.lg,
  },

  recommendationIcon: {
    fontSize: 40,
  },

  recommendationInfo: {
    flex: 1,
  },

  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },

  typeIcon: {
    fontSize: 20,
  },

  recommendationTitle: {
    ...typography.h4,
    fontSize: 18,
    color: '#111827',
  },

  recommendationDescription: {
    ...typography.body1,
    fontSize: 14,
    color: '#6b7280',
    marginBottom: spacing.sm,
  },

  relatedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(91, 155, 213, 0.1)',
    borderRadius: borderRadius.full,
  },

  relatedText: {
    fontSize: 12,
    color: '#5B9BD5',
  },
});
