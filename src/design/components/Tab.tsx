/**
 * Tab 컴포넌트
 *
 * 공용 탭 컴포넌트
 * - 수평 스크롤 가능한 탭 바
 * - 활성 탭 하이라이트
 *
 * 사용 예시:
 * const [activeTab, setActiveTab] = useState('today');
 *
 * <Tab
 *   tabs={[
 *     { key: 'today', label: '오늘' },
 *     { key: 'past', label: '지난' },
 *     { key: 'scheduled', label: '예정' },
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 */

import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../tokens';

export interface TabItem {
  key: string;
  label: string;
}

export interface TabProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function Tab({ tabs, activeTab, onTabChange }: TabProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },

  contentContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
  },

  tabActive: {
    backgroundColor: colors.primary[500],
  },

  tabText: {
    ...typography.body2,
    color: colors.text.secondary,
  },

  tabTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
});
