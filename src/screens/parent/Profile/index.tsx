/**
 * 부모 프로필 화면
 *
 * 주요 기능:
 * - 프로필 정보 표시
 * - 우리 가족들 목록
 * - AI 음성 설정 (음성 등록)
 * - 로그아웃
 * - 프로필 수정 (이름, 주소)
 *
 * 디자인:
 * - 화이트 배경
 * - 그레이 카드 레이아웃
 * - 블루 아이콘 (#5B9BD5)
 * - 음성 설정은 그라데이션 카드
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
import { LogOut, User, Users, Mic, Camera, Edit, X, UserCircle } from "lucide-react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { spacing, typography, shadows } from "../../../design/tokens";
import { RefreshableScrollView } from "../../../design/components/RefreshableScrollView";
import VoiceRegistrationScreen from "./VoiceRegistration";
import { getProfiles, updateProfile } from "../../../api/profiles";
import { uploadMedia, deleteMedia, getMedia } from "../../../api/media";
import { logout } from "../../../api/auth";
import { useProfileStore } from "../../../store/useProfileStore";

export default function ParentProfileScreen() {
  const navigation = useNavigation<any>();
  const [showVoiceRegistration, setShowVoiceRegistration] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const currentProfile = useProfileStore((state) => state.currentProfile);
  const profiles = useProfileStore((state) => state.profiles);
  const familyMembers =
    profiles.filter((p) => p.profileId !== currentProfile?.profileId) || [];
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");

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

  // 프로필 데이터 로드
  useFocusEffect(
    React.useCallback(() => {
      loadProfiles();
    }, [])
  );

  const loadProfiles = async () => {
    // Zustand store에서 프로필 데이터 가져오기 (API 호출 없음)
    setIsLoading(true);

    const { profiles, currentProfile } = useProfileStore.getState();

    if (profiles.length > 0 && currentProfile) {
      const updatedCurrentProfile = profiles.find(
        (p) => p.profileId === currentProfile.profileId
      );

      if (updatedCurrentProfile) {
        setEditName(updatedCurrentProfile.name);
        setEditAddress("");
      }
    }

    setIsLoading(false);
  };

  // API를 호출하여 프로필 목록을 새로고침하는 함수
  const refreshProfilesFromAPI = async () => {
    setRefreshing(true);

    try {
      const {
        currentProfile,
        setCurrentProfile,
        setProfiles: storeSetProfiles,
      } = useProfileStore.getState();

      // API에서 최신 프로필 목록 가져오기
      const profileList = await getProfiles("all");

      if (Array.isArray(profileList) && profileList.length > 0) {
        // API 응답을 앱 타입으로 변환 (ProfileSelect와 동일한 로직)
        const baseProfiles = profileList.map((profile: any) => ({
          profileId: Number(profile.profileId || profile.id),
          userId: Number(profile.userId),
          profileType: profile.profileType,
          name: profile.name,
          birthDate: profile.birthDate || profile.birthdate,
          gender: profile.gender?.toLowerCase(),
          avatarMediaId: profile.avatarMediaId
            ? BigInt(profile.avatarMediaId)
            : undefined,
          voiceMediaId: profile.voiceMediaId
            ? String(profile.voiceMediaId)
            : undefined,
          avatarUrl: undefined,
          createdAt: profile.createdAt || profile.createAt,
        }));

        // 각 프로필의 avatarUrl 가져오기
        const addUrlProfiles = baseProfiles.map(async (profile) => {
          let avatarUrl = undefined;
          if (profile.avatarMediaId) {
            try {
              const mediaId = String(profile.avatarMediaId);
              const mediaResponse = await getMedia({ mediaIds: mediaId });
              avatarUrl = mediaResponse?.[0]?.cdnUrl;
            } catch (error) {
              console.error(
                `Failed to fetch media URL for ID ${profile.avatarMediaId}:`,
                error
              );
            }
          }
          return { ...profile, avatarUrl };
        });

        const transformedProfiles = await Promise.all(addUrlProfiles);

        // Zustand store 업데이트
        storeSetProfiles(transformedProfiles);

        // 현재 프로필 업데이트 (최신 정보로)
        if (currentProfile) {
          const updatedCurrentProfile = transformedProfiles.find(
            (p) => p.profileId === currentProfile.profileId
          );

          if (updatedCurrentProfile) {
            setCurrentProfile(updatedCurrentProfile);
            setEditName(updatedCurrentProfile.name);
            setEditAddress("");
          }
        }
      }
    } catch (error: any) {
      console.error("프로필 목록 새로고침 오류:", error);
      Alert.alert("오류", "프로필 정보를 새로고침하는데 실패했습니다.");
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    // Pull-to-refresh 시 API에서 최신 데이터 가져오기
    await refreshProfilesFromAPI();
  };

  const handleChangeProfileImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedImage = result.assets[0];
      setIsLoading(true);

      const oldAvatarMediaId = currentProfile?.avatarMediaId;

      const formData = new FormData();
      formData.append("file", {
        uri: selectedImage.uri,
        type: "image/jpeg",
        name: "avatar.jpg",
      } as any);

      const uploadResult = await uploadMedia(formData);
      console.log("✅ 이미지 업로드 성공:", uploadResult);

      if (currentProfile) {
        await updateProfile(String(currentProfile.profileId), {
          avatarMediaId: uploadResult.mediaId.toString(),
        });

        if (oldAvatarMediaId) {
          try {
            await deleteMedia(oldAvatarMediaId.toString());
            console.log("✅ 기존 이미지 삭제 완료:", oldAvatarMediaId);
          } catch (deleteError) {
            console.error("기존 이미지 삭제 실패 (무시):", deleteError);
          }
        }

        await refreshProfilesFromAPI();
        Alert.alert("성공", "프로필 사진이 변경되었습니다.");
      }
    } catch (error: any) {
      console.error("프로필 사진 변경 오류:", error);
      Alert.alert("오류", `프로필 사진 변경에 실패했습니다.\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditName(currentProfile?.name || "");
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (!editName.trim()) {
        Alert.alert("오류", "이름을 입력해주세요.");
        return;
      }

      if (!currentProfile) return;

      setIsLoading(true);
      setShowEditModal(false);

      await updateProfile(String(currentProfile.profileId), {
        name: editName.trim(),
      });

      await refreshProfilesFromAPI();
      Alert.alert("성공", "프로필이 수정되었습니다.");
    } catch (error: any) {
      console.error("프로필 수정 오류:", error);
      Alert.alert("오류", `프로필 수정에 실패했습니다.\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToProfileSelect = () => {
    // Zustand store 비우기 -> ProfileSelect에서 최신 프로필 목록 로드
    useProfileStore.getState().setProfiles([]);

    // Root Navigator로 이동 -> ProfileNavigator의 ProfileSelect 화면으로
    const parent = navigation.getParent();
    if (parent) {
      parent.reset({
        index: 0,
        routes: [{ name: 'Profile' }],
      });
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "로그아웃",
      "정말 로그아웃 하시겠어요?",
      [
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

              // Zustand store 프로필 데이터 삭제
              useProfileStore.getState().clearProfile();

              navigation.reset({
                index: 0,
                routes: [{ name: "Auth" }],
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (showVoiceRegistration) {
    return (
      <VoiceRegistrationScreen
        onBack={() => setShowVoiceRegistration(false)}
        hasExistingVoice={!!currentProfile?.voiceMediaId}
      />
    );
  }

  if (isLoading && !showEditModal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#5B9BD5" />
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
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        >
          {/* Profile Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarContainer}>
                {currentProfile?.avatarUrl ? (
                  <Image
                    source={{ uri: currentProfile.avatarUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={32} color="#5B9BD5" />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleChangeProfileImage}
                  activeOpacity={0.8}
                >
                  <Camera size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileNameContainer}>
                <Text style={styles.cardTitle}>
                  {currentProfile?.name || "사용자"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditProfile}
                activeOpacity={0.7}
              >
                <Edit size={16} color="#5B9BD5" />
                <Text style={styles.editButtonText}>프로필 수정</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>역할</Text>
                <Text style={styles.infoValue}>
                  {currentProfile?.profileType === "parent" ? "부모" : "자녀"}
                </Text>
              </View>

              {currentProfile?.birthDate && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>생년월일</Text>
                  <Text style={styles.infoValue}>
                    {new Date(currentProfile.birthDate).toLocaleDateString(
                      "ko-KR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </Text>
                </View>
              )}
              {currentProfile?.gender && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>성별</Text>
                  <Text style={styles.infoValue}>
                    {currentProfile.gender === "male" ? "남성" : "여성"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Family Members Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.iconCircle}>
                <Users size={20} color="#6b7280" />
              </View>
              <Text style={styles.sectionTitle}>우리 가족들</Text>
            </View>

            <View style={styles.familyList}>
              {familyMembers.length === 0 ? (
                <Text style={styles.emptyText}>
                  다른 가족 구성원이 없습니다
                </Text>
              ) : (
                familyMembers.map((member) => (
                  <View key={member.profileId} style={styles.familyItem}>
                    {member.avatarUrl ? (
                      <Image
                        source={{ uri: member.avatarUrl }}
                        style={styles.familyAvatarImage}
                      />
                    ) : (
                      <Text style={styles.familyAvatar}>
                        {member.avatarUrl}
                      </Text>
                    )}
                    <View style={styles.familyInfo}>
                      <Text style={styles.familyName}>{member.name}</Text>
                      <Text style={styles.familyDetail}>
                        {member.birthDate}
                        {calculateAge(member.birthDate) !== null && ` (${calculateAge(member.birthDate)}세)`}
                      </Text>
                      <Text style={styles.familyDetail}>
                        {member.profileType === "child"
                          ? member.gender === "female"
                            ? "딸"
                            : "아들"
                          : member.gender === "female"
                            ? "엄마"
                            : "아빠"}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Voice Registration Card */}
          <LinearGradient
            colors={["#5B9BD5", "#4A8BC2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.voiceCard}
          >
            <View style={styles.voiceHeader}>
              <View style={styles.voiceIconCircle}>
                <Mic size={24} color="#FFFFFF" />
              </View>
              <View style={styles.voiceTextContainer}>
                <Text style={styles.voiceTitle}>AI 음성 설정</Text>
                <Text style={styles.voiceSubtitle}>
                  나만의 목소리로 AI가 답변해요
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.voiceButton}
              onPress={() => setShowVoiceRegistration(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.voiceButtonText}>
                {currentProfile?.voiceMediaId ? '음성 수정하기' : '음성 등록하기'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Profile Select & Logout Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleBackToProfileSelect}
              activeOpacity={0.7}
            >
              <UserCircle size={20} color="#6B7280" />
              <Text style={styles.actionButtonText}>프로필 변경</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogOut size={20} color="#6B7280" />
              <Text style={styles.actionButtonText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
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
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>이름</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="이름을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>주소</Text>
                <TextInput
                  style={styles.input}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder="주소를 입력하세요"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
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
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
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
  avatarContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: -4,
    right: "35%",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#5B9BD5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
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
    color: "#5B9BD5",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 16,
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
  voiceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  voiceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  voiceIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  voiceTextContainer: {
    flex: 1,
  },
  voiceTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  voiceSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
  },
  voiceButton: {
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5B9BD5",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonText: {
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  modalBody: {
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
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
  modalFooter: {
    flexDirection: "row",
    gap: 8,
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
    backgroundColor: "#2563eb",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
