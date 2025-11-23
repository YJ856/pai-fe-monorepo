/**
 * 자녀 프로필 화면
 *
 * 주요 기능:
 * - 프로필 정보 표시
 * - 우리 가족들 목록
 * - 로그아웃
 * - 프로필 수정 (이름만)
 *
 * 디자인:
 * - 화이트 배경
 * - 그레이 카드 레이아웃
 * - 그린 아이콘 (#10B981)
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { LogOut, Users, Edit, X, Camera } from "lucide-react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { spacing, typography, shadows } from "../../../design/tokens";
import { RefreshableScrollView } from "../../../design/components/RefreshableScrollView";
import { updateProfile } from "../../../api/profiles";
import { uploadMedia, deleteMedia, getMedia } from "../../../api/media";
import { logout } from "../../../api/auth";
import { useProfileStore } from "@/store/useProfileStore";

export default function ChildProfileScreen() {
  const navigation = useNavigation<any>();
  const [showEditModal, setShowEditModal] = useState(false);
  const currentProfile = useProfileStore((state) => state.currentProfile);
  const profiles = useProfileStore((state) => state.profiles);
  const familyMembers =
    profiles?.filter((p) => p.profileId !== currentProfile?.profileId) || [];

  const [isLoading, setIsLoading] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  // 화면 포커스 시 프로필 정보 로드
  useFocusEffect(
    React.useCallback(() => {
      loadProfileData();
    }, [currentProfile])
  );

  const loadProfileData = async () => {
    if (!currentProfile) return;

    setIsLoading(true);
    try {
      // 아바타 이미지 로드
      if (currentProfile.avatarMediaId) {
        const mediaId = String(currentProfile.avatarMediaId);
        const mediaResponse = await getMedia({ mediaIds: mediaId });
        if (mediaResponse && mediaResponse.length > 0) {
          setAvatarUri(mediaResponse[0].cdnUrl);
        }
      }
    } catch (error) {
      console.error("프로필 데이터 로드 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditedName(currentProfile?.name || "");
    setShowEditModal(true);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentProfile) return;

    setIsLoading(true);
    try {
      let newAvatarMediaId = currentProfile.avatarMediaId;

      // 이미지가 변경되었으면 업로드
      if (avatarUri && !avatarUri.startsWith("http")) {
        // 기존 이미지 삭제
        if (currentProfile.avatarMediaId) {
          try {
            await deleteMedia(String(currentProfile.avatarMediaId));
          } catch (error) {
            console.log("기존 이미지 삭제 실패 (무시):", error);
          }
        }

        // 새 이미지 업로드
        try {
          const formData = new FormData();
          formData.append("file", {
            uri: avatarUri,
            type: "image/jpeg",
            name: "avatar.jpg",
          } as any);

          const uploadResult = await uploadMedia(formData);
          newAvatarMediaId = String(uploadResult.mediaId);
        } catch (uploadError: any) {
          console.error("이미지 업로드 오류:", uploadError);
          Alert.alert(
            "경고",
            "이미지 업로드에 실패했습니다.\n프로필 이름만 업데이트됩니다."
          );
        }
      }

      // 프로필 업데이트
      await updateProfile(String(currentProfile.profileId), {
        name: editedName,
        avatarMediaId: newAvatarMediaId ? String(newAvatarMediaId) : undefined,
      });

      // Zustand store 업데이트
      useProfileStore.getState().setCurrentProfile({
        ...currentProfile,
        name: editedName,
        avatarMediaId: newAvatarMediaId,
      });

      setShowEditModal(false);
      Alert.alert("성공", "프로필이 수정되었습니다.");
      loadProfileData();
    } catch (error: any) {
      console.error("프로필 수정 오류:", error);
      Alert.alert("오류", `프로필 수정에 실패했습니다.\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠어요?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            const accessToken = await AsyncStorage.getItem("accessToken");
            if (accessToken) {
              await logout();
            }
          } catch (error) {
            console.log("Logout API error:", error);
          } finally {
            await AsyncStorage.multiRemove([
              "accessToken",
              "refreshToken",
              "userId",
            ]);
            useProfileStore.getState().clearProfile();

            // Root Navigator의 Auth로 이동
            const parent = navigation.getParent();
            if (parent) {
              parent.reset({
                index: 0,
                routes: [{ name: "Auth" }],
              });
            }
          }
        },
      },
    ]);
  };

  const getAvatarDisplay = () => {
    if (avatarUri) {
      return <Image source={{ uri: avatarUri }} style={styles.avatarImage} />;
    }
    const emoji = currentProfile?.gender === "male" ? "👦" : "👧";
    return <Text style={styles.avatarEmoji}>{emoji}</Text>;
  };

  if (!currentProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>프로필 로드 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={["#FFE5E0", "#FFF0ED"]} style={styles.gradientContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <RefreshableScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            onRefresh={loadProfileData}
            refreshing={isLoading}
          >
          {/* Profile Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarWrapper}>{getAvatarDisplay()}</View>
              <View style={styles.profileNameContainer}>
                <Text style={styles.cardTitle}>{currentProfile.name}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditProfile}
                  activeOpacity={0.7}
                >
                  <Edit size={16} color="#10B981" />
                  <Text style={styles.editButtonText}>수정</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>생년월일</Text>
                <Text style={styles.infoValue}>{currentProfile.birthDate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>성별</Text>
                <Text style={styles.infoValue}>
                  {currentProfile.gender === "male" ? "남자" : "여자"}
                </Text>
              </View>
            </View>
          </View>

          {/* Family Members Card */}
          <View style={styles.card}>
            <View style={styles.familyCardHeader}>
              <Users size={28} color="#10B981" />
              <Text style={styles.cardTitle}>우리 가족들</Text>
            </View>

            <View style={styles.familyList}>
              {familyMembers.length > 0 ? (
                familyMembers.map((member) => (
                  <View key={member.profileId} style={styles.familyItem}>
                    {member.avatarUrl ? (
                      <Image
                        source={{ uri: member.avatarUrl }}
                        style={styles.familyAvatarImage}
                      />
                    ) : (
                      <Text style={styles.familyAvatar}>
                        {member.profileType === "parent"
                          ? member.gender === "male"
                            ? "👨"
                            : "👩"
                          : member.gender === "male"
                          ? "👦"
                          : "👧"}
                      </Text>
                    )}
                    <View style={styles.familyInfo}>
                      <Text style={styles.familyName}>{member.name}</Text>
                      <Text style={styles.familyDetail}>
                        {member.profileType === "child"
                          ? member.gender === "female"
                            ? "딸"
                            : "아들"
                          : member.gender === "female"
                          ? "엄마"
                          : "아빠"}
                      </Text>
                      <Text style={styles.familyDetail}>
                        {member.birthDate}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  다른 가족 구성원이 없습니다
                </Text>
              )}
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={20} color="#6B7280" />
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </RefreshableScrollView>
      </View>
      </SafeAreaView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>프로필 수정</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                activeOpacity={0.7}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Avatar Edit */}
            <View style={styles.modalAvatarContainer}>
              <View style={styles.modalAvatarWrapper}>
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.modalAvatarImage}
                  />
                ) : (
                  <Text style={styles.modalAvatarEmoji}>
                    {currentProfile.gender === "male" ? "👦" : "👧"}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                >
                  <Camera size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Name Edit */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>이름</Text>
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="이름을 입력하세요"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  profileNameContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  familyCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#D1FAE5",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  infoList: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    ...typography.body1,
    color: "#6B7280",
    flex: 1,
  },
  infoValue: {
    ...typography.body1,
    color: "#111827",
    fontWeight: "600",
    flex: 2,
    textAlign: "right",
  },
  familyList: {
    gap: spacing.sm,
  },
  familyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    gap: spacing.md,
  },
  familyAvatar: {
    fontSize: 40,
  },
  familyAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  familyInfo: {
    flex: 1,
  },
  familyName: {
    ...typography.body1,
    color: "#111827",
    fontWeight: "700",
  },
  familyDetail: {
    fontSize: 14,
    color: "#6B7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  logoutText: {
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "600",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: "#6B7280",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  modalAvatarContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalAvatarWrapper: {
    position: "relative",
    width: 100,
    height: 100,
  },
  modalAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  modalAvatarEmoji: {
    fontSize: 80,
    lineHeight: 100,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    ...shadows.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: spacing.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
