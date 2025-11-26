/**
 * BubbleChart 컴포넌트
 * - 관심사 데이터를 버블 차트로 시각화
 * - SVG 기반 원형 배치
 * - 크기: count 값에 비례 (최소 25, 최대 55)
 * - 겹치지 않도록 자동 배치
 */

import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
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

export default function BubbleChart({ data }: BubbleChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // 좌우 패딩 고려
  const chartHeight = 350;

  // 버블 크기 계산 (최소 25, 최대 55)
  const maxCount = Math.max(...data.map((t) => t.count), 1);

  // 두 원이 겹치는지 확인하는 함수
  const isOverlapping = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return distance < (r1 + r2 + 10); // 10px 여백 추가
  };

  // 안전한 위치 찾기 함수
  const findSafePosition = (radius: number, existingBubbles: any[], centerX: number, centerY: number) => {
    const maxAttempts = 100;
    const margin = radius + 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // 여러 전략으로 위치 시도
      let x, y;

      if (attempt < 20) {
        // 첫 20번 시도: 원형 배치
        const angle = (attempt * 2 * Math.PI) / 20;
        const distance = 60 + (attempt * 5);
        x = centerX + Math.cos(angle) * distance;
        y = centerY + Math.sin(angle) * distance;
      } else if (attempt < 50) {
        // 다음 30번 시도: 격자 패턴
        const gridSize = 40;
        const row = Math.floor((attempt - 20) / 6);
        const col = (attempt - 20) % 6;
        x = centerX - 100 + col * gridSize;
        y = centerY - 60 + row * gridSize;
      } else {
        // 나머지: 랜덤 배치
        x = margin + Math.random() * (chartWidth - 2 * margin);
        y = margin + Math.random() * (chartHeight - 2 * margin);
      }

      // 경계 체크
      if (x - radius < 0 || x + radius > chartWidth ||
        y - radius < 0 || y + radius > chartHeight) {
        continue;
      }

      // 다른 버블과 겹치는지 확인
      let overlapping = false;
      for (const bubble of existingBubbles) {
        if (isOverlapping(x, y, radius, bubble.x, bubble.y, bubble.radius)) {
          overlapping = true;
          break;
        }
      }

      if (!overlapping) {
        return { x, y };
      }
    }

    // 안전한 위치를 찾지 못한 경우 강제로 배치
    const fallbackAngle = existingBubbles.length * 0.8;
    const fallbackDistance = 80 + existingBubbles.length * 20;
    return {
      x: centerX + Math.cos(fallbackAngle) * fallbackDistance,
      y: centerY + Math.sin(fallbackAngle) * fallbackDistance,
    };
  };

  // 버블 위치 계산 (겹치지 않도록 배치)
  const getBubbleData = () => {
    const bubbles: any[] = [];
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;

    // 카운트 순으로 정렬 (큰 버블부터 배치)
    const sortedTopics = [...data].sort((a, b) => b.count - a.count);

    sortedTopics.forEach((topic, index) => {
      const radius = Math.max(25, Math.min(55, (topic.count / maxCount) * 40 + 25));

      // 색상 선택 (원래 순서 유지를 위해 원본 인덱스 사용)
      const originalIndex = data.indexOf(topic);
      const color = COLORS[originalIndex % COLORS.length];

      // 안전한 위치 찾기
      const position = findSafePosition(radius, bubbles, centerX, centerY);

      bubbles.push({
        ...topic,
        x: position.x,
        y: position.y,
        radius,
        color,
      });
    });

    return bubbles;
  };

  const bubbleData = getBubbleData();

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {bubbleData.map((bubble, index) => (
            <React.Fragment key={index}>
              {/* 버블 */}
              <Circle
                cx={bubble.x}
                cy={bubble.y}
                r={bubble.radius}
                fill={bubble.color}
                opacity={0.7}
                stroke={bubble.color}
                strokeWidth={2}
              />
              {/* 아이콘 */}
              <SvgText
                x={bubble.x}
                y={bubble.y - 8}
                fontSize="20"
                textAnchor="middle"
              >
                {bubble.icon}
              </SvgText>
              {/* 카운트 텍스트 */}
              <SvgText
                x={bubble.x}
                y={bubble.y + 12}
                fontSize="10"
                fill="white"
                fontWeight="bold"
                textAnchor="middle"
              >
                {bubble.count}점
              </SvgText>
            </React.Fragment>
          ))}
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
              <Text style={styles.legendText}>
                {bubble.topic} ({bubble.count}점)
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  legendContainer: {
    marginTop: 16,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: '48%',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
});
