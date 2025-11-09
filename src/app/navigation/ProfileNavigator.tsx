/**
 * 프로필 관련 네비게이터
 * - 프로필 선택/생성 화면
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileSelectScreen from '../../screens/profiles/Select';
import ProfileCreateScreen from '../../screens/profiles/Create';

export type ProfileStackParamList = {
  Select: undefined;
  Create: { profileType: 'parent' | 'child' };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Select" component={ProfileSelectScreen} />
      <Stack.Screen name="Create" component={ProfileCreateScreen} />
    </Stack.Navigator>
  );
}
