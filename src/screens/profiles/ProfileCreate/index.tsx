/**
 * ProfileCreation 화면 (Design_v2 기반)
 *
 * 주요 기능:
 * - 프로필 타입 선택 (부모/자녀)
 * - 이름, 생년월일, 성별 입력
 * - 아바타 이모지 선택
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent } from '../../../design/components/Card';
import { Tab } from '../../../design/components/Tab';
import { Input } from '../../../design/components/Input';
import { Label } from '../../../design/components/Label';
import { Button } from '../../../design/components/Button';
import { Avatar } from '../../../design/components/Avatar';
import { colors, spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import { Profile, ProfileType, Gender } from '../../../shared/types';

const AVATAR_OPTIONS = ['👶', '👧', '👦', '👨', '👩', '🧑', '👴', '👵'];

export default function ProfileCreateScreen() {
  const [profileType, setProfileType] = useState<ProfileType>('child');
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [avatar, setAvatar] = useState('👶');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    if (!birthdate.trim()) {
      newErrors.birthdate = '생년월일을 입력해주세요';
    }

    if (profileType === 'parent') {
      if (!pin || pin.length !== 4) {
        newErrors.pin = '4자리 PIN을 입력해주세요';
      }
      if (pin !== confirmPin) {
        newErrors.confirmPin = 'PIN이 일치하지 않습니다';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

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
    // TODO: Save profile and navigate back
    handleCancel();
  };

  const handleCancel = () => {
    // TODO: Navigate back
    console.log('Cancel profile creation');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../../../assets/images/background.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.5)']}
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
              source={require('../../../assets/images/mascot.png')}
              style={styles.mascot}
              resizeMode="contain"
            />
            <Text style={styles.title}>프로필 생성</Text>
            <Text style={styles.subtitle}>새로운 가족 구성원을 추가해주세요</Text>
          </View>

          {/* Form Card */}
          <Card style={styles.card}>
            <CardContent style={styles.cardContent}>
              {/* Profile Type Selection */}
              <View style={styles.section}>
                <Label>프로필 유형</Label>
                <Tab
                  tabs={[
                    { key: 'child', label: '자녀' },
                    { key: 'parent', label: '부모' },
                  ]}
                  activeTab={profileType}
                  onTabChange={(key) => setProfileType(key as ProfileType)}
                  variant="full"
                  gradient={profileType === 'child' ? colors.child : colors.parent}
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
                    setErrors({ ...errors, name: '' });
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
                    setBirthdate(text);
                    setErrors({ ...errors, birthdate: '' });
                  }}
                  keyboardType="numbers-and-punctuation"
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
                    variant={gender === 'male' ? 'default' : 'outline'}
                    onPress={() => setGender('male')}
                    style={styles.genderButton}
                  >
                    남성
                  </Button>
                  <Button
                    variant={gender === 'female' ? 'default' : 'outline'}
                    onPress={() => setGender('female')}
                    style={styles.genderButton}
                  >
                    여성
                  </Button>
                </View>
              </View>

              {/* Avatar Selection */}
              <View style={styles.section}>
                <Label>아바타 선택</Label>
                <View style={styles.avatarGrid}>
                  {AVATAR_OPTIONS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.avatarButton,
                        avatar === emoji && styles.avatarButtonActive,
                      ]}
                      onPress={() => setAvatar(emoji)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.avatarEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* PIN (for parent only) */}
              {profileType === 'parent' && (
                <>
                  <View style={styles.section}>
                    <Label>PIN 설정</Label>
                    <Input
                      placeholder="4자리 PIN"
                      value={pin}
                      onChangeText={(text) => {
                        setPin(text);
                        setErrors({ ...errors, pin: '' });
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
                        setErrors({ ...errors, confirmPin: '' });
                      }}
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={4}
                      style={styles.pinInput}
                    />
                    {errors.confirmPin && (
                      <Text style={styles.errorText}>{errors.confirmPin}</Text>
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
                  gradient={profileType === 'child' ? colors.child : colors.parent}
                  onPress={handleSubmit}
                  style={styles.actionButton}
                >
                  생성
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
    backgroundColor: '#FFFFFF',
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
    alignItems: 'center',
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
    fontWeight: '600',
    color: colors.primaryForeground,
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.body1,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  card: {
    borderRadius: borderRadius['3xl'], // 24px
    ...shadows['2xl'],
  },

  cardContent: {
    padding: spacing.xl,
  },

  section: {
    marginBottom: spacing.lg,
  },

  genderButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  genderButton: {
    flex: 1,
  },

  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  avatarButton: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },

  avatarButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },

  avatarEmoji: {
    fontSize: 36,
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

  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  actionButton: {
    flex: 1,
  },
});
