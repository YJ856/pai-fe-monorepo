/**
 * useProfileEdit 훅
 *
 * 프로필 정보 수정 기능
 *
 * 주요 기능:
 * - 프로필 수정 모달 관리
 * - 이름, 주소 입력 상태 관리
 * - 프로필 업데이트 API 호출
 *
 * API:
 * - PATCH /api/profiles/:id (api/profiles.ts)
 *
 * 반환값:
 * - showEditModal, setShowEditModal
 * - editName, setEditName
 * - editAddress, setEditAddress
 * - handleEditProfile
 * - handleSaveProfile
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { updateProfile } from '../../../../api/profiles';

export function useProfileEdit(
  currentProfile: any,
  setIsLoading: (loading: boolean) => void,
  refreshProfilesFromAPI: () => Promise<void>
) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const handleEditProfile = () => {
    setEditName(currentProfile?.name || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (!editName.trim()) {
        Alert.alert('오류', '이름을 입력해주세요.');
        return;
      }

      if (!currentProfile) return;

      setIsLoading(true);
      setShowEditModal(false);

      await updateProfile(String(currentProfile.profileId), {
        name: editName.trim(),
      });

      await refreshProfilesFromAPI();
      Alert.alert('성공', '프로필이 수정되었습니다.');
    } catch (error: any) {
      console.error('프로필 수정 오류:', error);
      Alert.alert('오류', `프로필 수정에 실패했습니다.\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    showEditModal,
    setShowEditModal,
    editName,
    setEditName,
    editAddress,
    setEditAddress,
    handleEditProfile,
    handleSaveProfile,
  };
}
