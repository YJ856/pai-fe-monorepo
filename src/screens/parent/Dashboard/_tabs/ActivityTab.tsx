/**
 * 대시보드 > 활동 탭
 *
 * 주요 기능:
 * - 달력 표시 (날짜별 대화 이벤트 마커)
 * - 날짜 선택 → 갤러리 화면 이동 버튼
 * - 또는 바로 갤러리 표시 (설계에 따라)
 *
 * 네비게이션:
 * - ActivityCalendar 화면으로 이동
 * - ActivityGallery 화면으로 이동
 *
 * 사용 컴포넌트:
 * - ActivityCalendar (Dashboard/components/)
 *
 * 사용 훅:
 * - useActivityData (Dashboard/hooks/)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Calendar, Grid, MessageCircle } from 'lucide-react-native';
import { Button } from '../../../../design/components/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../../../design/tokens';

interface ActivityTabProps {
  childId: string;
}

interface ActivityDay {
  date: string;
  count: number;
}

interface RecentActivity {
  id: string;
  title: string;
  date: Date;
  thumbnailUrl?: string;
}

// Mock data
const MOCK_ACTIVITIES: ActivityDay[] = [
  { date: '2025-01-01', count: 3 },
  { date: '2025-01-05', count: 5 },
  { date: '2025-01-08', count: 2 },
  { date: '2025-01-09', count: 4 },
];

const MOCK_RECENT: RecentActivity[] = [
  {
    id: '1',
    title: '공룡은 어떤 동물일까?',
    date: new Date(),
  },
  {
    id: '2',
    title: '바다에 사는 동물들',
    date: new Date(Date.now() - 86400000),
  },
  {
    id: '3',
    title: '우주는 얼마나 넓을까?',
    date: new Date(Date.now() - 172800000),
  },
];

export default function ActivityTab({ childId }: ActivityTabProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activities] = useState<ActivityDay[]>(MOCK_ACTIVITIES);
  const [recentActivities] = useState<RecentActivity[]>(MOCK_RECENT);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return '오늘';
    if (days === 1) return '어제';
    return `${days}일 전`;
  };

  const handleCalendarPress = () => {
    console.log('Open calendar view');
  };

  const handleGalleryPress = () => {
    console.log('Open gallery view');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Calendar Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color={colors.parent.from} />
          <Text style={styles.sectionTitle}>활동 현황</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activities.length}</Text>
              <Text style={styles.statLabel}>활동 일수</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {activities.reduce((sum, a) => sum + a.count, 0)}
              </Text>
              <Text style={styles.statLabel}>총 대화</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {activities.length > 0
                  ? Math.round(
                      activities.reduce((sum, a) => sum + a.count, 0) /
                        activities.length
                    )
                  : 0}
              </Text>
              <Text style={styles.statLabel}>평균/일</Text>
            </View>
          </View>

          <Button
            variant="outline"
            onPress={handleCalendarPress}
            style={{ marginTop: spacing.md }}
          >
            달력으로 보기
          </Button>
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Grid size={20} color={colors.parent.from} />
          <Text style={styles.sectionTitle}>최근 활동</Text>
        </View>

        <View style={styles.card}>
          {recentActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityItem}
              onPress={() => console.log('Activity clicked:', activity.id)}
            >
              {activity.thumbnailUrl ? (
                <Image
                  source={{ uri: activity.thumbnailUrl }}
                  style={styles.activityThumbnail}
                />
              ) : (
                <View style={styles.activityThumbnailPlaceholder}>
                  <MessageCircle size={24} color={colors.parent.from} />
                </View>
              )}

              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle} numberOfLines={1}>
                  {activity.title}
                </Text>
                <Text style={styles.activityDate}>
                  {formatDate(activity.date)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          <Button
            variant="outline"
            onPress={handleGalleryPress}
            style={{ marginTop: spacing.md }}
          >
            전체 갤러리 보기
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.parent.from,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.background.tertiary,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  activityThumbnail: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  activityThumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body1,
    marginBottom: spacing.xs,
  },
  activityDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
