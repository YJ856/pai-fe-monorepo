/**
 * useProfileActions 훅
 *
 * 프로필 관련 액션 (프로필 변경, 로그아웃)
 *
 * 주요 기능:
 * - 프로필 선택 화면으로 이동
 * - 로그아웃 처리 (토큰 삭제, store 초기화)
 *
 * API:
 * - POST /api/auth/logout (api/auth.ts)
 *
 * 반환값:
 * - handleBackToProfileSelect
 * - handleLogout
 */

import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../../../api/auth';
import { useProfileStore } from '../../../../store/useProfileStore';

export function useProfileActions() {
  const navigation = useNavigation<any>();

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
      '로그아웃',
      '정말 로그아웃 하시겠어요?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              const accessToken = await AsyncStorage.getItem('accessToken');
              if (accessToken) {
                await logout();
              }
            } catch (error) {
              console.log('Logout API error:', error);
            } finally {
              await AsyncStorage.multiRemove([
                'accessToken',
                'refreshToken',
                'userId',
              ]);

              // Zustand store 프로필 데이터 삭제
              useProfileStore.getState().clearProfile();

              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return {
    handleBackToProfileSelect,
    handleLogout,
  };
}
