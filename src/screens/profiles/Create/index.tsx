/**
 * 프로필 생성 화면
 *
 * 주요 기능:
 * - 프로필 타입 선택 (부모/자녀)
 * - 이름, 생년월일, 성별 입력
 * - 아바타 이미지 업로드 (media API)
 * - 음성 파일 업로드 (선택사항)
 * - 자녀 프로필: PIN 번호 설정
 * - 프로필 생성 API 호출
 *
 * API:
 * - POST /api/media/upload (api/media.ts)
 * - POST /api/profiles (api/profiles.ts)
 *
 * TODO:
 * - 이미지 피커 추가 (react-native-image-picker)
 * - 음성 녹음 기능 추가
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../../design/layouts/ScreenContainer';
import { Input } from '../../../design/components/Input';
import { Button } from '../../../design/components/Button';
import { spacing, typography } from '../../../design/tokens';
// import { ProfileType } from '../../../shared/types';

export default function ProfileCreateScreen() {
  const [profileType, setProfileType] = useState<'parent' | 'child'>('parent');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [pin, setPin] = useState('');

  // TODO: useMutation으로 프로필 생성 API 호출

  const handleCreateProfile = () => {
    // TODO: 유효성 검사
    // TODO: 아바타 업로드 (uploadMedia)
    // TODO: 프로필 생성 (createProfile)
    console.log('Create profile:', { profileType, name, birthDate, gender, pin });
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>프로필 만들기</Text>

        {/* TODO: 프로필 타입 선택 버튼 (부모/자녀) */}

        <Input
          label="이름"
          placeholder="이름을 입력하세요"
          value={name}
          onChangeText={setName}
        />

        <Input
          label="생년월일"
          placeholder="YYYY-MM-DD"
          value={birthDate}
          onChangeText={setBirthDate}
        />

        {/* TODO: 성별 선택 라디오 버튼 */}

        {/* TODO: 아바타 이미지 선택 */}

        {profileType === 'child' && (
          <Input
            label="PIN 번호 (4자리)"
            placeholder="PIN 번호를 입력하세요"
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
        )}

        <Button variant="primary" onPress={handleCreateProfile}>
          프로필 만들기
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
});
