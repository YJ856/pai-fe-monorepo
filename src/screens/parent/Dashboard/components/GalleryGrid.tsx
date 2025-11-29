/**
 * GalleryGrid 컴포넌트
 *
 * 갤러리 그리드 프레젠테이션 컴포넌트
 *
 * 주요 기능:
 * - 이미지 썸네일 그리드 렌더링 (2열)
 * - 이미지 클릭 이벤트 처리
 * - 자녀 정보 및 질문 개수 표시
 *
 * Props:
 * - conversations: ConversationCardViewModel[]
 * - onConversationPress: (conversationId: string) => void
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../../../design/tokens";

const noPhotoImage = require("../../../../assets/images/no_photo.png");

interface ConversationCardViewModel {
  conversationId: string;
  childProfileId: number;
  childName: string;
  childAvatar?: string;
  firstMediaUrl?: string;
  questionCount: number;
}

interface GalleryGridProps {
  conversations: ConversationCardViewModel[];
  onConversationPress: (conversationId: string) => void;
}

const screenWidth = Dimensions.get("window").width;
const gridPadding = spacing.lg;
const gridGap = spacing.md;
const cardWidth = (screenWidth - gridPadding * 2 - gridGap) / 2;

export default function GalleryGrid({
  conversations,
  onConversationPress,
}: GalleryGridProps) {
  if (conversations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyText}>이 날짜에는 대화가 없어요</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {conversations.map((conversation) => (
        <TouchableOpacity
          key={conversation.conversationId}
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => onConversationPress(conversation.conversationId)}
        >
          {/* 이미지만 표시 */}
          {conversation.firstMediaUrl ? (
            <Image
              source={{ uri: conversation.firstMediaUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={noPhotoImage}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: gridGap,
    padding: gridPadding,
  },
  card: {
    width: cardWidth,
    aspectRatio: 1,
    borderRadius: borderRadius["2xl"],
    overflow: "hidden",
    ...shadows.md,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 64,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl * 2,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: borderRadius["2xl"],
    margin: gridPadding,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
});
