/**
 * 부모 대시보드 화면 (탭 컨테이너)
 *
 * 주요 기능:
 * - 탭 전환 (관심사/활동/추천)
 * - 탭별 컴포넌트 렌더링
 *
 * 탭 구성:
 * - InterestsTab: 관심사 분석 (워드클라우드, 트렌드 차트)
 * - ActivityTab: 활동 탭 (달력 선택 → 갤러리/상세 이동)
 * - RecommendationsTab: 추천 콘텐츠
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';
import { Tab } from '../../../design/components/Tab';
import { colors, spacing, typography } from '../../../design/tokens';
import InterestsTab from './_tabs/InterestsTab';
import ActivityTab from './_tabs/ActivityTab';
import RecommendationsTab from './_tabs/RecommendationsTab';

type TabKey = 'interests' | 'activity' | 'recommendations';

export default function ParentDashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('interests');
  const [selectedChildId, setSelectedChildId] = useState<string>('1'); // Mock

  const tabs = [
    { key: 'interests', label: '관심사' },
    { key: 'activity', label: '활동' },
    { key: 'recommendations', label: '추천' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'interests':
        return <InterestsTab childId={selectedChildId} />;
      case 'activity':
        return <ActivityTab childId={selectedChildId} />;
      case 'recommendations':
        return <RecommendationsTab childId={selectedChildId} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.parent.from, colors.parent.to]}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => console.log('Profile')}>
            <User size={24} color={colors.text.inverse} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>대시보드</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <Tab
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as TabKey)}
            variant="full"
            gradient={colors.parent}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>{renderTabContent()}</View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 40,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.inverse,
  },
  tabContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
