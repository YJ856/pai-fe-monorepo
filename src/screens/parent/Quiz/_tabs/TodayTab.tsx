/**
 * 부모 퀴즈 > 오늘 탭
 *
 * 주요 기능:
 * - 오늘 출제한 퀴즈 조회
 * - 자녀별 필터링
 * - 자녀들의 답변 현황 표시
 *
 * API:
 * - GET /api/quiz/parents/today?childProfileId= (api/quizzes.ts)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { CheckCircle, Circle, User } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../../../design/tokens';

interface ChildAnswer {
  childId: string;
  childName: string;
  childAvatar: string;
  answer?: string;
  isCorrect?: boolean;
}

interface Quiz {
  id: string;
  question: string;
  correctAnswer: string;
  hint?: string;
  reward?: string;
  childAnswers: ChildAnswer[];
}

// Mock data
const MOCK_QUIZZES: Quiz[] = [
  {
    id: '1',
    question: '엄마가 제일 좋아하는 색은?',
    correctAnswer: '파란색',
    hint: '하늘 색이에요',
    reward: '아이스크림',
    childAnswers: [
      {
        childId: '1',
        childName: '지우',
        childAvatar: '👧',
        answer: '파란색',
        isCorrect: true,
      },
      {
        childId: '2',
        childName: '민준',
        childAvatar: '👦',
      },
    ],
  },
  {
    id: '2',
    question: '우리 가족이 지난 주말에 간 곳은?',
    correctAnswer: '놀이공원',
    reward: '게임 30분',
    childAnswers: [
      {
        childId: '1',
        childName: '지우',
        childAvatar: '👧',
        answer: '공원',
        isCorrect: false,
      },
      {
        childId: '2',
        childName: '민준',
        childAvatar: '👦',
        answer: '놀이공원',
        isCorrect: true,
      },
    ],
  },
];

export default function TodayTab() {
  const [quizzes] = useState<Quiz[]>(MOCK_QUIZZES);

  const renderQuizCard = ({ item }: { item: Quiz }) => {
    const answeredCount = item.childAnswers.filter((a) => a.answer).length;
    const totalCount = item.childAnswers.length;

    return (
      <View style={styles.quizCard}>
        <View style={styles.quizHeader}>
          <Text style={styles.question}>{item.question}</Text>
          <Text style={styles.answerStatus}>
            {answeredCount}/{totalCount} 답변
          </Text>
        </View>

        {item.hint && (
          <Text style={styles.hint}>힌트: {item.hint}</Text>
        )}

        <Text style={styles.correctAnswer}>정답: {item.correctAnswer}</Text>

        {item.reward && (
          <Text style={styles.reward}>보상: {item.reward}</Text>
        )}

        {/* Child Answers */}
        <View style={styles.childAnswers}>
          {item.childAnswers.map((childAnswer) => (
            <View key={childAnswer.childId} style={styles.childAnswerRow}>
              <View style={styles.childInfo}>
                <Text style={styles.childAvatar}>{childAnswer.childAvatar}</Text>
                <Text style={styles.childName}>{childAnswer.childName}</Text>
              </View>

              {childAnswer.answer ? (
                <View style={styles.answerInfo}>
                  <Text
                    style={[
                      styles.answerText,
                      childAnswer.isCorrect && styles.correctAnswerText,
                    ]}
                  >
                    {childAnswer.answer}
                  </Text>
                  {childAnswer.isCorrect ? (
                    <CheckCircle size={20} color={colors.status.success} />
                  ) : (
                    <Circle size={20} color={colors.status.error} />
                  )}
                </View>
              ) : (
                <Text style={styles.waitingText}>답변 대기중</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

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
            <Text style={styles.emptyText}>오늘 출제한 퀴즈가 없습니다</Text>
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
  answerStatus: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  hint: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  correctAnswer: {
    ...typography.body2,
    color: colors.parent.from,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  reward: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  childAnswers: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  childAnswerRow: {
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
  answerInfo: {
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
  waitingText: {
    ...typography.body2,
    color: colors.text.tertiary,
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
