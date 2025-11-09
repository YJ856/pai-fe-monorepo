/**
 * React Native Navigation 루트 네비게이터
 * - React Navigation 기반 스택/탭 네비게이션
 * - 부모/자녀/공통 화면 라우팅
 * - 인증 가드, 프로필 선택 가드
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { ChildNavigator } from './ChildNavigator';
import { ParentNavigator } from './ParentNavigator';

export type RootStackParamList = {
  Auth: undefined;
  Profile: undefined;
  ChildApp: undefined;
  ParentApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  // TODO: 인증 상태 확인 로직 추가
  const isAuthenticated = false;
  const hasSelectedProfile = false;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : !hasSelectedProfile ? (
          <Stack.Screen name="Profile" component={ProfileNavigator} />
        ) : (
          <>
            {/* TODO: 프로필 타입에 따라 분기 */}
            <Stack.Screen name="ChildApp" component={ChildNavigator} />
            <Stack.Screen name="ParentApp" component={ParentNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
