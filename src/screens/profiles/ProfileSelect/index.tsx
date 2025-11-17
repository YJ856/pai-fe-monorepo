/**
 * ProfileSelection 화면 (Design_v2 기반)
 *
 * 주요 기능:
 * - 가족 구성원 프로필 그리드 표시
 * - 자녀 프로필: 직접 선택
 * - 부모 프로필: PIN 입력 모달
 * - 프로필 생성 버튼
 *
 * 디자인:
 * - background.png 배경
 * - rounded-3xl 카드 (24px)
 * - shadow-2xl
 * - Auth gradient (Navy → Blue)
 *
 * API:
 * - GET /api/profiles (api/profiles.ts)
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ImageBackground,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Card, CardContent } from "../../../design/components/Card";
import { Input } from "../../../design/components/Input";
import { Label } from "../../../design/components/Label";
import { Button } from "../../../design/components/Button";
import { Avatar } from "../../../design/components/Avatar";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../../design/tokens";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout } from "../../../api/auth";
import { getProfiles, selectProfile } from "../../../api/profiles";
import { getMedia } from '../../../api/media'
import { useProfileStore } from "../../../store/useProfileStore";
import { Profile } from "pai-shared-types";

export default function ProfileSelectScreen() {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  // Zustand store
  const { profiles, setCurrentProfile, setProfiles: setProfiles } =
    useProfileStore();

  // 화면에 포커스될 때마다 프로필 목록 새로고침
  useFocusEffect(
    React.useCallback(() => {
      loadProfiles();
    }, [])
  );

  const loadProfiles = async () => {
    setIsLoading(true);

    try {
      // Zustand store에 이미 프로필 목록이 있는지 확인
      const storeProfiles = useProfileStore.getState().profiles;

      if (storeProfiles.length > 0) {
        console.log("Zustand store에 저장된 프로필 사용 (API 호출 생략):", storeProfiles.length);
        setIsLoading(false);
        return;
      }

      // Store에 프로필이 없을 때만 API 호출
      console.log("프로필 목록 로드 시작...");
      const profileList = await getProfiles('all');
      console.log("프로필 목록 로드 완료:", profileList);
      console.log("프로필 개수:", profileList?.length || 0);

      // 배열인지 확인 및 데이터 변환
      if (Array.isArray(profileList)) {
        // API 응답 데이터를 앱 타입으로 변환
        const baseProfiles = profileList.map((profile: any) => ({

          profileId: Number(profile.profileId || profile.id),
          userId: Number(profile.userId),
          profileType: profile.profileType,
          name: profile.name,
          birthDate: profile.birthDate || profile.birthdate,
          gender: profile.gender?.toLowerCase(),

          avatarMediaId: profile.avatarMediaId ? BigInt(profile.avatarMediaId) : undefined,
          voiceMediaId: profile.voiceMediaId ? BigInt(profile.voiceMediaId) : undefined,
          avatarUrl: undefined,

          createdAt: profile.createdAt || profile.createAt, // 오타 가능성 고려

        }));

        const addUrlProfiles = baseProfiles.map(async (profile) => {
          let avatarUrl = undefined;
          if (profile.avatarMediaId) {
            try {
              const mediaId = String(profile.avatarMediaId)
              const mediaResponse = await getMedia({ mediaIds: mediaId });
              avatarUrl = mediaResponse?.[0].cdnUrl;
            } catch (error) {
              console.error(`Failed to fetch media URL for ID ${profile.avatarMediaId}:`, error);
            }

          }
          return { ...profile, avatarUrl };
        })

        const transformedProfiles = await Promise.all(addUrlProfiles);

        setProfiles(transformedProfiles); // Zustand store에 저장
        console.log("변환된 프로필:", transformedProfiles);
      } else {
        console.error("프로필 목록이 배열이 아닙니다:", profileList);
        setProfiles([]); // 빈 배열로 초기화
      }
    } catch (error: any) {
      // 401 에러는 axios 인터셉터에서 자동으로 처리하여 로그인 화면으로 이동하므로
      // 여기서는 사용자에게 에러 Alert을 표시하지 않음
      if (error.response?.status === 401) {
        console.log("[ProfileSelect] 401 Unauthorized - 로그인 화면으로 리다이렉트됩니다.");
        setProfiles([]); // 스토어 비우기
        return; // Alert 표시하지 않고 조용히 종료
      }

      // 401이 아닌 다른 에러는 로그 출력 및 Alert 표시
      console.error("프로필 목록 로드 오류:", error);
      console.error("에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      setProfiles([]); // 오류 발생 시 스토어도 비웁니다.

      Alert.alert(
        "오류",
        error.response?.data?.message || "프로필 목록을 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfiles();
  };

  const handleProfileClick = async (profile: Profile) => {
    if (profile.profileType === "parent") {
      setSelectedProfile(profile);
      setShowPinModal(true);
      setPin("");
      setPinError("");
    } else {
      // 자녀 프로필 선택 (PIN 불필요)
      try {
        const result = await selectProfile(String(profile.profileId));

        // 토큰 저장
        if (result.accessToken) {
          await AsyncStorage.setItem("accessToken", result.accessToken);
          console.log('[ProfileSelect-Child] AccessToken saved:', result.accessToken.substring(0, 20) + '...');
        } else {
          console.warn('[ProfileSelect-Child] No accessToken in response!');
        }
        if (result.refreshToken) {
          await AsyncStorage.setItem("refreshToken", result.refreshToken);
        }

        // Zustand store에 현재 프로필 저장
        setCurrentProfile(profile);

        // 자녀용 앱으로 네비게이션
        navigation.reset({
          index: 0,
          routes: [{ name: "ChildApp" }],
        });
      } catch (error: any) {
        console.error("자녀 프로필 선택 오류:", error);
        Alert.alert("오류", "프로필 선택 중 오류가 발생했습니다.");
      }
    }
  };

  const handlePinSubmit = async () => {
    if (!selectedProfile) return;

    try {
      setPinError("");

      // 백엔드에서 PIN 검증
      const result = await selectProfile(String(selectedProfile.profileId), pin);

      // PIN이 맞으면 토큰 저장
      if (result.accessToken) {
        await AsyncStorage.setItem("accessToken", result.accessToken);
        console.log('[ProfileSelect-Parent] AccessToken saved:', result.accessToken.substring(0, 20) + '...');
      } else {
        console.warn('[ProfileSelect-Parent] No accessToken in response!');
      }
      if (result.refreshToken) {
        await AsyncStorage.setItem("refreshToken", result.refreshToken);
      }

      // Zustand store에 현재 프로필 저장
      setCurrentProfile(selectedProfile);

      setShowPinModal(false);

      // 부모용 앱으로 네비게이션
      navigation.reset({
        index: 0,
        routes: [{ name: "ParentApp" }],
      });
    } catch (error: any) {
      console.error("PIN 검증 오류:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setPinError("PIN이 일치하지 않습니다.");
      } else {
        setPinError("프로필 선택 중 오류가 발생했습니다.");
      }
    }
  };

  const handleCreateProfile = () => {
    navigation.navigate("ProfileCreate");
  };

  const handleLogout = async () => {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            // AsyncStorage에서 토큰 가져오기
            const accessToken = await AsyncStorage.getItem("accessToken");

            if (accessToken) {
              // 토큰이 있으면 서버에 로그아웃 요청
              await logout();
            }
          } catch (error) {
            console.log("Logout API error:", error);
            // API 실패해도 로컬 토큰은 삭제하고 계속 진행
          } finally {
            // AsyncStorage에서 토큰 삭제
            await AsyncStorage.multiRemove([
              "accessToken",
              "refreshToken",
              "userId",
            ]);

            // Zustand store 프로필 데이터 삭제
            useProfileStore.getState().clearProfile();

            console.log("로그아웃 완료 - 로그인 화면으로 이동");

            // authEvents 발생시켜서 RootNavigator에서 자동으로 Auth 화면으로 이동
            // navigation.reset 대신 replace 사용
            navigation.replace("Auth");
          }
        },
      },
    ]);
  };

  const renderProfileCard = ({ item }: { item: Profile }) => {
    const isParent = item.profileType === "parent";

    return (
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => handleProfileClick(item)}
        activeOpacity={0.8}
      >
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Avatar emoji={"👤"} size="lg" />
        )}
        {isParent && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
        <Text style={styles.profileName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../../assets/images/background.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.5)"]}
          style={styles.overlay}
        >
          <View style={styles.content}>
            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.25)",
                  "rgba(255, 255, 255, 0.15)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoutGradient}
              >
                <Text style={styles.logoutText}>로그아웃</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Image
                source={require("../../../assets/images/mascot.png")}
                style={styles.mascot}
                resizeMode="contain"
              />
              <Text style={styles.title}>누구세요?</Text>
              <Text style={styles.subtitle}>프로필을 선택해주세요</Text>
            </View>

            {/* Profiles Card */}
            <Card style={styles.card}>
              <CardContent style={styles.cardContent}>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>프로필 로드 중...</Text>
                  </View>
                ) : (
                  <>
                    {profiles.length === 0 ? (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>👤</Text>
                        <Text style={styles.emptyTitle}>프로필이 없습니다</Text>
                        <Text style={styles.emptySubtitle}>
                          아래 버튼을 눌러 첫 프로필을 생성해보세요
                        </Text>
                      </View>
                    ) : (
                      <FlatList
                        data={profiles}
                        renderItem={renderProfileCard}
                        keyExtractor={(item) => String(item.profileId)}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.gridContent}
                        scrollEnabled={false}
                        refreshControl={
                          <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#5B9BD5"
                          />
                        }
                      />
                    )}

                    {/* Create Profile Button */}
                    <TouchableOpacity
                      style={styles.createButton}
                      onPress={handleCreateProfile}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.createIcon}>➕</Text>
                      <Text style={styles.createText}>프로필 생성</Text>
                    </TouchableOpacity>
                  </>
                )}
              </CardContent>
            </Card>
          </View>

          {/* PIN Modal */}
          <Modal
            visible={showPinModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowPinModal(false)}
          >
            <View style={styles.modalOverlay}>
              <Card style={styles.modalCard}>
                <CardContent style={styles.modalContent}>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.lockIconLarge}>🔒</Text>
                    <Text style={styles.modalTitle}>PIN 입력</Text>
                    <Text style={styles.modalSubtitle}>
                      {selectedProfile?.name}님의 PIN을 입력하세요
                    </Text>
                  </View>

                  {/* PIN Input */}
                  <View style={styles.inputGroup}>
                    <Label>PIN</Label>
                    <Input
                      placeholder="4자리 PIN"
                      value={pin}
                      onChangeText={setPin}
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={4}
                      style={styles.pinInput}
                    />
                    {pinError && (
                      <Text style={styles.errorText}>{pinError}</Text>
                    )}
                  </View>

                  {/* Modal Buttons */}
                  <View style={styles.modalButtons}>
                    <Button
                      variant="outline"
                      onPress={() => setShowPinModal(false)}
                      style={styles.modalButton}
                    >
                      취소
                    </Button>
                    <Button
                      variant="gradient"
                      gradient={colors.auth}
                      onPress={handlePinSubmit}
                      style={styles.modalButton}
                    >
                      확인
                    </Button>
                  </View>
                </CardContent>
              </Card>
            </View>
          </Modal>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    width: "100%",
    maxWidth: 500,
    paddingHorizontal: spacing.lg,
  },

  logoutButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.lg,
    borderRadius: borderRadius.full,
    overflow: "hidden",
    ...shadows.lg,
  },

  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },

  logoutIcon: {
    fontSize: 16,
  },

  logoutText: {
    ...typography.body2,
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 0.3,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },

  mascot: {
    width: 120,
    height: 120,
    marginBottom: spacing.md,
  },

  title: {
    ...typography.h1,
    fontSize: 36,
    fontWeight: "600",
    color: colors.primaryForeground,
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.body1,
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
  },

  card: {
    borderRadius: borderRadius["3xl"], // 24px (rounded-3xl)
    ...shadows["2xl"],
  },

  cardContent: {
    padding: spacing.xl,
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
  },

  loadingText: {
    ...typography.body1,
    fontSize: 16,
    color: colors.mutedForeground,
    marginTop: spacing.md,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },

  emptyTitle: {
    ...typography.h3,
    fontSize: 20,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },

  emptySubtitle: {
    ...typography.body2,
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
  },

  gridContent: {
    paddingBottom: spacing.md,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  profileCard: {
    flex: 0.48,
    aspectRatio: 1,
    backgroundColor: colors.muted,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...shadows.sm,
  },

  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
  },

  lockBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  lockIcon: {
    fontSize: 12,
  },

  profileName: {
    ...typography.h4,
    fontSize: 18,
    color: colors.foreground,
    marginTop: spacing.sm,
    marginBottom: spacing.xs - 2,
  },

  profileType: {
    ...typography.body2,
    fontSize: 14,
    color: colors.mutedForeground,
  },

  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },

  createIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },

  createText: {
    ...typography.button,
    color: colors.foreground,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },

  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    ...shadows.xl,
  },

  modalContent: {
    padding: spacing.xl,
  },

  modalHeader: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  lockIconLarge: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },

  modalTitle: {
    ...typography.h3,
    fontSize: 24,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },

  modalSubtitle: {
    ...typography.body2,
    fontSize: 14,
    color: colors.mutedForeground,
  },

  inputGroup: {
    gap: spacing.sm,
  },

  pinInput: {
    textAlign: "center",
    fontSize: 18,
    letterSpacing: 8,
  },

  errorText: {
    ...typography.body2,
    fontSize: 12,
    color: colors.destructive,
    marginTop: spacing.xs - 2,
  },

  modalButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  modalButton: {
    flex: 1,
  },
});
