/**
 * 대시보드 > 활동 > 갤러리 화면
 *
 * 주요 기능:
 * - 선택된 날짜의 대화 이미지/미디어 표시
 * - 썸네일 그리드 형식 (2열)
 * - 이미지 클릭 → 대화 상세 화면으로 이동
 *
 * API:
 * - useConversationsByDate Hook 사용
 *
 * 사용 컴포넌트:
 * - GalleryGrid (Dashboard/components/)
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar } from "lucide-react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import GalleryGrid from "../../components/GalleryGrid";
import { useConversationsByDate } from "../../hooks/activity/useConversationsByDate";
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from "../../../../../design/tokens";
import { ParentStackParamList } from "../../../../../app/navigation/ParentNavigator";

type GalleryRouteProp = RouteProp<ParentStackParamList, "ActivityGallery">;
type GalleryNavigationProp = NativeStackNavigationProp<
  ParentStackParamList,
  "ActivityGallery"
>;

export default function GalleryScreen() {
  const route = useRoute<GalleryRouteProp>();
  const navigation = useNavigation<GalleryNavigationProp>();

  const { childId, date } = route.params;

  // 날짜별 대화 목록 조회
  const { conversations, isLoading, isError } = useConversationsByDate({
    childProfileId: Number(childId),
    date: date,
  });

  const handleConversationPress = (conversationId: string) => {
    navigation.navigate("ActivityDetail", { conversationId });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={["#eff6ff", "#e0e7ff"]}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dateBadge}>
              <Calendar size={18} color={colors.parent.from} />
              <Text style={styles.dateText}>{date}</Text>
            </View>
            <LinearGradient
              colors={["#5B9BD5", "#667BC6"]}
              style={styles.countBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.countText}>{conversations.length}</Text>
            </LinearGradient>
          </View>

          {/* Loading */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.parent.from} />
              <Text style={styles.loadingText}>대화 기록을 불러오는 중...</Text>
            </View>
          )}

          {/* Error */}
          {isError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>
                대화 기록을 불러오는데 실패했습니다
              </Text>
            </View>
          )}

          {/* Gallery Grid */}
          {!isLoading && !isError && (
            <GalleryGrid
              conversations={conversations.map((conv) => ({
                conversationId: conv.conversationId,
                childProfileId: Number(childId),
                childName: conv.title,
                childAvatar: undefined,
                firstMediaUrl: conv.firstMediaUrl,
                questionCount: 0,
              }))}
              onConversationPress={handleConversationPress}
            />
          )}
        </ScrollView>
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
    paddingBottom: spacing.xl * 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(91, 155, 213, 0.15)",
    borderRadius: 100,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  dateText: {
    ...typography.h4,
    fontWeight: "600",
    color: colors.parent.from,
  },
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subtitleContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl * 2,
  },
  loadingText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl * 2,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    margin: spacing.lg,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: "center",
  },
});
