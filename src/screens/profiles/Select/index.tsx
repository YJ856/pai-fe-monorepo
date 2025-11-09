/**
 * 프로필 선택 화면
 *
 * 주요 기능:
 * - 사용자의 프로필 목록 조회 (부모/자녀)
 * - 프로필 선택 → profileId 저장
 * - 프로필 타입에 따라 앱 진입 분기
 *   - parent → ParentNavigator
 *   - child → ChildNavigator
 * - 프로필 생성 화면으로 이동
 *
 * API:
 * - GET /api/profiles (api/profiles.ts)
 * - POST /api/profiles/select (api/profiles.ts)
 *
 * 상태 관리:
 * - TanStack Query useQuery로 프로필 목록 조회
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer } from '../../../design/layouts/ScreenContainer';
import { Card } from '../../../design/components/Card';
import { Button } from '../../../design/components/Button';
import { spacing, typography } from '../../../design/tokens';
// import { useQuery, useMutation } from '@tanstack/react-query';
// import { getProfiles, selectProfile } from '../../../api/profiles';
// import { tokenManager } from '../../../api/client/interceptors';

export default function ProfileSelectScreen() {
  // TODO: useQuery로 프로필 목록 조회
  // const { data: profiles, isLoading } = useQuery({
  //   queryKey: ['profiles'],
  //   queryFn: getProfiles,
  // });

  // TODO: useMutation으로 프로필 선택
  // const selectMutation = useMutation({
  //   mutationFn: selectProfile,
  //   onSuccess: async (data, profileId) => {
  //     await tokenManager.setProfileId(profileId);
  //     // Navigate based on profile type
  //   },
  // });

  const mockProfiles = [
    { id: '1', name: '엄마', profileType: 'parent', avatarUrl: '' },
    { id: '2', name: '민수', profileType: 'child', avatarUrl: '' },
  ];

  const handleSelectProfile = (profileId: string) => {
    // TODO: selectMutation.mutate(profileId)
    console.log('Select profile:', profileId);
  };

  const handleCreateProfile = () => {
    // TODO: Navigate to ProfileCreate
    console.log('Create profile');
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>프로필 선택</Text>

        <FlatList
          data={mockProfiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card
              style={styles.profileCard}
              onPress={() => handleSelectProfile(item.id)}
            >
              <Text style={styles.profileName}>{item.name}</Text>
              <Text style={styles.profileType}>
                {item.profileType === 'parent' ? '부모' : '자녀'}
              </Text>
            </Card>
          )}
          contentContainerStyle={styles.listContent}
        />

        <Button variant="outline" onPress={handleCreateProfile}>
          새 프로필 만들기
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xl,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileName: {
    ...typography.h3,
  },
  profileType: {
    ...typography.body2,
  },
});
