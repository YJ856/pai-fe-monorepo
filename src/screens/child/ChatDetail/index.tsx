/**
 * 자녀 대화 상세 화면
 *
 * 주요 기능:
 * - 대화 상세 조회 (질문-답변 목록)
 * - 질문 이미지 표시
 * - 키워드 하이라이트
 *
 * API:
 * - GET /api/conversations/:conversationId (api/conversations.ts)
 *
 * 상태 관리:
 * - TanStack Query useQuery
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer } from '../../../design/layouts/ScreenContainer';
import { Card } from '../../../design/components/Card';
import { spacing, typography } from '../../../design/tokens';
// import { useQuery } from '@tanstack/react-query';
// import { getConversationDetail } from '../../../api/conversations';
// import { useRoute } from '@react-navigation/native';

export default function ChildChatDetailScreen() {
  // TODO: useRoute로 conversationId 가져오기
  // const route = useRoute();
  // const { conversationId } = route.params;

  // TODO: useQuery로 대화 상세 조회
  // const { data, isLoading } = useQuery({
  //   queryKey: ['conversation', conversationId],
  //   queryFn: () => getConversationDetail(conversationId),
  // });

  const mockQuestions = [
    {
      questionOrder: 1,
      questionText: '오늘 학교에서 뭐 했어?',
      answer: { answerText: '친구들이랑 축구했어요!' },
      keyword: '축구',
    },
    {
      questionOrder: 2,
      questionText: '축구는 재미있었어?',
      answer: { answerText: '네, 정말 재미있었어요!' },
      keyword: '재미',
    },
  ];

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>대화 상세</Text>

        <FlatList
          data={mockQuestions}
          keyExtractor={(item) => item.questionOrder.toString()}
          renderItem={({ item }) => (
            <Card style={styles.qaCard}>
              <Text style={styles.question}>Q. {item.questionText}</Text>
              <Text style={styles.answer}>A. {item.answer.answerText}</Text>
              {item.keyword && (
                <Text style={styles.keyword}>키워드: {item.keyword}</Text>
              )}
            </Card>
          )}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.md,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.md,
  },
  listContent: {
    gap: spacing.md,
  },
  qaCard: {},
  question: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  answer: {
    ...typography.body1,
    marginBottom: spacing.xs,
  },
  keyword: {
    ...typography.caption,
  },
});
