/**
 * 부모 퀴즈 > 예정 탭
 *
 * 주요 기능:
 * - 예정된 퀴즈 목록 조회
 * - 미래 날짜별 정렬
 * - 퀴즈 수정/삭제 버튼
 * - 새 퀴즈 생성
 *
 * API:
 * - GET /api/quiz/parents/scheduled?childProfileId=&page=&limit= (api/quizzes.ts)
 * - POST /api/quiz (api/quizzes.ts)
 * - PATCH /api/quiz/:quizId (api/quizzes.ts)
 * - DELETE /api/quiz/:quizId (api/quizzes.ts)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Plus, Edit2, Trash2, Calendar, Users } from 'lucide-react-native';
import { Button } from '../../../../design/components/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../../../design/tokens';

interface ScheduledQuiz {
  id: string;
  question: string;
  correctAnswer: string;
  hint?: string;
  reward?: string;
  scheduledFor: Date;
  targetChildIds: string[];
  targetChildNames: string[];
}

// Mock data
const MOCK_SCHEDULED_QUIZZES: ScheduledQuiz[] = [
  {
    id: '1',
    question: '할머니 댁은 어디에 있을까?',
    correctAnswer: '부산',
    hint: '바다가 있는 곳이에요',
    reward: '용돈 5000원',
    scheduledFor: new Date(Date.now() + 86400000),
    targetChildIds: ['1', '2'],
    targetChildNames: ['지우', '민준'],
  },
  {
    id: '2',
    question: '우리 가족이 제일 좋아하는 계절은?',
    correctAnswer: '가을',
    scheduledFor: new Date(Date.now() + 172800000),
    targetChildIds: ['1'],
    targetChildNames: ['지우'],
  },
];

export default function ScheduledTab() {
  const [quizzes, setQuizzes] = useState<ScheduledQuiz[]>(MOCK_SCHEDULED_QUIZZES);

  const formatScheduleDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return '오늘';
    if (days === 1) return '내일';
    return `${days}일 후`;
  };

  const handleCreateQuiz = () => {
    console.log('Create new quiz');
  };

  const handleEditQuiz = (quizId: string) => {
    console.log('Edit quiz:', quizId);
  };

  const handleDeleteQuiz = (quizId: string) => {
    setQuizzes(quizzes.filter((q) => q.id !== quizId));
  };

  const renderQuizCard = ({ item }: { item: ScheduledQuiz }) => (
    <View style={styles.quizCard}>
      <View style={styles.quizHeader}>
        <Text style={styles.question}>{item.question}</Text>
        <View style={styles.scheduleBadge}>
          <Calendar size={12} color={colors.parent.from} />
          <Text style={styles.scheduleText}>{formatScheduleDate(item.scheduledFor)}</Text>
        </View>
      </View>

      <Text style={styles.correctAnswer}>정답: {item.correctAnswer}</Text>

      {item.hint && (
        <Text style={styles.hint}>힌트: {item.hint}</Text>
      )}

      {item.reward && (
        <Text style={styles.reward}>보상: {item.reward}</Text>
      )}

      {/* Target Children */}
      <View style={styles.targetRow}>
        <Users size={16} color={colors.text.secondary} />
        <Text style={styles.targetLabel}>대상:</Text>
        <Text style={styles.targetText}>{item.targetChildNames.join(', ')}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditQuiz(item.id)}
        >
          <Edit2 size={16} color={colors.parent.from} />
          <Text style={styles.actionText}>수정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteQuiz(item.id)}
        >
          <Trash2 size={16} color={colors.status.error} />
          <Text style={[styles.actionText, styles.deleteText]}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Create Button */}
      <View style={styles.createButtonContainer}>
        <Button
          variant="gradient"
          gradient={colors.parent}
          onPress={handleCreateQuiz}
        >
          <View style={styles.createButtonContent}>
            <Plus size={20} color={colors.text.inverse} />
            <Text style={styles.createButtonText}>새 퀴즈 만들기</Text>
          </View>
        </Button>
      </View>

      {/* Quiz List */}
      <FlatList
        data={quizzes}
        renderItem={renderQuizCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>예정된 퀴즈가 없습니다</Text>
            <Text style={styles.emptySubtext}>새 퀴즈를 만들어보세요!</Text>
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
  createButtonContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  createButtonText: {
    ...typography.button,
    color: colors.text.inverse,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
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
  scheduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.parent.from}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  scheduleText: {
    ...typography.caption,
    color: colors.parent.from,
    fontWeight: '600',
  },
  correctAnswer: {
    ...typography.body2,
    color: colors.parent.from,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  reward: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.background.tertiary,
  },
  targetLabel: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  targetText: {
    ...typography.body2,
    color: colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
  },
  deleteButton: {
    backgroundColor: `${colors.status.error}10`,
  },
  actionText: {
    ...typography.body2,
    color: colors.parent.from,
  },
  deleteText: {
    color: colors.status.error,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    ...typography.body1,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.text.tertiary,
  },
});
