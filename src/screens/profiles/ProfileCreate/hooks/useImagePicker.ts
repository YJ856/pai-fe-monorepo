/**
 * useImagePicker 훅
 *
 * 이미지 선택 및 권한 처리
 *
 * 주요 기능:
 * - 카메라/갤러리 권한 요청
 * - 이미지 선택 모달 표시
 * - 카메라로 사진 촬영
 * - 갤러리에서 사진 선택
 *
 * 반환값:
 * - avatarImage, setAvatarImage
 * - pickImage
 */

import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

export function useImagePicker() {
  const [avatarImage, setAvatarImage] = useState<string | null>(null);

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

  return {
    avatarImage,
    setAvatarImage,
    pickImage,
  };
}
