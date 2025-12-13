/**
 * BubbleChart 컴포넌트
 * - 관심사 데이터를 버블 차트로 시각화
 * - SVG 기반 패킹 알고리즘
 * - 크기: count 값에 비례
 * - 물리 시뮬레이션으로 겹치지 않도록 배치
 */

import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

interface Interest {
  topic: string;
  count: number;
  icon: string;
}

interface BubbleChartProps {
  data: Interest[];
}

// 색상 팔레트
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

interface Bubble {
  topic: string;
  count: number;
  icon: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export default function BubbleChart({ data }: BubbleChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64;

  // 데이터 개수에 따라 차트 높이 조정
  const dataCount = data.length;
  const baseHeight = 350;
  const chartHeight = Math.min(600, baseHeight + Math.floor(dataCount / 5) * 50);

  const bubbleData = useMemo(() => {
    if (data.length === 0) return [];

    const maxCount = Math.max(...data.map((t) => t.count), 1);

    // 버블 크기 계산 (데이터가 많을수록 작게)
    const sizeScale = dataCount > 15 ? 0.6 : dataCount > 10 ? 0.75 : 0.9;

    // 초기 버블 생성
    const bubbles: Bubble[] = data.map((topic, index) => {
      // 카운트에 비례하는 반지름 (최소 15, 최대 45)
      const normalizedCount = topic.count / maxCount;
      const baseRadius = 15 + normalizedCount * 30;
      const radius = baseRadius * sizeScale;

      // 초기 위치: 그리드 배치
      const cols = Math.ceil(Math.sqrt(dataCount));
      const row = Math.floor(index / cols);
      const col = index % cols;
      const cellWidth = chartWidth / cols;
      const cellHeight = chartHeight / Math.ceil(dataCount / cols);

      return {
        topic: topic.topic,
        count: topic.count,
        icon: topic.icon,
        x: col * cellWidth + cellWidth / 2,
        y: row * cellHeight + cellHeight / 2,
        vx: 0,
        vy: 0,
        radius,
        color: COLORS[index % COLORS.length],
      };
    });

    // 물리 시뮬레이션으로 버블 배치 최적화
    const iterations = 100; // 시뮬레이션 반복 횟수 증가
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;
    const damping = 0.85; // 속도 감쇠

    for (let iter = 0; iter < iterations; iter++) {
      // 중력: 중앙으로 끌어당기기 (약하게)
      bubbles.forEach(bubble => {
        const dx = centerX - bubble.x;
        const dy = centerY - bubble.y;
        const force = 0.02; // 중력 약하게
        bubble.vx += dx * force;
        bubble.vy += dy * force;
      });

      // 충돌 감지 및 반발력 (강하게)
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const b1 = bubbles[i];
          const b2 = bubbles[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = b1.radius + b2.radius + 8; // 여백 증가

          if (distance < minDistance && distance > 0) {
            // 겹침 - 밀어내기 (강하게)
            const overlap = minDistance - distance;
            const angle = Math.atan2(dy, dx);
            const force = overlap * 0.6; // 반발력 강하게

            const moveX = Math.cos(angle) * force;
            const moveY = Math.sin(angle) * force;

            b1.vx -= moveX;
            b1.vy -= moveY;
            b2.vx += moveX;
            b2.vy += moveY;
          }
        }
      }

      // 위치 업데이트
      bubbles.forEach(bubble => {
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;

        // 속도 감쇠
        bubble.vx *= damping;
        bubble.vy *= damping;

        // 경계 충돌 (강제로 안쪽에 유지)
        const padding = bubble.radius + 8;
        if (bubble.x < padding) {
          bubble.x = padding;
          bubble.vx = Math.abs(bubble.vx) * 0.3;
        }
        if (bubble.x > chartWidth - padding) {
          bubble.x = chartWidth - padding;
          bubble.vx = -Math.abs(bubble.vx) * 0.3;
        }
        if (bubble.y < padding) {
          bubble.y = padding;
          bubble.vy = Math.abs(bubble.vy) * 0.3;
        }
        if (bubble.y > chartHeight - padding) {
          bubble.y = chartHeight - padding;
          bubble.vy = -Math.abs(bubble.vy) * 0.3;
        }
      });
    }

    // 최종 검증: 겹침 제거 및 경계 확인
    bubbles.forEach((bubble, i) => {
      // 경계 강제 조정
      const minX = bubble.radius + 10;
      const maxX = chartWidth - bubble.radius - 10;
      const minY = bubble.radius + 10;
      const maxY = chartHeight - bubble.radius - 10;

      bubble.x = Math.max(minX, Math.min(maxX, bubble.x));
      bubble.y = Math.max(minY, Math.min(maxY, bubble.y));

      // 다른 버블과 겹치는지 최종 확인
      for (let j = 0; j < bubbles.length; j++) {
        if (i === j) continue;

        const other = bubbles[j];
        const dx = other.x - bubble.x;
        const dy = other.y - bubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = bubble.radius + other.radius + 8;

        if (distance < minDistance && distance > 0) {
          // 겹침 발견 - 밀어내기
          const angle = Math.atan2(dy, dx);
          const overlap = minDistance - distance;
          const moveX = Math.cos(angle) * overlap * 0.5;
          const moveY = Math.sin(angle) * overlap * 0.5;

          // 현재 버블만 이동 (이미 처리된 버블은 건드리지 않음)
          if (j < i) {
            bubble.x -= moveX;
            bubble.y -= moveY;
          }
        }
      }

      // 최종 경계 재확인
      bubble.x = Math.max(minX, Math.min(maxX, bubble.x));
      bubble.y = Math.max(minY, Math.min(maxY, bubble.y));
    });

    return bubbles;
  }, [data, chartWidth, chartHeight, dataCount]);

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>표시할 관심사 데이터가 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.chartContainer}>
          <Svg width={chartWidth} height={chartHeight}>
            {bubbleData.map((bubble, index) => {
              // 버블 크기에 따른 폰트 크기 조정
              const topicFontSize = bubble.radius > 30 ? 11 : bubble.radius > 20 ? 9 : 7;
              const countFontSize = bubble.radius > 30 ? 10 : bubble.radius > 20 ? 8 : 6;

              // 텍스트 길이에 따라 자르기
              const maxLength = bubble.radius > 30 ? 6 : bubble.radius > 20 ? 4 : 3;
              const displayTopic = bubble.topic.length > maxLength
                ? bubble.topic.substring(0, maxLength) + '..'
                : bubble.topic;

              return (
                <React.Fragment key={index}>
                  {/* 버블 */}
                  <Circle
                    cx={bubble.x}
                    cy={bubble.y}
                    r={bubble.radius}
                    fill={bubble.color}
                    opacity={0.75}
                    stroke={bubble.color}
                    strokeWidth={2}
                  />
                  {/* 키워드 (위쪽) */}
                  <SvgText
                    x={bubble.x}
                    y={bubble.y - bubble.radius * 0.25}
                    fontSize={topicFontSize}
                    fill="white"
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {displayTopic}
                  </SvgText>
                  {/* 카운트 (아래쪽) */}
                  <SvgText
                    x={bubble.x}
                    y={bubble.y + bubble.radius * 0.3}
                    fontSize={countFontSize}
                    fill="white"
                    fontWeight="600"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {bubble.count}점
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        </View>

        {/* 범례 */}
        <View style={styles.legendContainer}>
          <View style={styles.legendGrid}>
            {bubbleData.map((bubble, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: bubble.color }
                  ]}
                />
                <Text style={styles.legendText} numberOfLines={1}>
                  {bubble.topic} ({bubble.count}점)
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  legendContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '48%',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    flexShrink: 0,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
});
