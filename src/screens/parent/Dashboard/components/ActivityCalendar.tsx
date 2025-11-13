/**
 * ActivityCalendar 컴포넌트
 *
 * 활동 달력 프레젠테이션 컴포넌트
 *
 * 주요 기능:
 * - 달력 UI 렌더링
 * - 날짜별 이벤트 마커 표시
 * - 날짜 선택 이벤트 처리
 *
 * Props:
 * - events: { date: string, count: number }[]
 * - selectedDate?: string
 * - onDateSelect: (date: string) => void
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from "../../../../design/tokens";

interface ActivityDay {
  date: string;
  count: number;
}

interface ActivityCalendarProps {
  events: ActivityDay[];
  selectedDate?: string;
  onDateSelect: (date: string) => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function ActivityCalendar({
  events,
  selectedDate,
  onDateSelect,
}: ActivityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 이벤트 맵 생성
  const eventMap = React.useMemo(() => {
    const map = new Map<string, number>();
    events.forEach((event) => {
      map.set(event.date, event.count);
    });
    return map;
  }, [events]);

  // 현재 월의 날짜들 생성
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // 이전 달의 빈 칸 채우기
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // 현재 달의 날짜 채우기
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDayPress = (date: Date) => {
    const dateString = formatDate(date);
    onDateSelect(dateString);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date): boolean => {
    const dateString = formatDate(date);
    return dateString === selectedDate;
  };

  const getActivityDots = (date: Date) => {
    const dateString = formatDate(date);
    const count = eventMap.get(dateString) || 0;

    if (count === 0) return null;

    const dotCount = count >= 5 ? 3 : count >= 3 ? 2 : 1;
    const dots = [];

    for (let i = 0; i < dotCount; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.activityDot,
            { backgroundColor: colors.parent.from },
          ]}
        />
      );
    }

    return <View style={styles.dotsContainer}>{dots}</View>;
  };

  const days = getDaysInMonth();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <ChevronLeft size={24} color={colors.parent.from} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <ChevronRight size={24} color={colors.parent.from} />
        </TouchableOpacity>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={day} style={styles.weekdayCell}>
            <Text
              style={[
                styles.weekdayText,
                index === 0 && { color: "#FF5252" },
                index === 6 && { color: "#448AFF" },
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {days.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const today = isToday(date);
          const selected = isSelected(date);

          return (
            <TouchableOpacity
              key={formatDate(date)}
              style={[
                styles.dayCell,
                selected && styles.selectedDay,
                today && !selected && styles.todayDay,
              ]}
              onPress={() => handleDayPress(date)}
            >
              <Text
                style={[
                  styles.dayText,
                  selected && styles.selectedDayText,
                  today && !selected && styles.todayDayText,
                ]}
              >
                {date.getDate()}
              </Text>
              {getActivityDots(date)}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendDotContainer}>
            <View style={[styles.dot, { backgroundColor: colors.parent.from }]} />
          </View>
          <Text style={styles.legendText}>1-2개 대화</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendDotContainer}>
            <View style={[styles.dot, { backgroundColor: colors.parent.from }]} />
            <View style={[styles.dot, { backgroundColor: colors.parent.from }]} />
          </View>
          <Text style={styles.legendText}>3-4개 대화</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendDotContainer}>
            <View style={[styles.dot, { backgroundColor: colors.parent.from }]} />
            <View style={[styles.dot, { backgroundColor: colors.parent.from }]} />
            <View style={[styles.dot, { backgroundColor: colors.parent.from }]} />
          </View>
          <Text style={styles.legendText}>5개 이상</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  navButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  weekdayText: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
  },
  selectedDay: {
    backgroundColor: colors.parent.from,
    borderRadius: borderRadius.md,
  },
  todayDay: {
    borderWidth: 1,
    borderColor: colors.parent.from,
    borderRadius: borderRadius.md,
  },
  dayText: {
    ...typography.body2,
    color: colors.text.primary,
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  todayDayText: {
    color: colors.parent.from,
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
  },
  activityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  legendDotContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minWidth: 20,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
