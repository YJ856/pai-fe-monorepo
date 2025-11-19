/**
 * useChatImagePicker 훅
 *
 * 채팅에서 이미지 선택 기능
 *
 * 주요 기능:
 * - 갤러리에서 이미지 선택
 * - 권한 처리
 *
 * 반환값:
 * - handleImagePick
 */

import * as ImagePicker from 'expo-image-picker';

export function useChatImagePicker(setCurrentImage: (uri: string | null) => void) {
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCurrentImage(result.assets[0].uri);
    }
  };

  return {
    handleImagePick,
  };
}
