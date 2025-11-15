/**
 * 부모 프로필 화면
 *
 * 주요 기능:
 * - 프로필 정보 표시
 * - 우리 가족들 목록
 * - AI 음성 설정 (음성 등록)
 * - 로그아웃
 *
 * 디자인:
 * - 화이트 배경
 * - 그레이 카드 레이아웃
 * - 블루 아이콘 (#5B9BD5)
 * - 음성 설정은 그라데이션 카드
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, User, Users, Mic, Camera } from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import { RefreshableScrollView } from '../../../design/components/RefreshableScrollView';
import VoiceRegistrationScreen from './VoiceRegistration';
import { getProfiles, updateProfile } from '../../../api/profiles';
import { uploadMedia, deleteMedia } from '../../../api/media';
import { logout } from '../../../api/auth';

interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  profileType: string;
  birthDate?: string;
  gender?: string;
  avatarUrl?: string;
  avatarMediaId?: number;
}

export default function ParentProfileScreen() {
  const navigation = useNavigation<any>();
  const [showVoiceRegistration, setShowVoiceRegistration] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<FamilyMember | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 프로필 데이터 로드
  useFocusEffect(
    React.useCallback(() => {
      loadProfiles();
    }, [])
  );

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const profileList = await getProfiles();
      console.log('📥 프로필 API 응답:', JSON.stringify(profileList, null, 2));

      if (Array.isArray(profileList) && profileList.length > 0) {
        const transformedProfiles = profileList.map((profile: any) => ({
          id: profile.profileId || profile.id,
          name: profile.name,
          avatar: profile.avatar || '👤',
          profileType: profile.profileType?.toLowerCase() || 'child',
          birthDate: profile.birthDate || profile.birthdate,
          gender: profile.gender?.toLowerCase(),
          avatarUrl: profile.avatarUrl,
          avatarMediaId: profile.avatarMediaId,
        }));
        console.log('🔄 변환된 프로필:', JSON.stringify(transformedProfiles, null, 2));

        // 현재 프로필은 부모 프로필 중 첫 번째 (실제로는 토큰에서 profileId로 찾아야 함)
        const parentProfile = transformedProfiles.find(
          (p: FamilyMember) => p.profileType === 'parent'
        );
        setCurrentProfile(parentProfile || transformedProfiles[0]);

        // 가족 구성원은 현재 프로필 제외한 나머지
        const others = transformedProfiles.filter(
          (p: FamilyMember) => p.id !== (parentProfile?.id || transformedProfiles[0]?.id)
        );
        setFamilyMembers(others);
      }
    } catch (error: any) {
      console.error('프로필 로드 오류:', error);
      Alert.alert('오류', '프로필 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfiles();
  };

  const handleChangeProfileImage = async () => {
    try {
      // 이미지 선택 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
        return;
      }

      // 이미지 선택
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

      // 기존 이미지 ID 저장 (삭제용)
      const oldAvatarMediaId = currentProfile?.avatarMediaId;

      // 1. 이미지 업로드
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      const uploadResult = await uploadMedia(formData);
      console.log('✅ 이미지 업로드 성공:', uploadResult);

      // 2. 프로필 업데이트
      if (currentProfile) {
        await updateProfile(currentProfile.id, {
          avatarMediaId: uploadResult.mediaId.toString(),
        });

        // 3. 기존 이미지 삭제 (있는 경우)
        if (oldAvatarMediaId) {
          try {
            await deleteMedia(oldAvatarMediaId.toString());
            console.log('✅ 기존 이미지 삭제 완료:', oldAvatarMediaId);
          } catch (deleteError) {
            console.error('기존 이미지 삭제 실패 (무시):', deleteError);
            // 삭제 실패해도 프로필 업데이트는 성공했으므로 무시
          }
        }

        // 4. 프로필 정보 새로고침
        await loadProfiles();
        Alert.alert('성공', '프로필 사진이 변경되었습니다.');
      }
    } catch (error: any) {
      console.error('프로필 사진 변경 오류:', error);
      console.error('에러 상세:', JSON.stringify(error, null, 2));
      console.error('에러 메시지:', error.message);
      console.error('에러 응답:', error.response);
      Alert.alert('오류', `프로필 사진 변경에 실패했습니다.\n${error.message}`);
    } finally {
      setIsLoading(false);
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
              await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId']);
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

  if (showVoiceRegistration) {
    return (
      <VoiceRegistrationScreen
        onBack={() => setShowVoiceRegistration(false)}
      />
    );
  }

  if (isLoading) {
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
    <SafeAreaView style={styles.safeArea}>
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
            <Text style={styles.cardTitle}>{currentProfile?.name || '사용자'}</Text>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>역할</Text>
              <Text style={styles.infoValue}>
                {currentProfile?.profileType === 'parent' ? '부모' : '자녀'}
              </Text>
            </View>
            {currentProfile?.birthDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>생년월일</Text>
                <Text style={styles.infoValue}>
                  {new Date(currentProfile.birthDate).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            )}
            {currentProfile?.gender && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>성별</Text>
                <Text style={styles.infoValue}>
                  {currentProfile.gender === 'male' ? '남성' : '여성'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Family Members Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Users size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.cardTitle}>우리 가족들</Text>
          </View>

          <View style={styles.familyList}>
            {familyMembers.length === 0 ? (
              <Text style={styles.emptyText}>다른 가족 구성원이 없습니다</Text>
            ) : (
              familyMembers.map((member) => (
                <View key={member.id} style={styles.familyItem}>
                  {member.avatarUrl ? (
                    <Image
                      source={{ uri: member.avatarUrl }}
                      style={styles.familyAvatarImage}
                    />
                  ) : (
                    <Text style={styles.familyAvatar}>{member.avatar}</Text>
                  )}
                  <View style={styles.familyInfo}>
                    <Text style={styles.familyName}>{member.name}</Text>
                    <Text style={styles.familyDetail}>
                      {member.profileType === 'parent' ? '부모' : '자녀'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Voice Registration Card */}
        <LinearGradient
          colors={['#5B9BD5', '#4A8BC2']}
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
            <Text style={styles.voiceButtonText}>음성 등록하기</Text>
          </TouchableOpacity>
        </LinearGradient>

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
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
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
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5B9BD5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...shadows.sm,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5B9BD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  infoList: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    ...typography.body1,
    color: '#6B7280',
  },
  infoValue: {
    ...typography.body1,
    color: '#111827',
    fontWeight: '600',
  },
  familyList: {
    gap: spacing.sm,
  },
  familyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
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
    color: '#111827',
    fontWeight: '600',
  },
  familyDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  voiceCard: {
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  voiceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceTextContainer: {
    flex: 1,
  },
  voiceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  voiceSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  voiceButton: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B9BD5',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  logoutText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
