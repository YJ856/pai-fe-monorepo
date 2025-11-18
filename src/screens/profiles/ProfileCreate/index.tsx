/**
 * ProfileCreation 화면 (Design_v2 기반)
 *
 * 주요 기능:
 * - 프로필 타입 선택 (부모/자녀)
 * - 이름, 생년월일, 성별 입력
 * - 아바타 이모지 선택
 * - 부모 프로필: PIN 설정
 *
 * 디자인:
 * - background.png 배경
 * - rounded-3xl 카드 (24px)
 * - shadow-2xl
 * - Tab 컴포넌트로 프로필 타입 선택
 *
 * API:
 * - POST /api/profiles (api/profiles.ts)
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Card, CardContent } from "../../../design/components/Card";
import { Tab } from "../../../design/components/Tab";
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
import { ProfileType, Gender } from "../../../shared/types";
import { createProfile, updateProfile } from "../../../api/profiles";
import { uploadMedia } from "../../../api/media";
import { useNavigation } from "@react-navigation/native";
import { useProfileStore } from "../../../store/useProfileStore";

export default function ProfileCreateScreen() {
  const navigation = useNavigation<any>();
  const [profileType, setProfileType] = useState<ProfileType>("child");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    Alert.alert("프로필 사진 선택", "사진을 선택하는 방법을 골라주세요", [
      {
        text: "카메라로 촬영",
        onPress: () => takePhoto(),
      },
      {
        text: "갤러리에서 선택",
        onPress: () => pickFromGallery(),
      },
      {
        text: "취소",
        style: "cancel",
      },
    ]);
  };

  const takePhoto = async () => {
    try {
      // 카메라 권한 요청
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "권한 필요",
          "사진을 촬영하려면 카메라 접근 권한이 필요합니다.",
          [{ text: "확인" }]
        );
        return;
      }

      // 카메라로 사진 촬영
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("사진 촬영 오류:", error);
      Alert.alert("오류", "사진을 촬영하는 중 오류가 발생했습니다.");
    }
  };

  const pickFromGallery = async () => {
    try {
      // 갤러리 권한 요청
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "권한 필요",
          "사진을 선택하려면 갤러리 접근 권한이 필요합니다.",
          [{ text: "확인" }]
        );
        return;
      }

      // 이미지 선택 (사진만 가능)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("이미지 선택 오류:", error);
      Alert.alert("오류", "이미지를 선택하는 중 오류가 발생했습니다.");
    }
  };

  const formatBirthdate = (text: string) => {
    // 숫자만 추출
    const numbers = text.replace(/[^\d]/g, "");

    // 최대 8자리까지만
    const limitedNumbers = numbers.slice(0, 8);

    // YYYY-MM-DD 형식으로 포맷팅
    let formatted = limitedNumbers;
    if (limitedNumbers.length >= 7) {
      // 8자리 이상: YYYY-MM-DD
      formatted = `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(
        4,
        6
      )}-${limitedNumbers.slice(6)}`;
    } else if (limitedNumbers.length >= 5) {
      // 6~7자리: YYYY-MM-
      formatted = `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4)}`;
    } else if (limitedNumbers.length >= 4) {
      // 4~5자리: YYYY-
      formatted = `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4)}`;
    }

    return formatted;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "이름을 입력해주세요";
    }

    if (!birthdate.trim()) {
      newErrors.birthdate = "생년월일을 입력해주세요";
    } else if (
      birthdate.length !== 10 ||
      !birthdate.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      newErrors.birthdate = "올바른 날짜 형식을 입력해주세요 (YYYY-MM-DD)";
    }

    if (profileType === "parent") {
      if (!pin || pin.length !== 4) {
        newErrors.pin = "4자리 PIN을 입력해주세요";
      }
      if (pin !== confirmPin) {
        newErrors.confirmPin = "PIN이 일치하지 않습니다";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 1단계: 프로필 먼저 생성 (이미지 없이)
      const profileData: any = {
        profileType,
        name: name.trim(),
        birthDate: birthdate.trim() || undefined,
        gender: gender,
      };

      // 부모 프로필인 경우만 pin 추가
      if (profileType === "parent" && pin) {
        profileData.pin = pin;
      }

      const createdProfile = await createProfile(profileData);

      console.log("프로필 생성 완료:", createdProfile);

      // 2단계: 이미지가 있으면 업로드하고 프로필 업데이트
      if (avatarImage) {
        try {
          // 프로필 ID 추출 (백엔드 응답에 따라 profileId 또는 id)
          const profileId = createdProfile.profileId || createdProfile.id;

          if (!profileId) {
            throw new Error(
              "프로필 ID를 찾을 수 없습니다. createdProfile: " +
                JSON.stringify(createdProfile)
            );
          }

          console.log("이미지 업로드 시작:");
          console.log("- createdProfile 전체:", createdProfile);
          console.log("- 추출된 프로필 ID:", profileId);
          console.log("- 이미지 URI:", avatarImage);

          // FormData 생성 (파일만 전송)
          const formData = new FormData();
          formData.append("file", {
            uri: avatarImage,
            type: "image/jpeg",
            name: "avatar.jpg",
          } as any);

          // 미디어 업로드
          const uploadResult = await uploadMedia(formData);
          console.log("이미지 업로드 결과:", uploadResult);

          const mediaId = uploadResult.mediaId;
          console.log("추출된 mediaId:", mediaId);

          // 3단계: 프로필에 이미지 연결
          const updatedProfile = await updateProfile(profileId, {
            avatarMediaId: mediaId,
          });

          console.log("프로필 업데이트 완료:", updatedProfile);
        } catch (uploadError: any) {
          console.error("이미지 업로드 오류:", uploadError);
          console.error("에러 상세:", {
            message: uploadError.message,
            response: uploadError.response?.data,
            status: uploadError.response?.status,
          });
          // 이미지 업로드 실패해도 프로필은 생성되었으므로 경고만 표시
          Alert.alert(
            "경고",
            "프로필은 생성되었으나 이미지 업로드에 실패했습니다.\n나중에 프로필 편집에서 이미지를 추가할 수 있습니다.",
            [
              {
                text: "확인",
                onPress: () => {
                  // Zustand store 비우기 -> ProfileSelect에서 API 재호출하도록
                  useProfileStore.getState().setProfiles([]);
                  navigation.goBack();
                },
              },
            ]
          );
          return;
        }
      }

      // 성공 메시지
      Alert.alert("성공", "프로필이 생성되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            // Zustand store 비우기 -> ProfileSelect에서 API 재호출하도록
            useProfileStore.getState().setProfiles([]);
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error("프로필 생성 오류:", error);
      Alert.alert(
        "오류",
        error.response?.data?.message || "프로필 생성 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert("취소", "프로필 생성을 취소하시겠습니까?", [
      {
        text: "계속 작성",
        style: "cancel",
      },
      {
        text: "취소",
        style: "destructive",
        onPress: () => navigation.goBack(),
      },
    ]);
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
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Image
                source={require("../../../assets/images/mascot.png")}
                style={styles.mascot}
                resizeMode="contain"
              />
              <Text style={styles.title}>프로필 생성</Text>
              <Text style={styles.subtitle}>
                새로운 가족 구성원을 추가해주세요
              </Text>
            </View>

            {/* Form Card */}
            <Card style={styles.card}>
              <CardContent style={styles.cardContent}>
                {/* Profile Type Selection */}
                <View style={styles.section}>
                  <Label>프로필 유형</Label>
                  <Tab
                    tabs={[
                      { key: "child", label: "자녀" },
                      { key: "parent", label: "부모" },
                    ]}
                    activeTab={profileType}
                    onTabChange={(key) => setProfileType(key as ProfileType)}
                    variant="full"
                    gradient={
                      profileType === "child"
                        ? { from: "#FF6B9D", to: "#FFA06B" }
                        : colors.parent
                    }
                  />
                </View>

                {/* Name */}
                <View style={styles.section}>
                  <Label>이름</Label>
                  <Input
                    placeholder="이름 입력"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      setErrors({ ...errors, name: "" });
                    }}
                  />
                  {errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                {/* Birthdate */}
                <View style={styles.section}>
                  <Label>생년월일</Label>
                  <Input
                    placeholder="YYYY-MM-DD"
                    value={birthdate}
                    onChangeText={(text) => {
                      const formatted = formatBirthdate(text);
                      setBirthdate(formatted);
                      setErrors({ ...errors, birthdate: "" });
                    }}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                  {errors.birthdate && (
                    <Text style={styles.errorText}>{errors.birthdate}</Text>
                  )}
                </View>

                {/* Gender */}
                <View style={styles.section}>
                  <Label>성별</Label>
                  <View style={styles.genderButtons}>
                    <Button
                      variant={gender === "male" ? "secondary" : "outline"}
                      onPress={() => setGender("male")}
                      style={styles.genderButton}
                    >
                      남성
                    </Button>
                    <Button
                      variant={gender === "female" ? "secondary" : "outline"}
                      onPress={() => setGender("female")}
                      style={styles.genderButton}
                    >
                      여성
                    </Button>
                  </View>
                </View>

                {/* Avatar Selection */}
                <View style={styles.section}>
                  <Label>프로필 사진</Label>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatarWrapper}>
                      <TouchableOpacity
                        style={styles.imagePickerButton}
                        onPress={pickImage}
                        activeOpacity={0.8}
                      >
                        {avatarImage ? (
                          <Image
                            source={{ uri: avatarImage }}
                            style={styles.avatarPreview}
                          />
                        ) : (
                          <LinearGradient
                            colors={
                              profileType === "child"
                                ? ["#FF6B9D", "#FFA06B"]
                                : [colors.parent.from, colors.parent.to]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.imagePlaceholder}
                          >
                            <View style={styles.placeholderContent}>
                              <Text style={styles.cameraIcon}>📷</Text>
                              <Text style={styles.imagePlaceholderText}>
                                사진 선택
                              </Text>
                            </View>
                          </LinearGradient>
                        )}
                      </TouchableOpacity>
                      {avatarImage && (
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => setAvatarImage(null)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.removeImageIcon}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.avatarHint}>
                      {avatarImage
                        ? "사진을 변경하려면 탭하세요"
                        : "사진을 선택하지 않으면 기본 이미지가 사용됩니다"}
                    </Text>
                  </View>
                  {errors.avatar && (
                    <Text style={styles.errorText}>{errors.avatar}</Text>
                  )}
                </View>

                {/* PIN (for parent only) */}
                {profileType === "parent" && (
                  <>
                    <View style={styles.section}>
                      <Label>PIN 설정</Label>
                      <Input
                        placeholder="4자리 PIN"
                        value={pin}
                        onChangeText={(text) => {
                          setPin(text);
                          setErrors({ ...errors, pin: "" });
                        }}
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={4}
                        style={styles.pinInput}
                      />
                      {errors.pin && (
                        <Text style={styles.errorText}>{errors.pin}</Text>
                      )}
                    </View>

                    <View style={styles.section}>
                      <Label>PIN 확인</Label>
                      <Input
                        placeholder="PIN 재입력"
                        value={confirmPin}
                        onChangeText={(text) => {
                          setConfirmPin(text);
                          setErrors({ ...errors, confirmPin: "" });
                        }}
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={4}
                        style={styles.pinInput}
                      />
                      {errors.confirmPin && (
                        <Text style={styles.errorText}>
                          {errors.confirmPin}
                        </Text>
                      )}
                    </View>
                  </>
                )}

                {/* Action Buttons */}
                <View style={styles.buttons}>
                  <Button
                    variant="outline"
                    onPress={handleCancel}
                    style={styles.actionButton}
                  >
                    취소
                  </Button>
                  <Button
                    variant="gradient"
                    gradient={
                      profileType === "child"
                        ? { from: "#FF6B9D", to: "#FFA06B" }
                        : colors.parent
                    }
                    onPress={handleSubmit}
                    style={styles.actionButton}
                    disabled={isLoading}
                  >
                    {isLoading ? "생성 중..." : "생성"}
                  </Button>
                </View>
              </CardContent>
            </Card>
          </ScrollView>
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
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },

  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },

  mascot: {
    width: 100,
    height: 100,
    marginBottom: spacing.md,
  },

  title: {
    ...typography.h1,
    fontSize: 32,
    fontWeight: "600",
    color: colors.primaryForeground,
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.body1,
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },

  card: {
    borderRadius: borderRadius["3xl"], // 24px
    ...shadows["2xl"],
  },

  cardContent: {
    padding: spacing.xl,
  },

  section: {
    marginBottom: spacing.lg,
  },

  genderButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  genderButton: {
    flex: 1,
  },

  avatarContainer: {
    alignItems: "center",
    gap: spacing.md,
  },

  avatarWrapper: {
    position: "relative",
  },

  imagePickerButton: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.full,
    overflow: "hidden",
    ...shadows.xl,
  },

  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.destructive,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.lg,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  removeImageIcon: {
    fontSize: 18,
    color: colors.primaryForeground,
    fontWeight: "700",
  },

  avatarPreview: {
    width: "100%",
    height: "100%",
  },

  defaultImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.full,
  },

  cameraIcon: {
    fontSize: 52,
    marginBottom: spacing.xs,
  },

  overlayText: {
    ...typography.body2,
    fontSize: 15,
    color: colors.primaryForeground,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderContent: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: "80%",
    height: "80%",
    borderRadius: borderRadius.full,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderStyle: "dashed",
  },

  imagePlaceholderText: {
    ...typography.body2,
    fontSize: 15,
    color: colors.primaryForeground,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  avatarHint: {
    ...typography.body2,
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: "center",
    marginTop: -spacing.xs,
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

  buttons: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  actionButton: {
    flex: 1,
  },
});
