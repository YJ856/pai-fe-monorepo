/**
 * 자녀 대화 목록 화면
 *
 * 주요 기능:
 * - 자녀의 대화 이력 조회 (페이지네이션)
 * - 대화 카드 클릭 → 대화 상세 화면으로 이동
 * - 새 대화 시작 버튼
 *
 * API:
 * - GET /api/conversations?childProfileId=&page=&limit= (api/conversations.ts)
 *
 * 상태 관리:
 * - TanStack Query useInfiniteQuery로 무한 스크롤
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer } from '../../../design/layouts/ScreenContainer';
import { Card } from '../../../design/components/Card';
import { Button } from '../../../design/components/Button';
import { spacing, typography } from '../../../design/tokens';
// import { useInfiniteQuery } from '@tanstack/react-query';
// import { getConversations } from '../../../api/conversations';
// import { useInfiniteScroll } from '../../../shared/hooks/useInfiniteScroll';

export default function ChildChatScreen() {
  // TODO: useInfiniteQuery로 대화 목록 조회
  // const {
  //   data,
  //   fetchNextPage,
  //   hasNextPage,
  //   isFetchingNextPage,
  // } = useInfiniteQuery({
  //   queryKey: ['conversations', childProfileId],
  //   queryFn: ({ pageParam = 1 }) => getConversations({ childProfileId, page: pageParam }),
  //   getNextPageParam: (lastPage) => lastPage.nextPage,
  // });

  const mockConversations = [
    { id: '1', title: '오늘 학교 이야기', startDate: '2025-01-09', thumbnailUrl: '' },
    { id: '2', title: '좋아하는 동물', startDate: '2025-01-08', thumbnailUrl: '' },
  ];

  const handleConversationPress = (conversationId: string) => {
    // TODO: Navigate to ChatDetail
    console.log('Open conversation:', conversationId);
  };

  const handleStartNewChat = () => {
    // TODO: Start new conversation session
    console.log('Start new chat');
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>대화</Text>

        <Button variant="primary" onPress={handleStartNewChat}>
          새 대화 시작
        </Button>

        <FlatList
          data={mockConversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card
              style={styles.conversationCard}
              onPress={() => handleConversationPress(item.id)}
            >
              <Text style={styles.conversationTitle}>{item.title}</Text>
              <Text style={styles.conversationDate}>{item.startDate}</Text>
            </Card>
          )}
          contentContainerStyle={styles.listContent}
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
    paddingTop: spacing.md,
  },
  conversationCard: {},
  conversationTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  conversationDate: {
    ...typography.caption,
  },
});
