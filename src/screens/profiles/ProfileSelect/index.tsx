/**
 * 프로필 선택 화면
 *
 * 주요 기능:
 * - 가족 구성원 프로필 그리드 표시
 * - 자녀 프로필: 직접 선택
 * - 부모 프로필: PIN 입력 모달
 * - 프로필 생성 버튼
 *
 * API:
 * - GET /api/profiles (api/profiles.ts)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Plus } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../../../design/components/Input';
import { Button } from '../../../design/components/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import { Profile } from '../../../shared/types';
import { ProfileStackParamList } from '../../../app/navigation/ProfileNavigator';

// Mock data
const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    profileType: 'parent',
    name: '엄마',
    birthdate: '1985-03-15',
    gender: 'female',
    avatar: '👩',
    pin: '1234',
  },
  {
    id: '2',
    profileType: 'parent',
    name: '아빠',
    birthdate: '1983-07-22',
    gender: 'male',
    avatar: '👨',
    pin: '5678',
  },
  {
    id: '3',
    profileType: 'child',
    name: '지우',
    birthdate: '2018-05-10',
    gender: 'female',
    avatar: '👧',
  },
  {
    id: '4',
    profileType: 'child',
    name: '민준',
    birthdate: '2020-11-03',
    gender: 'male',
    avatar: '👦',
  },
];

type ProfileSelectNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'ProfileSelect'
>;

export default function ProfileSelectScreen() {
  const navigation = useNavigation<ProfileSelectNavigationProp>();
  const [profiles] = useState<Profile[]>(MOCK_PROFILES);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleProfileClick = (profile: Profile) => {
    if (profile.profileType === 'parent') {
      setSelectedProfile(profile);
      setShowPinModal(true);
      setPin('');
      setPinError('');
    } else {
      // TODO: Navigate to ChildApp with profile
      console.log('Selected child profile:', profile);
    }
  };

  const handlePinSubmit = () => {
    if (selectedProfile && pin === selectedProfile.pin) {
      setShowPinModal(false);
      // TODO: Navigate to ParentApp with profile
      console.log('Selected parent profile:', selectedProfile);
    } else {
      setPinError('PIN이 일치하지 않습니다.');
    }
  };

  const handleCreateProfile = () => {
    navigation.navigate('ProfileCreate');
  };

  const renderProfileCard = ({ item }: { item: Profile }) => {
    const isParent = item.profileType === 'parent';

    return (
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => handleProfileClick(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{item.avatar}</Text>
          {isParent && (
            <View style={styles.lockBadge}>
              <Lock size={12} color={colors.text.inverse} />
            </View>
          )}
        </View>
        <Text style={styles.profileName}>{item.name}</Text>
        <Text style={styles.profileType}>
          {isParent ? '부모' : '자녀'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.auth.from, colors.auth.to]}
        style={styles.background}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.mascotPlaceholder} />
            </View>
            <Text style={styles.title}>PAI</Text>
            <Text style={styles.subtitle}>프로필을 선택하세요</Text>
          </View>

          {/* Profiles Grid */}
          <View style={styles.card}>
            <FlatList
              data={profiles}
              renderItem={renderProfileCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.gridContent}
            />

            {/* Create Profile Button */}
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateProfile}
              activeOpacity={0.7}
            >
              <View style={styles.createIcon}>
                <Plus size={24} color={colors.primary[500]} />
              </View>
              <Text style={styles.createText}>프로필 생성</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PIN Modal */}
        <Modal
          visible={showPinModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPinModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Lock size={32} color={colors.primary[500]} />
                <Text style={styles.modalTitle}>PIN 입력</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedProfile?.name}님의 PIN을 입력하세요
                </Text>
              </View>

              <Input
                placeholder="PIN 입력"
                value={pin}
                onChangeText={setPin}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                error={pinError}
              />

              <View style={styles.modalButtons}>
                <Button
                  variant="outline"
                  onPress={() => setShowPinModal(false)}
                  style={{ flex: 1 }}
                >
                  취소
                </Button>
                <View style={{ width: spacing.sm }} />
                <Button
                  variant="primary"
                  onPress={handlePinSubmit}
                  style={{ flex: 1 }}
                >
                  확인
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.sm,
  },
  mascotPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.full,
  },
  title: {
    ...typography.h1,
    fontSize: 36,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 24,
    padding: spacing.lg,
    ...shadows.lg,
  },
  gridContent: {
    paddingBottom: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  profileCard: {
    flex: 0.48,
    aspectRatio: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatar: {
    fontSize: 48,
  },
  lockBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  profileType: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
  },
  createIcon: {
    marginRight: spacing.sm,
  },
  createText: {
    ...typography.button,
    color: colors.primary[500],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.lg,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});
