/**
 * 자녀 퀴즈 > 지난 탭
 *
 * 주요 기능:
 * - 완료된 퀴즈 목록 조회 (무한 스크롤)
 * - 정답/오답 표시
 * - 보상 획득 여부 표시
 *
 * API:
 * - GET /api/quiz/children/completed?page=&limit= (api/quizzes.ts)
 *
 * 상태 관리:
 * - TanStack Query useInfiniteQuery
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card } from '../../../../design/components/Card';
import { spacing, typography, colors } from '../../../../design/tokens';
// import { useInfiniteQuery } from '@tanstack/react-query';
// import { getChildCompletedQuizzes } from '../../../../api/quizzes';
// import { useInfiniteScroll } from '../../../../shared/hooks/useInfiniteScroll';

export default function PastTab() {
  // TODO: useInfiniteQuery로 지난 퀴즈 조회
  // const {
  //   data,
  //   fetchNextPage,
  //   hasNextPage,
  //   isFetchingNextPage,
  // } = useInfiniteQuery({
  //   queryKey: ['child-quizzes', 'past'],
  //   queryFn: ({ pageParam = 1 }) => getChildCompletedQuizzes({ page: pageParam }),
  //   getNextPageParam: (lastPage) => lastPage.nextPage,
  // });

  const mockQuizzes = [
    {
      id: '1',
      question: '아빠가 제일 좋아하는 음식은?',
      myAnswer: '치킨',
      correctAnswer: '치킨',
      isCorrect: true,
      rewardGranted: true,
      reward: '게임 30분',
    },
    {
      id: '2',
      question: '엄마 생일은 언제?',
      myAnswer: '5월 10일',
      correctAnswer: '5월 15일',
      isCorrect: false,
      rewardGranted: false,
    },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={mockQuizzes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.quizCard}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>내 답: {item.myAnswer}</Text>
            {!item.isCorrect && (
              <Text style={styles.correctAnswer}>정답: {item.correctAnswer}</Text>
            )}
            <Text
              style={[
                styles.result,
                { color: item.isCorrect ? colors.status.success : colors.status.error },
              ]}
            >
              {item.isCorrect ? '정답!' : '오답'}
            </Text>
            {item.rewardGranted && item.reward && (
              <Text style={styles.reward}>보상 획득: {item.reward}</Text>
            )}
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
  answer: {
    ...typography.body2,
    marginBottom: spacing.xs,
  },
  correctAnswer: {
    ...typography.body2,
    marginBottom: spacing.xs,
  },
  result: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  reward: {
    ...typography.caption,
  },
});
