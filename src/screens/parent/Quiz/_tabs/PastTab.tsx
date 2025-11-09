/**
 * 부모 퀴즈 > 지난 탭
 *
 * 주요 기능:
 * - 완료된 퀴즈 목록 조회 (무한 스크롤)
 * - 자녀별 정답률 표시
 * - 퀴즈별 상세 결과 확인
 *
 * API:
 * - GET /api/quiz/parents/completed?childProfileId=&page=&limit= (api/quizzes.ts)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { CheckCircle, XCircle, Calendar } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../../../design/tokens';

interface ChildResult {
  childId: string;
  childName: string;
  childAvatar: string;
  answer: string;
  isCorrect: boolean;
}

interface CompletedQuiz {
  id: string;
  question: string;
  correctAnswer: string;
  createdAt: Date;
  completedAt: Date;
  childResults: ChildResult[];
}

// Mock data
const MOCK_COMPLETED_QUIZZES: CompletedQuiz[] = [
  {
    id: '1',
    question: '아빠가 제일 좋아하는 음식은?',
    correctAnswer: '치킨',
    createdAt: new Date(Date.now() - 86400000),
    completedAt: new Date(Date.now() - 86400000 + 3600000),
    childResults: [
      {
        childId: '1',
        childName: '지우',
        childAvatar: '👧',
        answer: '치킨',
        isCorrect: true,
      },
      {
        childId: '2',
        childName: '민준',
        childAvatar: '👦',
        answer: '피자',
        isCorrect: false,
      },
    ],
  },
  {
    id: '2',
    question: '엄마 생일은 언제?',
    correctAnswer: '5월 15일',
    createdAt: new Date(Date.now() - 172800000),
    completedAt: new Date(Date.now() - 172800000 + 7200000),
    childResults: [
      {
        childId: '1',
        childName: '지우',
        childAvatar: '👧',
        answer: '5월 15일',
        isCorrect: true,
      },
      {
        childId: '2',
        childName: '민준',
        childAvatar: '👦',
        answer: '5월 15일',
        isCorrect: true,
      },
    ],
  },
];

export default function PastTab() {
  const [quizzes] = useState<CompletedQuiz[]>(MOCK_COMPLETED_QUIZZES);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return '오늘';
    if (days === 1) return '어제';
    return `${days}일 전`;
  };

  const calculateCorrectRate = (results: ChildResult[]) => {
    const correctCount = results.filter((r) => r.isCorrect).length;
    return `${correctCount}/${results.length}`;
  };

  const renderQuizCard = ({ item }: { item: CompletedQuiz }) => (
    <View style={styles.quizCard}>
      <View style={styles.quizHeader}>
        <Text style={styles.question}>{item.question}</Text>
        <View style={styles.dateBadge}>
          <Calendar size={12} color={colors.text.tertiary} />
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>

      <Text style={styles.correctAnswer}>정답: {item.correctAnswer}</Text>

      <View style={styles.statsRow}>
        <Text style={styles.statsLabel}>정답률:</Text>
        <Text style={styles.statsValue}>{calculateCorrectRate(item.childResults)}</Text>
      </View>

      {/* Child Results */}
      <View style={styles.childResults}>
        {item.childResults.map((result) => (
          <View key={result.childId} style={styles.childResultRow}>
            <View style={styles.childInfo}>
              <Text style={styles.childAvatar}>{result.childAvatar}</Text>
              <Text style={styles.childName}>{result.childName}</Text>
            </View>

            <View style={styles.resultInfo}>
              <Text
                style={[
                  styles.answerText,
                  result.isCorrect && styles.correctAnswerText,
                ]}
              >
                {result.answer}
              </Text>
              {result.isCorrect ? (
                <CheckCircle size={20} color={colors.status.success} />
              ) : (
                <XCircle size={20} color={colors.status.error} />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={quizzes}
        renderItem={renderQuizCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>완료된 퀴즈가 없습니다</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
  },
  quizCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.background.tertiary,
    ...shadows.sm,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  question: {
    ...typography.h4,
    flex: 1,
    marginRight: spacing.sm,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  dateText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  correctAnswer: {
    ...typography.body2,
    color: colors.parent.from,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsLabel: {
    ...typography.body2,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  statsValue: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text.primary,
  },
  childResults: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  childResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.background.tertiary,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  childAvatar: {
    fontSize: 20,
  },
  childName: {
    ...typography.body2,
  },
  resultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  answerText: {
    ...typography.body2,
    color: colors.status.error,
  },
  correctAnswerText: {
    color: colors.status.success,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
});
