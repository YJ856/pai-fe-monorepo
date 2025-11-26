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

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ImageBackground,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Card, CardContent } from "../../../design/components/Card";
import { Avatar } from "../../../design/components/Avatar";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../../design/tokens";
import { Profile } from "pai-shared-types";
import { useProfileList } from "./hooks/useProfileList";
import { useProfileSelection } from "./hooks/useProfileSelection";
import { useProfileActions } from "./hooks/useProfileActions";

export default function ProfileSelectScreen() {
  // 프로필 목록 Hook
  const { profiles, isLoading, refreshing, loadProfiles, onRefresh } =
    useProfileList();

  // 프로필 선택 Hook
  const {
    selectedProfile,
    showPinModal,
    setShowPinModal,
    pin,
    setPin,
    pinError,
    handleProfileClick,
    handlePinSubmit,
  } = useProfileSelection();

  // PIN이 4자리가 되면 자동 제출
  useEffect(() => {
    if (pin.length === 4 && showPinModal) {
      setTimeout(() => handlePinSubmit(), 200);
    }
  }, [pin, showPinModal]);

  // 프로필 액션 Hook
  const { handleCreateProfile, handleLogout } = useProfileActions();

  // 화면에 포커스될 때마다 프로필 목록 새로고침
  useFocusEffect(
    React.useCallback(() => {
      loadProfiles();
    }, [])
  );

  // 2x2 그리드로 프로필을 그룹화 (4개씩)
  const groupedProfiles = React.useMemo(() => {
    const groups: Profile[][] = [];
    for (let i = 0; i < profiles.length; i += 4) {
      groups.push(profiles.slice(i, i + 4));
    }
    return groups;
  }, [profiles]);

  const renderProfileCard = (item: Profile) => {
    const isParent = item.profileType === "parent";

    return (
      <TouchableOpacity
        key={String(item.profileId)}
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

  const renderProfileGroup = ({ item }: { item: Profile[] }) => {
    const hasOnlyOneInSecondRow = item.length === 3;

    return (
      <View style={styles.profileGroup}>
        <View style={styles.profileRow}>
          {item[0] && renderProfileCard(item[0])}
          {item[1] && renderProfileCard(item[1])}
        </View>
        <View style={[styles.profileRow, hasOnlyOneInSecondRow && styles.profileRowLeft]}>
          {item[2] && renderProfileCard(item[2])}
          {item[3] && renderProfileCard(item[3])}
        </View>
      </View>
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
                      <>
                        {groupedProfiles.length === 1 ? (
                          // 4개 이하면 스크롤 없이 표시
                          <View style={styles.singleGroup}>
                            {renderProfileGroup({ item: groupedProfiles[0] })}
                          </View>
                        ) : (
                          // 5개 이상이면 가로 스크롤
                          <FlatList
                            data={groupedProfiles}
                            renderItem={renderProfileGroup}
                            keyExtractor={(item, index) => `group-${index}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            pagingEnabled
                            refreshControl={
                              <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#5B9BD5"
                              />
                            }
                          />
                        )}
                      </>
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
            transparent={false}
            animationType="slide"
            onRequestClose={() => setShowPinModal(false)}
          >
            <View style={styles.pinContainer}>
              <Text style={styles.pinTitle}>부모 프로필 인증</Text>
              <Text style={styles.pinSubtitle}>PIN 입력</Text>
              <Text style={styles.pinDescription}>
                {selectedProfile?.name} 프로필에 접근하려면 PIN을 입력하세요
              </Text>

              {/* PIN 표시칸 */}
              <View style={styles.pinRow}>
                {[0, 1, 2, 3].map((i) => (
                  <View key={i} style={styles.pinBox}>
                    <Text style={styles.pinDot}>{pin[i] ? '●' : ''}</Text>
                  </View>
                ))}
              </View>

              {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}

              {/* 숫자 키패드 */}
              <View style={styles.keypad}>
                {[
                  ['1', '2', '3'],
                  ['4', '5', '6'],
                  ['7', '8', '9'],
                  ['', '0', '⌫'],
                ].map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.keypadRow}>
                    {row.map((key) => {
                      if (key === '') {
                        return <View key="empty" style={styles.keypadKey} />;
                      }
                      if (key === '⌫') {
                        return (
                          <TouchableOpacity
                            key="del"
                            style={styles.keypadKey}
                            onPress={() => setPin((prev) => prev.slice(0, -1))}
                          >
                            <Text style={styles.keypadKeyText}>⌫</Text>
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <TouchableOpacity
                          key={key}
                          style={styles.keypadKey}
                          onPress={() => {
                            if (pin.length < 4) {
                              setPin(pin + key);
                            }
                          }}
                        >
                          <Text style={styles.keypadKeyText}>{key}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
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

  singleGroup: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },

  horizontalList: {
    paddingVertical: spacing.sm,
  },

  profileGroup: {
    paddingHorizontal: spacing.md,
  },

  profileRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  profileRowLeft: {
    justifyContent: "flex-start",
  },

  profileCard: {
    width: 140,
    height: 140,
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

  // PIN Screen styles (full screen)
  pinContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
  },

  pinTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 40,
  },

  pinSubtitle: {
    fontSize: 18,
    marginTop: 20,
  },

  pinDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
  },

  pinRow: {
    flexDirection: 'row',
    marginVertical: 30,
  },

  pinBox: {
    width: 40,
    height: 40,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pinDot: {
    fontSize: 20,
  },

  pinError: {
    color: 'red',
    marginBottom: 10,
  },

  keypad: {
    marginTop: 20,
  },

  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  keypadKey: {
    width: 70,
    height: 70,
    margin: 10,
    borderRadius: 35,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  keypadKeyText: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  submitButton: {
    width: '80%',
    paddingVertical: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },

  submitButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },

  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
  },

  cancelButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
});
