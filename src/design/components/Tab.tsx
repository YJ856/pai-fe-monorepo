/**
 * Tab 컴포넌트
 *
 * 공용 탭 컴포넌트
 * - 수평 스크롤 가능한 탭 바
 * - 활성 탭 하이라이트
 * - Gradient 배경 지원
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
 *
 * <Tab
 *   tabs={[{ key: 'login', label: '로그인' }, { key: 'signup', label: '회원가입' }]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   variant="full"
 *   gradient={{ from: '#1e3a8a', to: '#3b82f6' }}
 * />
 */

import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../tokens';

export interface TabItem {
  key: string;
  label: string;
}

export interface TabProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  variant?: 'scrollable' | 'full'; // scrollable: 스크롤 가능, full: 전체 너비
  gradient?: { from: string; to: string };
  style?: ViewStyle;
}

export function Tab({
  tabs,
  activeTab,
  onTabChange,
  variant = 'scrollable',
  gradient,
  style,
}: TabProps) {
  if (variant === 'full') {
    // Full width variant (로그인/회원가입용)
    return (
      <View style={[styles.fullContainer, style]}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.fullTab}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
            >
              {isActive && gradient ? (
                <LinearGradient
                  colors={[gradient.from, gradient.to]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.fullTabGradient}
                >
                  <Text style={[styles.tabText, styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.fullTabContent,
                    isActive && !gradient && styles.tabActive,
                  ]}
                >
                  <Text
                    style={[styles.tabText, isActive && styles.tabTextActive]}
                  >
                    {tab.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // Scrollable variant (기본)
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
  // Scrollable variant
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

  // Full width variant
  fullContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.gray,
    borderRadius: borderRadius.md,
    padding: 4,
  },

  fullTab: {
    flex: 1,
  },

  fullTabContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fullTabGradient: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
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
