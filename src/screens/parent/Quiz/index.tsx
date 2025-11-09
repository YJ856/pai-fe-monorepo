/**
 * 부모 퀴즈 화면 (탭 컨테이너)
 *
 * 주요 기능:
 * - 탭 전환 (오늘/지난/예정)
 * - 탭별 컴포넌트 렌더링
 *
 * 탭 구성:
 * - TodayTab: 오늘의 퀴즈
 * - PastTab: 지난 퀴즈 (무한 스크롤)
 * - ScheduledTab: 예정된 퀴즈
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { Tab } from '../../../design/components/Tab';
import { colors, spacing, typography } from '../../../design/tokens';
import TodayTab from './_tabs/TodayTab';
import PastTab from './_tabs/PastTab';
import ScheduledTab from './_tabs/ScheduledTab';

type TabKey = 'today' | 'past' | 'scheduled';

export default function ParentQuizScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');

  const tabs = [
    { key: 'today', label: '오늘' },
    { key: 'past', label: '지난 퀴즈' },
    { key: 'scheduled', label: '예정' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return <TodayTab />;
      case 'past':
        return <PastTab />;
      case 'scheduled':
        return <ScheduledTab />;
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
          <TouchableOpacity onPress={() => console.log('Back')}>
            <ArrowLeft size={24} color={colors.text.inverse} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>퀴즈 관리</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <Tab
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as TabKey)}
            variant="scrollable"
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
