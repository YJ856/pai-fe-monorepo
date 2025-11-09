/**
 * 자녀 퀴즈 화면 (탭 컨테이너)
 *
 * 주요 기능:
 * - 탭 전환 (오늘/지난)
 * - 탭별 컴포넌트 렌더링
 *
 * 탭 구성:
 * - TodayTab: 오늘의 퀴즈
 * - PastTab: 지난 퀴즈
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../../design/layouts/ScreenContainer';
import { Tab } from '../../../design/components/Tab';
import TodayTab from './_tabs/TodayTab';
import PastTab from './_tabs/PastTab';

type TabKey = 'today' | 'past';

export default function ChildQuizScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');

  const tabs = [
    { key: 'today', label: '오늘' },
    { key: 'past', label: '지난' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return <TodayTab />;
      case 'past':
        return <PastTab />;
      default:
        return null;
    }
  };

  return (
    <ScreenContainer noPadding>
      <View style={styles.container}>
        <Tab
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as TabKey)}
        />
        <View style={styles.content}>{renderTabContent()}</View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
