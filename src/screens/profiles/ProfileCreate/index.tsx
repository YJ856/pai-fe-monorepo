/**
 * ProfileCreation 화면 (Design_v2 기반)
 *
 * 주요 기능:
 * - 프로필 타입 선택 (부모/자녀)
 * - 이름, 생년월일, 성별 입력
 * - 아바타 이미지 선택
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

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Card, CardContent } from "../../../design/components/Card";
import { Tab } from "../../../design/components/Tab";
import { Input } from "../../../design/components/Input";
import { Label } from "../../../design/components/Label";
import { Button } from "../../../design/components/Button";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../../../design/tokens";
import { useProfileForm } from "./hooks/useProfileForm";
import { useImagePicker } from "./hooks/useImagePicker";
import { useProfileCreate } from "./hooks/useProfileCreate";

export default function ProfileCreateScreen() {
  // 폼 관리 Hook
  const {
    profileType,
    setProfileType,
    name,
    setName,
    birthdate,
    setBirthdate,
    gender,
    setGender,
    pin,
    setPin,
    confirmPin,
    setConfirmPin,
    errors,
    setErrors,
    formatBirthdate,
    validateForm,
  } = useProfileForm();

  // 이미지 선택 Hook
  const { avatarImage, setAvatarImage, pickImage } = useImagePicker();

  // 프로필 생성 Hook
  const { isLoading, handleSubmit, handleCancel } = useProfileCreate(
    profileType,
    name,
    birthdate,
    gender,
    avatarImage,
    pin,
    validateForm
  );

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
                    onTabChange={(key) => setProfileType(key as any)}
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

  cameraIcon: {
    fontSize: 52,
    marginBottom: spacing.xs,
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
