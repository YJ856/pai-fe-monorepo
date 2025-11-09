/**
 * 부모 대화 목록 화면
 *
 * 주요 기능:
 * - 자녀별 대화 이력 조회
 * - 자녀 선택 필터
 * - 대화 목록 표시 (썸네일, 제목, 날짜)
 *
 * API:
 * - GET /api/conversations?childProfileId=&page=&limit= (api/conversations.ts)
 *
 * 참고:
 * - 부모는 갤러리/상세 화면이 없음 (대시보드 > 활동 탭에서만 접근)
 * - 여기서는 목록만 표시
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MessageCircle, Calendar } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../../design/tokens';

interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
}

interface Conversation {
  id: string;
  childProfileId: string;
  title: string;
  thumbnailUrl?: string;
  lastMessageAt: Date;
  messageCount: number;
}

// Mock data
const MOCK_CHILDREN: ChildProfile[] = [
  { id: '1', name: '지우', avatar: '👧' },
  { id: '2', name: '민준', avatar: '👦' },
];

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    childProfileId: '1',
    title: '공룡은 어떤 동물일까?',
    lastMessageAt: new Date(),
    messageCount: 15,
  },
  {
    id: '2',
    childProfileId: '1',
    title: '바다에 사는 동물들',
    lastMessageAt: new Date(Date.now() - 3600000),
    messageCount: 8,
  },
  {
    id: '3',
    childProfileId: '2',
    title: '우주는 얼마나 넓을까?',
    lastMessageAt: new Date(Date.now() - 86400000),
    messageCount: 12,
  },
  {
    id: '4',
    childProfileId: '2',
    title: '식물은 어떻게 자랄까?',
    lastMessageAt: new Date(Date.now() - 172800000),
    messageCount: 6,
  },
];

export default function ParentChatScreen() {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [children] = useState<ChildProfile[]>(MOCK_CHILDREN);
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);

  const filteredConversations = selectedChildId
    ? conversations.filter((conv) => conv.childProfileId === selectedChildId)
    : conversations;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days === 1) return '어제';
    return `${days}일 전`;
  };

  const renderChildFilter = ({ item }: { item: ChildProfile }) => (
    <TouchableOpacity
      style={[
        styles.childFilterButton,
        selectedChildId === item.id && styles.childFilterButtonActive,
      ]}
      onPress={() =>
        setSelectedChildId(selectedChildId === item.id ? null : item.id)
      }
      activeOpacity={0.7}
    >
      <Text style={styles.childAvatar}>{item.avatar}</Text>
      <Text
        style={[
          styles.childName,
          selectedChildId === item.id && styles.childNameActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderConversationCard = ({ item }: { item: Conversation }) => {
    const child = children.find((c) => c.id === item.childProfileId);

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        activeOpacity={0.7}
        onPress={() => console.log('Conversation clicked:', item.id)}
      >
        {item.thumbnailUrl ? (
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.thumbnail}
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <MessageCircle size={32} color={colors.parent.from} />
          </View>
        )}

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.childBadge}>{child?.avatar} {child?.name}</Text>
            <Text style={styles.messageCount}>{item.messageCount}개 메시지</Text>
          </View>

          <Text style={styles.conversationTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.conversationMeta}>
            <Calendar size={14} color={colors.text.tertiary} />
            <Text style={styles.conversationDate}>
              {formatDate(item.lastMessageAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.parent.from, colors.parent.to]}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => console.log('Back')}>
            <ArrowLeft size={24} color={colors.text.inverse} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>대화 기록</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Child Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>자녀 선택</Text>
          <FlatList
            data={children}
            renderItem={renderChildFilter}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {/* Conversation List */}
        <View style={styles.listContainer}>
          <FlatList
            data={filteredConversations}
            renderItem={renderConversationCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MessageCircle size={48} color={colors.text.tertiary} />
                <Text style={styles.emptyText}>대화 기록이 없습니다</Text>
              </View>
            }
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 40,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.inverse,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  filterLabel: {
    ...typography.body2,
    color: colors.text.inverse,
    marginBottom: spacing.sm,
  },
  filterList: {
    gap: spacing.sm,
  },
  childFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: spacing.xs,
  },
  childFilterButtonActive: {
    backgroundColor: colors.background.primary,
  },
  childAvatar: {
    fontSize: 20,
  },
  childName: {
    ...typography.body2,
    color: colors.text.inverse,
  },
  childNameActive: {
    color: colors.text.primary,
  },
  listContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
  },
  listContent: {
    padding: spacing.lg,
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.background.tertiary,
    ...shadows.sm,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  childBadge: {
    ...typography.caption,
    color: colors.parent.from,
    backgroundColor: `${colors.parent.from}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  messageCount: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  conversationTitle: {
    ...typography.body1,
    marginBottom: spacing.xs,
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  conversationDate: {
    ...typography.caption,
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
    marginTop: spacing.md,
  },
});
