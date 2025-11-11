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

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, User, Users, Mic } from 'lucide-react-native';
import { spacing, typography, borderRadius, shadows } from '../../../design/tokens';
import VoiceRegistrationScreen from './VoiceRegistration';

// Mock family data
const CHILDREN = [
  { id: '3', name: '지우', avatar: '👧', age: 7 },
  { id: '4', name: '민준', avatar: '👦', age: 5 },
];

const PARENTS = [
  { id: '1', name: '엄마', avatar: '👩', role: '부모' },
  { id: '2', name: '아빠', avatar: '👨', role: '부모' },
];

const FAMILY_MEMBERS = [
  ...PARENTS.map(p => ({ ...p, age: undefined })),
  ...CHILDREN.map(c => ({ ...c, role: '자녀' })),
];

// Mock profile data
const MOCK_PROFILE = {
  name: '엄마',
  avatar: '👩',
  gender: 'female' as const,
};

export default function ParentProfileScreen() {
  const [showVoiceRegistration, setShowVoiceRegistration] = useState(false);

  // Filter out the current user from family members
  const otherFamilyMembers = FAMILY_MEMBERS.filter(
    (member) => member.name !== MOCK_PROFILE.name
  );

  const handleLogout = () => {
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
          onPress: () => {
            // Handle logout
            console.log('Logout');
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Profile Header */}
        <View style={styles.header}>
          <Text style={styles.avatarLarge}>{MOCK_PROFILE.avatar}</Text>
          <Text style={styles.headerName}>{MOCK_PROFILE.name}</Text>
          <Text style={styles.headerRole}>부모</Text>
        </View>

        {/* Profile Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <User size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.cardTitle}>프로필 정보</Text>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>이름</Text>
              <Text style={styles.infoValue}>{MOCK_PROFILE.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>역할</Text>
              <Text style={styles.infoValue}>부모</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>성별</Text>
              <Text style={styles.infoValue}>
                {MOCK_PROFILE.gender === 'male' ? '남성' : '여성'}
              </Text>
            </View>
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
            {otherFamilyMembers.map((member) => (
              <View key={member.id} style={styles.familyItem}>
                <Text style={styles.familyAvatar}>{member.avatar}</Text>
                <View style={styles.familyInfo}>
                  <Text style={styles.familyName}>{member.name}</Text>
                  <Text style={styles.familyDetail}>
                    {member.age ? `${member.age}살` : member.role}
                  </Text>
                </View>
              </View>
            ))}
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
      </ScrollView>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarLarge: {
    fontSize: 96,
    marginBottom: spacing.md,
  },
  headerName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: spacing.xs,
  },
  headerRole: {
    ...typography.body1,
    color: '#6B7280',
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
    fontSize: 18,
    fontWeight: '600',
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
});
