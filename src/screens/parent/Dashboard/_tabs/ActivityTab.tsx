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

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../../../design/tokens";
import { Card } from "../../../../design/components/Card";
import ActivityCalendar from "../components/ActivityCalendar";
import { useActivityData } from "../hooks/useDashboardData";

interface ActivityTabProps {
  childId: string;
}

interface Child {
  id: string;
  name: string;
  avatar: string;
}

const CHILDREN: Child[] = [
  { id: "3", name: "지우", avatar: "👧" },
  { id: "4", name: "민준", avatar: "👦" },
];

export default function ActivityTab({ childId }: ActivityTabProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // API 데이터 조회
  const { data: activityData } = useActivityData(childId);

  // 활동 데이터 (API)
  const activities = activityData || [];

  return (
    <Card style={styles.contentCard}>
      <View style={styles.cardPadding}>
        {/* ActivityCalendar Component */}
        <ActivityCalendar
          events={activities}
          selectedDate={selectedDate || undefined}
          onDateSelect={(date) => {
            setSelectedDate(date);
            console.log("Selected date:", date);
          }}
        />

        {/* Children Grid */}
        <Text style={styles.dateTitle}>
          {selectedDate
            ? `${selectedDate} 대화 기록`
            : "오늘의 대화 기록"}
        </Text>
        <View style={styles.childrenGrid}>
          {CHILDREN.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.childCard}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#5B9BD5", "#4A8BC2"]}
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
  );
}

const styles = StyleSheet.create({
  contentCard: {
    backgroundColor: "#f9fafb",
    borderRadius: borderRadius["2xl"],
    ...shadows.sm,
  },
  cardPadding: {
    padding: spacing.xl,
  },
  dateTitle: {
    ...typography.h3,
    fontSize: 18,
    color: "#111827",
    marginBottom: spacing.lg,
  },
  childrenGrid: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  childCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: borderRadius["2xl"],
    overflow: "hidden",
    ...shadows.md,
  },
  childCardGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
});
