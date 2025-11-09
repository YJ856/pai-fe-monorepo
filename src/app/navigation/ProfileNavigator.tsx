/**
 * 프로필 관련 네비게이터
 * - 프로필 선택/생성 화면
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileSelectScreen from '../../screens/profiles/ProfileSelect';
import ProfileCreateScreen from '../../screens/profiles/ProfileCreate';

export type ProfileStackParamList = {
  ProfileSelect: undefined;
  ProfileCreate: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileSelect" component={ProfileSelectScreen} />
      <Stack.Screen name="ProfileCreate" component={ProfileCreateScreen} />
    </Stack.Navigator>
  );
}
