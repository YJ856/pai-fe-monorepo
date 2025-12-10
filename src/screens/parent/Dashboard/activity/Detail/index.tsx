/**
 * 대시보드 > 활동 > 대화 상세 화면
 *
 * 주요 기능:
 * - 갤러리에서 선택한 대화의 상세 내용 표시 (읽기 전용)
 * - 질문-답변 목록 (카톡 스타일 UI)
 * - 이미지 포함
 * - 키워드 하이라이트
 *
 * 디자인:
 * - 부모용 그라데이션 (Blue 계열: #5B9BD5 → #667BC6)
 * - 자녀 메시지: 파란색 말풍선 (오른쪽)
 * - AI 마스코트 메시지: 흰색 말풍선 (왼쪽)
 * - 입력창 없음 (읽기 전용)
 *
 * API:
 * - GET /api/conversations/:conversationId (useConversationDetail)
 *
 * 라우트 파라미터:
 * - conversationId: string
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft } from "lucide-react-native";
import ImageView from "react-native-image-viewing";
import { useConversationDetail } from "../../hooks/activity/useConversationDetail";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../../../../design/tokens";
import { ParentStackParamList } from "../../../../../app/navigation/ParentNavigator";

type DetailRouteProp = RouteProp<ParentStackParamList, "ActivityDetail">;
type DetailNavigationProp = NativeStackNavigationProp<
  ParentStackParamList,
  "ActivityDetail"
>;

// 마스코트 이미지
const MASCOT_IMAGE = require("../../../../../assets/images/mascot.png");

export default function ConversationDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<DetailNavigationProp>();

  const { conversationId } = route.params;

  // 이미지 전체화면 상태
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 이미지 비율 저장 (order -> aspectRatio)
  const [imageAspectRatios, setImageAspectRatios] = useState<Record<number, number>>({});

  // 대화 상세 조회
  const { conversation, messages, isLoading, isError } =
    useConversationDetail(conversationId);

  // 디버깅 로그
  console.log("[ActivityDetail] conversationId:", conversationId);
  console.log("[ActivityDetail] conversation:", conversation);
  console.log("[ActivityDetail] messages:", messages);
  console.log("[ActivityDetail] isLoading:", isLoading);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <LinearGradient
          colors={["#eff6ff", "#e0e7ff"]}
          style={styles.container}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.parent.from} />
            <Text style={styles.loadingText}>대화 내용을 불러오는 중...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (isError || !conversation) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <LinearGradient
          colors={["#eff6ff", "#e0e7ff"]}
          style={styles.container}
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>
              대화 내용을 불러오는데 실패했습니다
            </Text>
            <TouchableOpacity
              style={styles.errorBackButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.errorBackButtonText}>뒤로 가기</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={["#eff6ff", "#e0e7ff"]}
        style={styles.container}
      >
        {/* Fixed Header with Back Button and Date */}
        <View style={styles.fixedHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={28} color="#5B9BD5" />
          </TouchableOpacity>

          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {conversation.startDate.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          {/* Messages List */}
          {messages.map((message) => (
            <View key={`${conversationId}-${message.order}`}>
              {/* 자녀 질문 (오른쪽) */}
              <View style={[styles.messageContainer, styles.childMessageContainer]}>
                {message.imageUrl && (
                  <LinearGradient
                    colors={['#5B9BD5', '#667BC6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.imageBubble}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        setSelectedImageIndex(message.order - 1);
                        setIsImageViewVisible(true);
                      }}
                    >
                      <Image
                        source={{ uri: message.imageUrl }}
                        style={[
                          styles.messageImage,
                          imageAspectRatios[message.order]
                            ? { aspectRatio: imageAspectRatios[message.order] }
                            : null
                        ]}
                        onLoad={(e) => {
                          const { width, height } = e.nativeEvent.source;
                          if (width && height) {
                            setImageAspectRatios(prev => ({
                              ...prev,
                              [message.order]: width / height
                            }));
                          }
                        }}
                      />
                    </TouchableOpacity>
                  </LinearGradient>
                )}
                <LinearGradient
                  colors={['#5B9BD5', '#667BC6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.childBubble}
                >
                  <Text style={styles.childMessageText}>
                    {message.questionText}
                  </Text>
                </LinearGradient>
              </View>

              {/* AI 답변 (왼쪽) */}
              <View style={[styles.messageContainer, styles.aiMessageContainer]}>
                <View style={styles.aiBubble}>
                  {/* AI 마스코트 아이콘 */}
                  <View style={styles.mascotHeader}>
                    <Image
                      source={MASCOT_IMAGE}
                      style={styles.mascotAvatar}
                      resizeMode="contain"
                    />
                    <Text style={styles.mascotName}>PAI</Text>
                  </View>

                  {/* 답변 텍스트 */}
                  <Text style={styles.aiMessageText}>
                    {message.answerText}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* 이미지 전체화면 뷰어 */}
        <ImageView
          images={messages
            .filter((msg) => msg.imageUrl)
            .map((msg) => ({ uri: msg.imageUrl! }))}
          imageIndex={selectedImageIndex}
          visible={isImageViewVisible}
          onRequestClose={() => setIsImageViewVisible(false)}
          backgroundColor="rgba(0, 0, 0, 0.85)"
          HeaderComponent={() => (
            <View style={styles.imageViewHeader}>
              <TouchableOpacity
                style={styles.imageViewCloseButton}
                onPress={() => setIsImageViewVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.imageViewCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EFF6FF",
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },

  // Fixed Header
  fixedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: spacing.md,
    marginTop: 9,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  dateBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  dateText: {
    ...typography.body2,
    color: "#6B7280",
    fontSize: 14,
  },

  // Messages
  messageContainer: {
    marginBottom: 12,
  },

  // 자녀 메시지 (오른쪽)
  childMessageContainer: {
    alignItems: "flex-end",
  },
  imageBubble: {
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 4,
    marginBottom: 4,
    alignSelf: "flex-end",
    overflow: "hidden",
    ...shadows.md,
  },
  childBubble: {
    maxWidth: "75%",
    backgroundColor: "#5B9BD5",
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 16,
    overflow: "hidden",
    ...shadows.md,
  },
  childMessageText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#FFFFFF",
  },

  // AI 메시지 (왼쪽)
  aiMessageContainer: {
    alignItems: "flex-start",
  },
  aiBubble: {
    maxWidth: "75%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 16,
    ...shadows.md,
  },
  mascotHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  mascotAvatar: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  mascotName: {
    fontSize: 14,
    color: "#6B7280",
  },
  messageImage: {
    width: 200,
    borderRadius: 12,
  },
  aiMessageText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1F2937",
  },
  keywordBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(91, 155, 213, 0.1)",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  keywordText: {
    ...typography.caption,
    color: "#5B9BD5",
    fontSize: 12,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl * 2,
  },
  loadingText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl * 2,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  errorBackButton: {
    backgroundColor: "#5B9BD5",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  errorBackButtonText: {
    ...typography.button,
    color: "#FFFFFF",
  },

  // 이미지 뷰어 커스텀 헤더
  imageViewHeader: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1000,
  },
  imageViewCloseButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewCloseText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
  },
});
