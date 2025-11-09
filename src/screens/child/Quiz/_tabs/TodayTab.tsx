/**
 * 자녀 퀴즈 > 오늘 탭
 *
 * 주요 기능:
 * - 오늘의 퀴즈 목록 조회
 * - 퀴즈 답변 입력
 * - 정답 체크
 * - 보상 표시
 *
 * API:
 * - GET /api/quiz/children/today (api/quizzes.ts)
 * - POST /api/quiz/children/:quizId/answer (api/quizzes.ts)
 *
 * 상태 관리:
 * - TanStack Query useQuery + useMutation
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card } from '../../../../design/components/Card';
import { Input } from '../../../../design/components/Input';
import { Button } from '../../../../design/components/Button';
import { spacing, typography } from '../../../../design/tokens';
// import { useQuery, useMutation } from '@tanstack/react-query';
// import { getChildTodayQuizzes, answerQuiz } from '../../../../api/quizzes';

export default function TodayTab() {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // TODO: useQuery로 오늘의 퀴즈 조회
  // const { data: quizzes, isLoading } = useQuery({
  //   queryKey: ['child-quizzes', 'today'],
  //   queryFn: () => getChildTodayQuizzes(),
  // });

  const mockQuizzes = [
    {
      id: '1',
      question: '엄마가 제일 좋아하는 색은?',
      hint: '하늘 색이에요',
      reward: '아이스크림',
    },
  ];

  const handleAnswerChange = (quizId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [quizId]: answer }));
  };

  const handleSubmit = (quizId: string) => {
    // TODO: answerQuiz mutation
    console.log('Submit answer:', quizId, answers[quizId]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={mockQuizzes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.quizCard}>
            <Text style={styles.question}>{item.question}</Text>
            {item.hint && <Text style={styles.hint}>힌트: {item.hint}</Text>}
            {item.reward && <Text style={styles.reward}>보상: {item.reward}</Text>}

            <Input
              placeholder="답을 입력하세요"
              value={answers[item.id] || ''}
              onChangeText={(text) => handleAnswerChange(item.id, text)}
            />

            <Button variant="primary" onPress={() => handleSubmit(item.id)}>
              제출
            </Button>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  listContent: {
    gap: spacing.md,
  },
  quizCard: {},
  question: {
    ...typography.h4,
    marginBottom: spacing.sm,
  },
  hint: {
    ...typography.body2,
    marginBottom: spacing.xs,
  },
  reward: {
    ...typography.body2,
    marginBottom: spacing.md,
  },
});
