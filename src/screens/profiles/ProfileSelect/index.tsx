/**
 * ProfileSelection 화면 (Design_v2 기반)
 *
 * 주요 기능:
 * - 가족 구성원 프로필 그리드 표시
 * - 자녀 프로필: 직접 선택
 * - 부모 프로필: PIN 입력 모달
 * - 프로필 생성 버튼
 *
 * 디자인:
 * - background.png 배경
 * - rounded-3xl 카드 (24px)
 * - shadow-2xl
 * - Auth gradient (Navy → Blue)
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
  ImageBackground,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent } from '../../../design/components/Card';
import { Input } from '../../../design/components/Input';
import { Label } from '../../../design/components/Label';
import { Button } from '../../../design/components/Button';
import { Avatar } from '../../../design/components/Avatar';
import { colors, spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import { Profile } from '../../../shared/types';

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

export default function ProfileSelectScreen() {
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
    // TODO: Navigate to ProfileCreate screen
    console.log('Create new profile');
  };

  const renderProfileCard = ({ item }: { item: Profile }) => {
    const isParent = item.profileType === 'parent';

    return (
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => handleProfileClick(item)}
        activeOpacity={0.8}
      >
        <Avatar emoji={item.avatar} size="lg" />
        {isParent && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
        <Text style={styles.profileName}>{item.name}</Text>
        <Text style={styles.profileType}>
          {isParent ? '부모' : '자녀'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.5)']}
        style={styles.overlay}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/images/mascot.png')}
              style={styles.mascot}
              resizeMode="contain"
            />
            <Text style={styles.title}>누구세요?</Text>
            <Text style={styles.subtitle}>프로필을 선택해주세요</Text>
          </View>

          {/* Profiles Card */}
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              <FlatList
                data={profiles}
                renderItem={renderProfileCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.gridContent}
                scrollEnabled={false}
              />

              {/* Create Profile Button */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateProfile}
                activeOpacity={0.8}
              >
                <Text style={styles.createIcon}>➕</Text>
                <Text style={styles.createText}>프로필 생성</Text>
              </TouchableOpacity>
            </CardContent>
          </Card>
        </View>

        {/* PIN Modal */}
        <Modal
          visible={showPinModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPinModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <CardContent style={styles.modalContent}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.lockIconLarge}>🔒</Text>
                  <Text style={styles.modalTitle}>PIN 입력</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedProfile?.name}님의 PIN을 입력하세요
                  </Text>
                </View>

                {/* PIN Input */}
                <View style={styles.inputGroup}>
                  <Label>PIN</Label>
                  <Input
                    placeholder="4자리 PIN"
                    value={pin}
                    onChangeText={setPin}
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={4}
                    style={styles.pinInput}
                  />
                  {pinError && (
                    <Text style={styles.errorText}>{pinError}</Text>
                  )}
                </View>

                {/* Modal Buttons */}
                <View style={styles.modalButtons}>
                  <Button
                    variant="outline"
                    onPress={() => setShowPinModal(false)}
                    style={styles.modalButton}
                  >
                    취소
                  </Button>
                  <Button
                    variant="gradient"
                    gradient={colors.auth}
                    onPress={handlePinSubmit}
                    style={styles.modalButton}
                  >
                    확인
                  </Button>
                </View>
              </CardContent>
            </Card>
          </View>
        </Modal>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
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

  mascot: {
    width: 120,
    height: 120,
    marginBottom: spacing.md,
  },

  title: {
    ...typography.h1,
    fontSize: 36,
    fontWeight: '600',
    color: colors.primaryForeground,
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.body1,
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  card: {
    borderRadius: borderRadius['3xl'], // 24px (rounded-3xl)
    ...shadows['2xl'],
  },

  cardContent: {
    padding: spacing.xl,
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
    backgroundColor: colors.muted,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.sm,
  },

  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lockIcon: {
    fontSize: 12,
  },

  profileName: {
    ...typography.h4,
    fontSize: 18,
    color: colors.foreground,
    marginTop: spacing.sm,
    marginBottom: spacing.xs - 2,
  },

  profileType: {
    ...typography.body2,
    fontSize: 14,
    color: colors.mutedForeground,
  },

  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },

  createIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },

  createText: {
    ...typography.button,
    color: colors.foreground,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },

  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    ...shadows.xl,
  },

  modalContent: {
    padding: spacing.xl,
  },

  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  lockIconLarge: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },

  modalTitle: {
    ...typography.h3,
    fontSize: 24,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },

  modalSubtitle: {
    ...typography.body2,
    fontSize: 14,
    color: colors.mutedForeground,
  },

  inputGroup: {
    gap: spacing.sm,
  },

  pinInput: {
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 8,
  },

  errorText: {
    ...typography.body2,
    fontSize: 12,
    color: colors.destructive,
    marginTop: spacing.xs - 2,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  modalButton: {
    flex: 1,
  },
});
