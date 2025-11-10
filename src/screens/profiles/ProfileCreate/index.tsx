/**
 * 프로필 생성 화면
 *
 * 주요 기능:
 * - 프로필 타입 선택 (부모/자녀)
 * - 이름, 생년월일, 성별 입력
 * - 아바타 이모지 선택
 * - 부모 프로필: PIN 설정
 *
 * API:
 * - POST /api/profiles (api/profiles.ts)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../../../design/components/Input';
import { Button } from '../../../design/components/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import { Profile, ProfileType, Gender } from '../../../shared/types';
import { ProfileStackParamList } from '../../../app/navigation/ProfileNavigator';

const AVATAR_OPTIONS = ['👶', '👧', '👦', '👨', '👩', '🧑', '👴', '👵'];

type ProfileCreateNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'ProfileCreate'
>;

export default function ProfileCreateScreen() {
  const navigation = useNavigation<ProfileCreateNavigationProp>();
  const [profileType, setProfileType] = useState<ProfileType>('child');
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [avatar, setAvatar] = useState('👶');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSubmit = () => {
    // TODO: Validation
    // TODO: API call

    const newProfile: Profile = {
      id: Date.now().toString(),
      profileType,
      name,
      birthdate,
      gender,
      avatar,
      pin: profileType === 'parent' ? pin : undefined,
    };

    console.log('Created profile:', newProfile);
    // TODO: Save profile and navigate
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text.inverse} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Image
              source={require('../../../assets/images/mascot.png')}
              style={styles.mascot}
            />
            <Text style={styles.title}>프로필 생성</Text>
          </View>
        </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Profile Type */}
            <View style={styles.section}>
              <Text style={styles.label}>프로필 유형</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    profileType === 'parent' && styles.typeButtonActive,
                  ]}
                  onPress={() => setProfileType('parent')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      profileType === 'parent' && styles.typeButtonTextActive,
                    ]}
                  >
                    부모
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    profileType === 'child' && styles.typeButtonActive,
                  ]}
                  onPress={() => setProfileType('child')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      profileType === 'child' && styles.typeButtonTextActive,
                    ]}
                  >
                    자녀
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Name */}
            <Input
              label="이름"
              placeholder="이름 입력"
              value={name}
              onChangeText={setName}
            />

            {/* Birthdate */}
            <Input
              label="생년월일"
              placeholder="YYYY-MM-DD"
              value={birthdate}
              onChangeText={setBirthdate}
            />

            {/* Gender */}
            <View style={styles.section}>
              <Text style={styles.label}>성별</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'male' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender('male')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === 'male' && styles.genderButtonTextActive,
                    ]}
                  >
                    남성
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === 'female' && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender('female')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === 'female' && styles.genderButtonTextActive,
                    ]}
                  >
                    여성
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Avatar */}
            <View style={styles.section}>
              <Text style={styles.label}>아바타</Text>
              <View style={styles.avatarGrid}>
                {AVATAR_OPTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.avatarButton,
                      avatar === emoji && styles.avatarButtonActive,
                    ]}
                    onPress={() => setAvatar(emoji)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.avatarEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* PIN (for parent only) */}
            {profileType === 'parent' && (
              <>
                <Input
                  label="PIN 설정"
                  placeholder="4자리 PIN"
                  value={pin}
                  onChangeText={setPin}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                />
                <Input
                  label="PIN 확인"
                  placeholder="PIN 재입력"
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                />
              </>
            )}

            {/* Buttons */}
            <View style={styles.buttons}>
              <Button variant="outline" onPress={handleCancel} style={{ flex: 1 }}>
                취소
              </Button>
              <View style={{ width: spacing.sm }} />
              <Button
                variant="gradient"
                gradient={colors.auth}
                onPress={handleSubmit}
                style={{ flex: 1 }}
              >
                생성
              </Button>
            </View>
          </View>
        </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mascot: {
    width: 48,
    height: 48,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text.inverse,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 24,
    padding: spacing.lg,
    ...shadows.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.background.tertiary,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  typeButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  typeButtonText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  typeButtonTextActive: {
    color: colors.text.inverse,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.background.tertiary,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  genderButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  genderButtonText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  genderButtonTextActive: {
    color: colors.text.inverse,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  avatarButton: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarButtonActive: {
    borderColor: colors.primary[500],
  },
  avatarEmoji: {
    fontSize: 32,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
});
