/**
 * 인증 관련 네비게이터
 * - 로그인/회원가입 화면 (통합)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../screens/auth/Login';

export type AuthStackParamList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
