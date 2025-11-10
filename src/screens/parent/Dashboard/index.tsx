/**
 * 부모 대시보드 화면
 *
 * 주요 기능:
 * - 3가지 탭 (관심사/활동/추천)
 * - 관심사: 자녀 관심사 워드클라우드 및 트렌드
 * - 활동: 날짜별 대화 기록, 갤러리 뷰
 * - 추천: 자녀 관심사 기반 체험 추천
 *
 * 디자인:
 * - 블루 그라데이션 배경 (from-blue-50 to-indigo-50)
 * - 둥근 탭 버튼, 활성 탭 블루 그라데이션
 * - 카드 스타일 콘텐츠
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, MapPin, Book, Video } from 'lucide-react-native';
import { spacing, typography, borderRadius, shadows } from '../../../design/tokens';

interface Interest {
  topic: string;
  count: number;
  icon: string;
}

interface Recommendation {
  id: string;
  type: '관광지' | '문화시설' | '축제공연행사';
  title: string;
  description: string;
  relatedInterest: string;
  icon: string;
}

const MOCK_INTERESTS: Interest[] = [
  { topic: '공룡', count: 15, icon: '🦕' },
  { topic: '우주', count: 12, icon: '🚀' },
  { topic: '동물', count: 10, icon: '🐶' },
  { topic: '바다', count: 8, icon: '🌊' },
  { topic: '식물', count: 7, icon: '🌱' },
  { topic: '곤충', count: 6, icon: '🦋' },
  { topic: '날씨', count: 5, icon: '🌤️' },
  { topic: '음악', count: 4, icon: '🎵' },
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
];

type TabKey = 'interests' | 'activity' | 'recommendations';

export default function ParentDashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('interests');
  const [selectedRecoType, setSelectedRecoType] = useState<'관광지' | '문화시설' | '축제공연행사'>(
    '관광지'
  );

  const maxCount = Math.max(...MOCK_INTERESTS.map((i) => i.count));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '관광지':
        return <MapPin size={20} color="#5B9BD5" />;
      case '문화시설':
        return <Book size={20} color="#5B9BD5" />;
      case '축제공연행사':
        return <Video size={20} color="#5B9BD5" />;
      default:
        return null;
    }
  };

  const filteredRecommendations = MOCK_RECOMMENDATIONS.filter(
    (rec) => rec.type === selectedRecoType
  );

  return (
    <LinearGradient colors={['#EFF6FF', '#E0E7FF']} style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsList}>
          <TouchableOpacity
            style={styles.tabTrigger}
            onPress={() => setActiveTab('interests')}
            activeOpacity={0.8}
          >
            {activeTab === 'interests' ? (
              <LinearGradient
                colors={['#5B9BD5', '#667BC6']}
                style={styles.tabTriggerActive}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.tabTextActive}>관심사</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabText}>관심사</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabTrigger}
            onPress={() => setActiveTab('activity')}
            activeOpacity={0.8}
          >
            {activeTab === 'activity' ? (
              <LinearGradient
                colors={['#5B9BD5', '#667BC6']}
                style={styles.tabTriggerActive}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.tabTextActive}>활동</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabText}>활동</Text>
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
                style={styles.tabTriggerActive}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.tabTextActive}>추천</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabText}>추천</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Interests Tab */}
        {activeTab === 'interests' && (
          <>
            {/* Trend Header */}
            <View style={styles.sectionHeader}>
              <TrendingUp size={24} color="#5B9BD5" />
              <Text style={styles.sectionTitle}>관심사 분석</Text>
            </View>

            {/* Interest Cards */}
            <View style={styles.interestsGrid}>
              {MOCK_INTERESTS.map((interest) => {
                const percentage = (interest.count / maxCount) * 100;
                return (
                  <View key={interest.topic} style={styles.interestCard}>
                    <Text style={styles.interestIcon}>{interest.icon}</Text>
                    <Text style={styles.interestTopic}>{interest.topic}</Text>
                    <View style={styles.interestBar}>
                      <View
                        style={[
                          styles.interestBarFill,
                          { width: `${percentage}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.interestCount}>{interest.count}회</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>달력을 통해 날짜별 대화 기록을 확인하세요</Text>
            <Text style={styles.emptySubtext}>활동 탭 기능은 추후 구현됩니다</Text>
          </View>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <>
            {/* Type Filter */}
            <View style={styles.typeFilter}>
              {(['관광지', '문화시설', '축제공연행사'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    selectedRecoType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setSelectedRecoType(type)}
                  activeOpacity={0.7}
                >
                  {getTypeIcon(type)}
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedRecoType === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recommendation Cards */}
            <View style={styles.recommendationsGrid}>
              {filteredRecommendations.map((reco) => (
                <TouchableOpacity
                  key={reco.id}
                  style={styles.recoCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.recoHeader}>
                    <Text style={styles.recoIcon}>{reco.icon}</Text>
                    <View style={styles.recoTypeBadge}>
                      <Text style={styles.recoTypeBadgeText}>{reco.type}</Text>
                    </View>
                  </View>
                  <Text style={styles.recoTitle}>{reco.title}</Text>
                  <Text style={styles.recoDescription}>{reco.description}</Text>
                  <View style={styles.recoRelated}>
                    <Text style={styles.recoRelatedText}>
                      {reco.relatedInterest} 관련
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 100,
    padding: 8,
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  tabTrigger: {
    flex: 1,
  },
  tabTriggerActive: {
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  tabText: {
    ...typography.button,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 12,
  },
  tabTextActive: {
    ...typography.button,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: '#111827',
  },
  interestsGrid: {
    gap: spacing.md,
  },
  interestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.sm,
  },
  interestIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  interestTopic: {
    ...typography.h4,
    color: '#111827',
    marginBottom: spacing.xs,
  },
  interestBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  interestBarFill: {
    height: '100%',
    backgroundColor: '#5B9BD5',
    borderRadius: 4,
  },
  interestCount: {
    ...typography.body2,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body1,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body2,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  typeFilter: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: spacing.xs,
  },
  typeButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#5B9BD5',
  },
  typeButtonText: {
    ...typography.body2,
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#5B9BD5',
    fontWeight: 'bold',
  },
  recommendationsGrid: {
    gap: spacing.md,
  },
  recoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.sm,
  },
  recoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  recoIcon: {
    fontSize: 32,
  },
  recoTypeBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  recoTypeBadgeText: {
    ...typography.caption,
    color: '#5B9BD5',
  },
  recoTitle: {
    ...typography.h4,
    color: '#111827',
    marginBottom: spacing.xs,
  },
  recoDescription: {
    ...typography.body2,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  recoRelated: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recoRelatedText: {
    ...typography.caption,
    color: '#9CA3AF',
  },
});
