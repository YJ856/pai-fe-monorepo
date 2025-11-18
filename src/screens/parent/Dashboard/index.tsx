/**
 * ParentDashboard 화면 (Design_v2 완벽 구현)
 *
 * 주요 기능:
 * - 3가지 탭: 관심사 분석 / 활동 캘린더 / 추천 콘텐츠
 * - 관심사: 버블 차트 (80-140px)
 * - 활동: 캘린더 + 자녀별 대화 갤러리
 * - 추천: 카테고리별 체험 추천
 *
 * 디자인:
 * - Parent gradient (Blue 계열: #5B9BD5 → #667BC6)
 * - rounded-full 탭 버튼 (12개 높이)
 * - 배경: from-blue-50 to-indigo-50
 *
 * API:
 * - GET /api/interests (관심사 데이터)
 * - GET /api/conversations (대화 기록)
 * - GET /api/recommendations (추천 콘텐츠)
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "../../../design/components/Card";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../../design/tokens";
import ActivityCalendar from "./components/ActivityCalendar";
import BubbleChart from "./components/BubbleChart";
import {
  useInterestsData,
  useActivityData,
  useRecommendations,
} from "./hooks/useDashboardData";
import { useProfileStore } from "../../../store/useProfileStore";
import { Image } from "react-native";

type TabValue = "interests" | "calendar" | "recommendations";
type RecommendationType = "관광지" | "문화시설" | "축제공연행사";

interface Interest {
  topic: string;
  count: number;
  icon: string;
}

interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  relatedInterest: string;
  icon: string;
  imageUrl?: string;
  link?: string;
}

interface Child {
  id: string;
  name: string;
  avatar: string;
}

const CHILDREN: Child[] = [
  { id: "3", name: "지우", avatar: "👧" },
  { id: "4", name: "민준", avatar: "👦" },
];

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState<TabValue>("interests");
  const [selectedRecommendationType, setSelectedRecommendationType] =
    useState<RecommendationType>("축제공연행사");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showChildDropdown, setShowChildDropdown] = useState(false);

  // Zustand store에서 자녀 프로필 가져오기
  const { childProfiles } = useProfileStore();

  // 자녀 선택 state (기본값: 첫 번째 자녀)
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const selectedChildId = String(
    childProfiles[selectedChildIndex]?.profileId || childProfiles[0]?.profileId
  );

  console.log("[Dashboard] childProfiles:", childProfiles);
  console.log("[Dashboard] selectedChildId:", selectedChildId);

  // API 데이터 조회
  const {
    data: interestsData,
    isLoading: interestsLoading,
    error: interestsError,
  } = useInterestsData(selectedChildId);
  const { data: activityData, isLoading: activityLoading } =
    useActivityData(selectedChildId);

  console.log("[Dashboard] interestsData:", interestsData);
  console.log("[Dashboard] interestsLoading:", interestsLoading);
  console.log("[Dashboard] interestsError:", interestsError);

  // 관심사 데이터 (API only)
  const interests =
    interestsData?.interests?.map((item: any) => ({
      topic: item.keyword,
      count: Math.round(item.rawScore * 10), // rawScore를 적절히 변환
      icon: "💡", // 기본 아이콘
    })) || [];

  // 활동 데이터 (API only)
  const activities = activityData || [];

  // 최상위 관심사 키워드 추출 (가장 높은 rawScore)
  const topKeyword = interestsData?.interests?.[0]?.keyword;

  // 추천 콘텐츠 API 조회 (최상위 관심사 키워드 기반)
  const { data: recommendationsData, isLoading: recommendationsLoading } =
    useRecommendations(selectedChildId, topKeyword);

  console.log("[Dashboard] topKeyword:", topKeyword);
  console.log("[Dashboard] recommendationsData:", recommendationsData);

  // API 카테고리를 Dashboard 타입으로 매핑
  const mapCategoryToType = (category: string): RecommendationType => {
    if (category === "축제") return "축제공연행사";
    if (category === "관광지") return "관광지";
    if (category === "문화시설") return "문화시설";
    return "관광지"; // 기본값
  };

  // 추천 콘텐츠 (API 또는 Mock)
  const apiRecommendations =
    recommendationsData?.recommendations?.map((item: any) => ({
      id: item.id,
      type: mapCategoryToType(item.category), // API의 category를 Dashboard type으로 매핑
      title: item.title,
      description: item.description,
      relatedInterest: item.relevantKeywords?.join(", ") || topKeyword || "",
      icon: "🎯", // 기본 아이콘
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      imageUrl: item.imageUrl,
      link: item.link,
    })) || [];

  // Filter recommendations by type (API only)
  const filteredRecommendations = apiRecommendations.filter(
    (rec: Recommendation) => rec.type === selectedRecommendationType
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={["#eff6ff", "#e0e7ff"]} // from-blue-50 to-indigo-50
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Tab Navigation with Child Selector */}
          <View style={styles.tabContainer}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.3)"]}
              style={styles.tabList}
            >
              <TouchableOpacity
                style={styles.tabTrigger}
                onPress={() => setActiveTab("interests")}
                activeOpacity={0.8}
              >
                {activeTab === "interests" ? (
                  <LinearGradient
                    colors={["#5B9BD5", "#667BC6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabActive}
                  >
                    <Text style={styles.tabTextActive}>관심사</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabTextInactive}>관심사</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabTrigger}
                onPress={() => setActiveTab("calendar")}
                activeOpacity={0.8}
              >
                {activeTab === "calendar" ? (
                  <LinearGradient
                    colors={["#5B9BD5", "#667BC6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabActive}
                  >
                    <Text style={styles.tabTextActive}>캘린더</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabTextInactive}>캘린더</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabTrigger}
                onPress={() => setActiveTab("recommendations")}
                activeOpacity={0.8}
              >
                {activeTab === "recommendations" ? (
                  <LinearGradient
                    colors={["#5B9BD5", "#667BC6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabActive}
                  >
                    <Text style={styles.tabTextActive}>추천</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabTextInactive}>추천</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {/* Child Selector - Same Row */}
            {childProfiles.length > 1 && (
              <View style={styles.childSelector}>
                <TouchableOpacity
                  style={styles.childDropdownButton}
                  onPress={() => setShowChildDropdown(!showChildDropdown)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[
                      "rgba(91, 155, 213, 0.1)",
                      "rgba(102, 123, 198, 0.1)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.childDropdownGradient}
                  >
                    <Image
                      source={{
                        uri: childProfiles[selectedChildIndex]?.avatarUrl,
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                      }}
                    />

                    <Text style={styles.childDropdownName}>
                      {childProfiles[selectedChildIndex]?.name || "자녀"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Dropdown Menu */}
                {showChildDropdown && (
                  <View style={styles.childDropdownMenu}>
                    {childProfiles.map((child, index) => (
                      <TouchableOpacity
                        key={child.profileId}
                        style={styles.childDropdownItem}
                        onPress={() => {
                          setSelectedChildIndex(index);
                          setShowChildDropdown(false);
                        }}
                        activeOpacity={0.8}
                      >
                        {child.avatarUrl ? (
                          <Image
                            source={{ uri: child.avatarUrl }}
                            style={styles.childDropdownItemAvatarImage}
                          />
                        ) : (
                          <Text style={styles.childDropdownItemAvatar}>
                            {child.gender === "male" ? "👦" : "👧"}
                          </Text>
                        )}
                        <Text
                          style={[
                            styles.childDropdownItemName,
                            selectedChildIndex === index &&
                              styles.childDropdownItemNameActive,
                          ]}
                        >
                          {child.name}
                        </Text>
                        {selectedChildIndex === index && (
                          <Text style={styles.childDropdownItemCheck}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Interests Tab */}
          {activeTab === "interests" && (
            <Card style={styles.contentCard}>
              <View style={styles.cardPadding}>
                {/* Header */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.trendIcon}>📈</Text>
                  <Text style={styles.sectionTitle}>관심사 TOP 10</Text>
                </View>

                {/* Loading */}
                {interestsLoading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator
                      size="large"
                      color={colors.parent.from}
                    />
                    <Text style={styles.loadingText}>
                      관심사 데이터 로딩 중...
                    </Text>
                  </View>
                )}

                {/* Bubble Chart */}
                {!interestsLoading && <BubbleChart data={interests} />}
              </View>
            </Card>
          )}

          {/* Calendar Tab */}
          {activeTab === "calendar" && (
            <Card style={styles.contentCard}>
              <View style={styles.cardPadding}>
                {/* ActivityCalendar Component */}
                <ActivityCalendar
                  events={activities}
                  selectedDate={selectedDate || undefined}
                  onDateSelect={(date) => {
                    setSelectedDate(date);
                    console.log("Selected date:", date);
                  }}
                />

                {/* Children Grid */}
                <Text style={styles.dateTitle}>
                  {selectedDate
                    ? `${selectedDate} 대화 기록`
                    : "오늘의 대화 기록"}
                </Text>
                <View style={styles.childrenGrid}>
                  {CHILDREN.map((child) => (
                    <TouchableOpacity
                      key={child.id}
                      style={styles.childCard}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={["#5B9BD5", "#4A8BC2"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.childCardGradient}
                      >
                        <Text style={styles.childAvatar}>{child.avatar}</Text>
                        <Text style={styles.childName}>{child.name}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card>
          )}

          {/* Recommendations Tab */}
          {activeTab === "recommendations" && (
            <Card style={styles.contentCard}>
              <View style={styles.cardPadding}>
                {/* Related Interest Header */}
                {topKeyword && (
                  <View style={styles.relatedInterestHeader}>
                    <Text style={styles.relatedInterestText}>
                      {childProfiles[selectedChildIndex]?.name || "자녀"}님의
                      관심사 '{topKeyword}' 기반 추천
                    </Text>
                  </View>
                )}

                {/* Category Tabs */}
                <View style={styles.categoryTabs}>
                  {(
                    [
                      "관광지",
                      "문화시설",
                      "축제공연행사",
                    ] as RecommendationType[]
                  ).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={styles.categoryTab}
                      onPress={() => setSelectedRecommendationType(type)}
                      activeOpacity={0.8}
                    >
                      {selectedRecommendationType === type ? (
                        <LinearGradient
                          colors={["#5B9BD5", "#667BC6"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.categoryTabActive}
                        >
                          <Text style={styles.categoryTabTextActive}>
                            {type}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <Text style={styles.categoryTabTextInactive}>
                          {type}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Recommendation List */}
                <View style={styles.recommendationList}>
                  {filteredRecommendations.map((rec: Recommendation) => (
                    <TouchableOpacity
                      key={rec.id}
                      style={styles.recommendationCard}
                      activeOpacity={0.8}
                      onPress={() => {
                        if (rec.link) {
                          Linking.openURL(rec.link).catch((err) =>
                            console.error("링크 열기 실패:", err)
                          );
                        }
                      }}
                    >
                      {rec.imageUrl && (
                        <Image
                          source={{ uri: rec.imageUrl }}
                          style={styles.recommendationImage}
                          resizeMode="cover"
                        />
                      )}
                      <View style={styles.recommendationContent}>
                        <View style={styles.recommendationInfo}>
                          <Text style={styles.recommendationTitle}>
                            {rec.title}
                          </Text>
                          <Text style={styles.recommendationDescription}>
                            {rec.description}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card>
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
    padding: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl * 2,
  },

  // Child Selector
  childSelector: {
    position: "relative" as const,
    zIndex: 1000,
  },

  childDropdownButton: {
    borderRadius: borderRadius.full,
    overflow: "hidden",
    ...shadows.md,
  },

  childDropdownGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },

  childDropdownAvatar: {
    fontSize: 24,
  },

  childDropdownName: {
    fontSize: 14,
    color: "#5B9BD5",
    fontWeight: "600" as const,
  },

  childDropdownArrow: {
    fontSize: 12,
    color: "#5B9BD5",
  },

  childDropdownMenu: {
    position: "absolute" as const,
    top: 38,
    right: 0,
    minWidth: 120,
    backgroundColor: "white",
    borderRadius: borderRadius.xl,
    ...shadows.xl,
    zIndex: 1001,
  },

  childDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  childDropdownItemAvatar: {
    fontSize: 18,
  },

  childDropdownItemAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },

  childDropdownItemName: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },

  childDropdownItemNameActive: {
    color: "#5B9BD5",
    fontWeight: "600" as const,
  },

  childDropdownItemCheck: {
    fontSize: 14,
    color: "#5B9BD5",
  },

  // Tab Navigation
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  tabList: {
    flex: 1,
    flexDirection: "row",
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    ...shadows.lg,
  },

  tabTrigger: {
    flex: 1,
  },

  tabActive: {
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.lg,
  },

  tabTextActive: {
    ...typography.button,
    fontSize: 15,
    color: colors.primaryForeground,
  },

  tabTextInactive: {
    ...typography.button,
    fontSize: 15,
    color: "#6b7280", // text-gray-600
    textAlign: "center",
    paddingVertical: spacing.md,
  },

  // Content Card
  contentCard: {
    backgroundColor: "#f9fafb", // bg-gray-50
    borderRadius: borderRadius["2xl"],
    ...shadows.sm,
  },

  cardPadding: {
    padding: spacing.xl,
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },

  trendIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },

  calendarIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },

  sectionTitle: {
    ...typography.h2,
    fontSize: 24,
    color: "#111827", // text-gray-900
  },

  // Loading
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
  },

  loadingText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },

  // Calendar
  calendarPlaceholder: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.xl,
  },

  placeholderIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },

  placeholderText: {
    ...typography.h3,
    fontSize: 18,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },

  placeholderSubtext: {
    ...typography.body2,
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
  },

  dateTitle: {
    ...typography.h3,
    fontSize: 18,
    color: "#111827",
    marginBottom: spacing.lg,
  },

  childrenGrid: {
    flexDirection: "row",
    gap: spacing.lg,
  },

  childCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: borderRadius["2xl"],
    overflow: "hidden",
    ...shadows.md,
  },

  childCardGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  childAvatar: {
    fontSize: 60,
    marginBottom: spacing.lg,
  },

  childName: {
    ...typography.h2,
    fontSize: 24,
    color: colors.primaryForeground,
  },

  // Recommendations
  relatedInterestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },

  relatedInterestIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },

  relatedInterestText: {
    ...typography.body1,
    fontSize: 15,
    color: "#5B9BD5",
    fontWeight: "600" as const,
  },

  categoryTabs: {
    flexDirection: "row",
    padding: spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: borderRadius.full,
    marginTop: 0,
    marginBottom: spacing.xl,
    ...shadows.lg,
  },

  categoryTab: {
    flex: 1,
  },

  categoryTabActive: {
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.lg,
  },

  categoryTabTextActive: {
    ...typography.button,
    fontSize: 13,
    color: colors.primaryForeground,
  },

  categoryTabTextInactive: {
    ...typography.button,
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    paddingVertical: spacing.sm,
  },

  recommendationList: {
    gap: spacing.md,
  },

  recommendationCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.sm,
  },

  recommendationImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#f3f4f6",
  },

  recommendationContent: {
    padding: spacing.lg,
  },

  recommendationIcon: {
    fontSize: 40,
  },

  recommendationInfo: {
    flex: 1,
  },

  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },

  typeIcon: {
    fontSize: 20,
  },

  recommendationTitle: {
    ...typography.h4,
    fontSize: 18,
    color: "#111827",
  },

  recommendationDescription: {
    ...typography.body1,
    fontSize: 14,
    color: "#6b7280",
    marginBottom: spacing.sm,
  },

  relatedBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: "rgba(91, 155, 213, 0.1)",
    borderRadius: borderRadius.full,
  },

  relatedText: {
    fontSize: 12,
    color: "#5B9BD5",
  },
});
