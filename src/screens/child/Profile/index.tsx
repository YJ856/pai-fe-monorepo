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
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { LogOut, Users, Edit, X, Camera, Volume2 } from "lucide-react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { spacing, typography, shadows } from "../../../design/tokens";
import { RefreshableScrollView } from "../../../design/components/RefreshableScrollView";
import { updateProfile } from "../../../api/profiles";
import { uploadMedia, deleteMedia, getMedia } from "../../../api/media";
import { logout } from "../../../api/auth";
import { useProfileStore } from "../../../store/useProfileStore";

export default function ChildProfileScreen() {
  const navigation = useNavigation<any>();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const currentProfile = useProfileStore((state) => state.currentProfile);
  const profiles = useProfileStore((state) => state.profiles);
  const familyMembers =
    profiles?.filter((p) => p.profileId !== currentProfile?.profileId) || [];

  const [isLoading, setIsLoading] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  // 나이 계산 함수
  const calculateAge = (birthDate: string | undefined): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // 형제자매 관계 표시 함수
  const getSiblingRelation = (member: any): string => {
    if (!currentProfile || !currentProfile.birthDate || !member.birthDate) {
      return member.profileType === "child"
        ? member.gender === "female"
          ? "딸"
          : "아들"
        : member.gender === "female"
          ? "엄마"
          : "아빠";
    }

    // 부모인 경우
    if (member.profileType === "parent") {
      return member.gender === "female" ? "엄마" : "아빠";
    }

    // 자녀인 경우 - 나이 비교
    const myAge = calculateAge(currentProfile.birthDate);
    const memberAge = calculateAge(member.birthDate);

    if (myAge === null || memberAge === null) {
      return member.gender === "female" ? "딸" : "아들";
    }

    // 나이가 어리면 동생
    if (memberAge < myAge) {
      return "동생";
    }

    // 나이가 많으면 성별에 따라 호칭 결정
    if (currentProfile.gender === "female") {
      // 내가 여자인 경우
      return member.gender === "female" ? "언니" : "오빠";
    } else {
      // 내가 남자인 경우
      return member.gender === "female" ? "누나" : "형";
    }
  };

  // 부모 프로필 중 음성이 있는 프로필만 필터링
  const parentProfilesWithVoice = profiles.filter(
    (p) => p.profileType === "parent" && p.voiceMediaId
  );

  // 현재 선택된 음성의 부모 프로필 찾기
  const selectedParentVoice = currentProfile?.voiceMediaId
    ? profiles.find((p) => p.voiceMediaId === currentProfile.voiceMediaId)
    : null;

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

  const handleChangeVoice = async (voiceMediaId: string | undefined) => {
    if (!currentProfile) return;

    setIsLoading(true);
    setShowVoiceModal(false);
    try {
      await updateProfile(String(currentProfile.profileId), {
        voiceMediaId: voiceMediaId,
      });

      useProfileStore.getState().setCurrentProfile({
        ...currentProfile,
        voiceMediaId: voiceMediaId,
      });

      Alert.alert("성공", "부모님 목소리가 변경되었습니다.");
    } catch (error: any) {
      console.error("음성 변경 오류:", error);
      Alert.alert("오류", `음성 변경에 실패했습니다.\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>프로필 로드 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
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

          {/* Parent Voice Selection Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => setShowVoiceModal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.voiceCardHeader}>
              <View style={styles.iconCircle}>
                <Volume2 size={20} color="#10B981" />
              </View>
              <View style={styles.voiceCardInfo}>
                <Text style={styles.cardTitle}>부모님 목소리</Text>
                <Text style={styles.voiceCardSubtitle}>
                  {selectedParentVoice
                    ? `${selectedParentVoice.name}의 목소리`
                    : "기본 목소리"}
                </Text>
              </View>
              <Text style={styles.changeText}>변경</Text>
            </View>
          </TouchableOpacity>

          {/* Family Members Card */}
          <View style={styles.card}>
            <View style={styles.familyCardHeader}>
              <View style={styles.iconCircle}>
                <Users size={20} color="#10B981" />
              </View>
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
                        {getSiblingRelation(member)}
                      </Text>
                      <Text style={styles.familyDetail}>
                        {member.birthDate}
                        {calculateAge(member.birthDate) !== null && ` (${calculateAge(member.birthDate)}세)`}
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

      {/* Voice Selection Modal */}
      <Modal
        visible={showVoiceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVoiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>부모님 목소리 선택</Text>
              <TouchableOpacity
                onPress={() => setShowVoiceModal(false)}
                activeOpacity={0.7}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {parentProfilesWithVoice.length === 0 ? (
              <View style={styles.noVoiceContainer}>
                <Text style={styles.noVoiceText}>
                  부모 프로필에서 먼저 음성을 등록해주세요
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.voiceModalList}>
                {/* 부모 목소리 옵션들 */}
                {parentProfilesWithVoice.map((parent) => (
                  <TouchableOpacity
                    key={parent.profileId}
                    style={[
                      styles.voiceModalOption,
                      currentProfile?.voiceMediaId === parent.voiceMediaId &&
                        styles.voiceModalOptionSelected,
                    ]}
                    onPress={() => handleChangeVoice(parent.voiceMediaId!)}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    <View style={styles.voiceModalOptionContent}>
                      {parent.avatarUrl ? (
                        <Image
                          source={{ uri: parent.avatarUrl }}
                          style={styles.voiceParentAvatar}
                        />
                      ) : (
                        <Text style={styles.voiceCardEmoji}>
                          {parent.gender === "male" ? "👨" : "👩"}
                        </Text>
                      )}
                      <View style={styles.voiceCardInfo}>
                        <Text style={styles.voiceModalName}>{parent.name}</Text>
                        <Text style={styles.voiceModalDetail}>
                          {parent.gender === "male" ? "아빠" : "엄마"}의 목소리
                        </Text>
                      </View>
                    </View>
                    {currentProfile?.voiceMediaId === parent.voiceMediaId && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 12,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 16,
  },
  profileNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  familyCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  voiceCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  voiceCardSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  changeText: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "600",
    marginLeft: "auto",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  infoList: {
    gap: 0,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  familyList: {
    gap: 8,
  },
  familyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  familyAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  familyAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  familyInfo: {
    flex: 1,
  },
  familyName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  familyDetail: {
    fontSize: 13,
    color: "#6b7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    gap: 8,
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 16,
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
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  modalAvatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalAvatarWrapper: {
    position: "relative",
    width: 80,
    height: 80,
  },
  modalAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  modalAvatarEmoji: {
    fontSize: 40,
  },
  cameraButton: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  inputGroup: {
    marginBottom: 16,
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Voice Selection Modal Styles
  noVoiceContainer: {
    padding: 12,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  noVoiceText: {
    fontSize: 13,
    color: "#92400E",
    textAlign: "center",
  },
  voiceModalList: {
    maxHeight: 400,
  },
  voiceModalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  voiceModalOptionSelected: {
    borderColor: "#10B981",
    backgroundColor: "#D1FAE5",
  },
  voiceModalOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  voiceCardEmptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  voiceCardEmoji: {
    fontSize: 32,
  },
  voiceParentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  voiceCardInfo: {
    flex: 1,
  },
  voiceModalName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  voiceModalDetail: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
});
