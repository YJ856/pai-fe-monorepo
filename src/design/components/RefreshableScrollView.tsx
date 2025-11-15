/**
 * RefreshableScrollView 컴포넌트
 *
 * pull-to-refresh 기능이 있는 공통 ScrollView 컴포넌트
 *
 * 사용 예시:
 * ```tsx
 * const [refreshing, setRefreshing] = useState(false);
 *
 * const onRefresh = async () => {
 *   setRefreshing(true);
 *   await fetchData();
 *   setRefreshing(false);
 * };
 *
 * <RefreshableScrollView
 *   refreshing={refreshing}
 *   onRefresh={onRefresh}
 * >
 *   {children}
 * </RefreshableScrollView>
 * ```
 */

import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  RefreshControl,
  StyleSheet,
} from 'react-native';

interface RefreshableScrollViewProps extends ScrollViewProps {
  /** 새로고침 중인지 여부 */
  refreshing: boolean;
  /** 새로고침 콜백 함수 */
  onRefresh: () => void | Promise<void>;
  /** RefreshControl 색상 (선택사항) */
  tintColor?: string;
  /** RefreshControl 배경색 (Android, 선택사항) */
  backgroundColor?: string;
}

export const RefreshableScrollView: React.FC<RefreshableScrollViewProps> = ({
  refreshing,
  onRefresh,
  tintColor = '#5B9BD5',
  backgroundColor,
  children,
  ...scrollViewProps
}) => {
  return (
    <ScrollView
      {...scrollViewProps}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tintColor}
          colors={[tintColor]} // Android
          progressBackgroundColor={backgroundColor} // Android
        />
      }
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // 필요한 경우 스타일 추가
});
