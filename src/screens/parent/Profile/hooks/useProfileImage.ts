/**
 * useProfileImage 훅
 *
 * 프로필 이미지 변경 기능
 *
 * 주요 기능:
 * - 갤러리에서 이미지 선택
 * - 이미지 업로드
 * - 기존 이미지 삭제
 * - 프로필 업데이트
 *
 * API:
 * - POST /api/media (api/media.ts)
 * - DELETE /api/media/:id (api/media.ts)
 * - PATCH /api/profiles/:id (api/profiles.ts)
 *
 * 반환값:
 * - handleChangeProfileImage
 */

import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadMedia, deleteMedia, updateProfile } from '../../../../api';

export function useProfileImage(
  currentProfile: any,
  setIsLoading: (loading: boolean) => void,
  refreshProfilesFromAPI: () => Promise<void>
) {
  const handleChangeProfileImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
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
      formData.append('file', {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      const uploadResult = await uploadMedia(formData);
      console.log('✅ 이미지 업로드 성공:', uploadResult);

      if (currentProfile) {
        await updateProfile(String(currentProfile.profileId), {
          avatarMediaId: uploadResult.mediaId.toString(),
        });

        if (oldAvatarMediaId) {
          try {
            await deleteMedia(oldAvatarMediaId.toString());
            console.log('✅ 기존 이미지 삭제 완료:', oldAvatarMediaId);
          } catch (deleteError) {
            console.error('기존 이미지 삭제 실패 (무시):', deleteError);
          }
        }

        await refreshProfilesFromAPI();
        Alert.alert('성공', '프로필 사진이 변경되었습니다.');
      }
    } catch (error: any) {
      console.error('프로필 사진 변경 오류:', error);
      Alert.alert('오류', `프로필 사진 변경에 실패했습니다.\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleChangeProfileImage,
  };
}
