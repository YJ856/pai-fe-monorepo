/**
 * ActivityCalendar 컴포넌트
 *
 * 활동 달력 프레젠테이션 컴포넌트 (react-native-calendars 사용)
 *
 * 주요 기능:
 * - 달력 UI 렌더링
 * - 날짜별 이벤트 마커 표시 (1-2개, 3-4개, 5개 이상)
 * - 날짜 선택 이벤트 처리
 *
 * Props:
 * - events: { date: string, count: number }[]
 * - selectedDate?: string
 * - onDateSelect: (date: string) => void
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from "../../../../design/tokens";

// 한국어 로케일 설정
LocaleConfig.locales['kr'] = {
  monthNames: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ],
  monthNamesShort: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'kr';

interface ActivityDay {
  date: string;
  count: number;
}

interface ActivityCalendarProps {
  events: ActivityDay[];
  selectedDate?: string;
  onDateSelect: (date: string) => void;
}

export default function ActivityCalendar({
  events,
  selectedDate,
  onDateSelect,
}: ActivityCalendarProps) {
  // events를 markedDates 형식으로 변환
  const markedDates: any = {};

  events.forEach((event) => {
    const dotCount = event.count >= 5 ? 3 : event.count >= 3 ? 2 : 1;

    markedDates[event.date] = {
      marked: true,
      dots: Array(dotCount).fill({ color: colors.parent.from }),
    };
  });

  // 선택된 날짜 표시
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: colors.parent.from,
    };
  }

  // 오늘 날짜 표시
  const today = new Date().toISOString().split('T')[0];
  if (!markedDates[today]) {
    markedDates[today] = {};
  }
  if (today !== selectedDate) {
    markedDates[today] = {
      ...markedDates[today],
      customStyles: {
        container: {
          borderWidth: 1,
          borderColor: colors.parent.from,
          borderRadius: borderRadius.md,
        },
        text: {
          color: colors.parent.from,
          fontWeight: '600',
        },
      },
    };
  }

  return (
    <View style={styles.container}>
      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day) => onDateSelect(day.dateString)}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.background,
          textSectionTitleColor: colors.text.secondary,
          selectedDayBackgroundColor: colors.parent.from,
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: colors.parent.from,
          dayTextColor: colors.text.primary,
          textDisabledColor: colors.muted,
          dotColor: colors.parent.from,
          selectedDotColor: '#FFFFFF',
          arrowColor: colors.parent.from,
          monthTextColor: colors.text.primary,
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
        style={styles.calendar}
      />

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendDotContainer}>
            <View style={[styles.dot, { backgroundColor: colors.parent.from }]} />
          </View>
          <Text style={styles.legendText}>1-2개</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendDotContainer}>
            <View style={[styles.dot, { backgroundColor: colors.parent.from }]} />
            <View style={[styles.dot, { backgroundColor: colors.parent.from }]} />
          </View>
          <Text style={styles.legendText}>3-4개</Text>
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
  calendar: {
    borderRadius: borderRadius.md,
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
