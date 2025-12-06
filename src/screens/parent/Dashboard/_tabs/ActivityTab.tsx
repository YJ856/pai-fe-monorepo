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
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar } from "lucide-react-native";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../../../design/tokens";
import { Card } from "../../../../design/components/Card";
import ActivityCalendar from "../components/ActivityCalendar";
import { useConversationsCalendar } from "../hooks/activity/useConversationsCalendar";
import { Profile } from "pai-shared-types";

interface ActivityTabProps {
  childId: string;
  childProfiles: Profile[];
  onChildPress: (childId: string, date: string) => void;
}

export default function ActivityTab({ childId, childProfiles, onChildPress }: ActivityTabProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 현재 연/월을 초기값으로 설정
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);

  // 캘린더 데이터 조회 (모든 자녀의 대화 개수 포함)
  const { days } = useConversationsCalendar({
    year: currentYear,
    month: currentMonth,
  });

  // ActivityCalendar 컴포넌트용 데이터 변환
  const activities = days.map((day) => ({
    date: day.date,
    count: day.count,
  }));

  // 오늘 날짜를 YYYY-MM-DD 형식으로
  const today = new Date().toISOString().split("T")[0];

  // 선택된 날짜의 대화 자녀 목록
  const selectedDayData = days.find((day) => day.date === (selectedDate || today));
  const childrenWithConversations = selectedDayData?.children || [];

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
          onMonthChange={(year, month) => {
            setCurrentYear(year);
            setCurrentMonth(month);
            console.log("Month changed:", year, month);
          }}
        />

        {/* Children Grid - 대화가 있는 자녀만 표시 */}
        <View style={styles.dateBadge}>
          <Calendar size={16} color={colors.parent.from} />
          <Text style={styles.dateText}>
            {selectedDate || today}
          </Text>
        </View>
        {childrenWithConversations.length > 0 ? (
          <View style={styles.childrenGrid}>
            {childrenWithConversations.map((childData) => {
              // childProfiles에서 해당 자녀 찾기 (아바타 URL 사용하기 위해)
              const childProfile = childProfiles.find(
                (p) => String(p.profileId) === String(childData.childProfileId)
              );

              return (
                <TouchableOpacity
                  key={String(childData.childProfileId)}
                  style={styles.childCard}
                  activeOpacity={0.8}
                  onPress={() => onChildPress(String(childData.childProfileId), selectedDate || today)}
                >
                  <LinearGradient
                    colors={["#5B9BD5", "#4A8BC2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.childCardGradient}
                  >
                    <View style={styles.childCardCenter}>
                      {/* API에서 받은 아바타 또는 프로필 아바타 */}
                      {childData.childAvatarMediaId || childProfile?.avatarUrl ? (
                        <Image
                          source={{
                            uri: childProfile?.avatarUrl || `https://api.example.com/media/${childData.childAvatarMediaId}`
                          }}
                          style={styles.childAvatarImage}
                        />
                      ) : (
                        <Text style={styles.childAvatar}>
                          {childProfile?.gender === "male" ? "👦" : "👧"}
                        </Text>
                      )}
                      <Text style={styles.childName}>{childData.childName}</Text>
                    </View>
                    <Text style={styles.childConversationCount}>{childData.count}개 대화</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>이 날짜에는 대화 기록이 없습니다</Text>
          </View>
        )}
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
    padding: spacing.lg,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(91, 155, 213, 0.15)",
    borderRadius: 100,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateText: {
    ...typography.body2,
    fontWeight: "600",
    color: colors.parent.from,
  },
  childrenGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  childCard: {
    width: "48%",
    aspectRatio: 1.2,
    borderRadius: borderRadius["2xl"],
    overflow: "hidden",
    ...shadows.md,
  },
  childCardGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  childCardCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  childAvatar: {
    fontSize: 32,
    marginBottom: spacing.xs / 2,
  },
  childAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: spacing.xs / 2,
  },
  childName: {
    ...typography.h3,
    fontSize: 16,
    color: colors.primaryForeground,
  },
  childConversationCount: {
    ...typography.caption,
    fontSize: 11,
    color: colors.primaryForeground,
    opacity: 0.9,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  emptyText: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: "center",
  },
});
