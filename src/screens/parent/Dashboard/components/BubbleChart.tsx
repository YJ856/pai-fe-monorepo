/**
 * BubbleChart 컴포넌트
 * - 관심사 데이터를 버블 차트로 시각화
 * - 크기: count 값에 비례 (42.5-75px)
 * - 색상: 10가지 그라데이션 팔레트
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { spacing, borderRadius, shadows } from "../../../../design/tokens";

interface Interest {
  topic: string;
  count: number;
  icon: string;
}

interface BubbleChartProps {
  data: Interest[];
}

// 10가지 예쁜 그라데이션 색상 팔레트
const COLOR_PALETTES = [
  ["#667eea", "#764ba2"], // 보라-파랑
  ["#f093fb", "#f5576c"], // 핑크-레드
  ["#4facfe", "#00f2fe"], // 하늘-청록
  ["#43e97b", "#38f9d7"], // 초록-민트
  ["#fa709a", "#fee140"], // 핑크-노랑
  ["#30cfd0", "#330867"], // 청록-남색
  ["#a8edea", "#fed6e3"], // 민트-핑크
  ["#ff9a9e", "#fecfef"], // 코랄-핑크
  ["#ffecd2", "#fcb69f"], // 피치-오렌지
  ["#ff6e7f", "#bfe9ff"], // 레드-스카이
];

export default function BubbleChart({ data }: BubbleChartProps) {
  const maxCount = Math.max(...data.map((i) => i.count), 1);

  return (
    <View style={styles.container}>
      {data.map((interest, index) => {
        const percentage = (interest.count / maxCount) * 100;
        const size = 42.5 + (percentage / 100) * 32.5; // 42.5-75px

        const colors = COLOR_PALETTES[index % COLOR_PALETTES.length];

        return (
          <View key={interest.topic} style={styles.bubbleItem}>
            <LinearGradient
              colors={colors as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.bubble,
                {
                  width: size,
                  height: size,
                  shadowColor: colors[0],
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                },
              ]}
            >
              <Text style={styles.bubbleIcon}>{interest.icon}</Text>
              <Text style={styles.bubbleCount}>{interest.count}</Text>
            </LinearGradient>
            <Text style={styles.bubbleTopic}>{interest.topic}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: spacing.lg,
  },
  bubbleItem: {
    width: "18%",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  bubble: {
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.lg,
    marginBottom: spacing.sm,
  },
  bubbleIcon: {
    fontSize: 30,
    marginBottom: 4,
  },
  bubbleCount: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  bubbleTopic: {
    fontSize: 12,
    color: "#1f2937",
    textAlign: "center",
  },
});
