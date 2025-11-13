/**
 * React Native Navigation 루트 네비게이터
 * - React Navigation 기반 스택/탭 네비게이션
 * - 부모/자녀/공통 화면 라우팅
 * - 인증 가드, 프로필 선택 가드
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthNavigator } from './AuthNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { ChildNavigator } from './ChildNavigator';
import { ParentNavigator } from './ParentNavigator';
import DevNavigatorScreen from '../../screens/DevNavigator';
import { authEvents } from '../../utils/authEvents';

export type RootStackParamList = {
  DevNavigator: undefined;
  Auth: undefined;
  Profile: undefined;
  ChildApp: undefined;
  ParentApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasSelectedProfile = false;

  // 개발 모드: 모든 페이지 접근 가능한 네비게이터 표시
  const isDevelopmentMode = true;

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();

    // 401 에러 발생 시 인증 상태 업데이트
    const unsubscribe = authEvents.subscribe(() => {
      setIsAuthenticated(false);
    });

    return unsubscribe;
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('[RootNavigator] 인증 상태 확인 시작');
      const accessToken = await AsyncStorage.getItem('accessToken');
      console.log('[RootNavigator] accessToken 존재 여부:', !!accessToken);
      setIsAuthenticated(!!accessToken);
    } catch (error) {
      console.error('[RootNavigator] 인증 상태 확인 실패:', error);
      setIsAuthenticated(false);
    } finally {
      console.log('[RootNavigator] 로딩 완료');
      setIsLoading(false);
    }
  };

  // 로딩 중에는 로딩 인디케이터 표시
  if (isLoading) {
    console.log('[RootNavigator] 로딩 중...');
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isDevelopmentMode ? (
          <>
            <Stack.Screen
              name="DevNavigator"
              component={DevNavigatorScreen}
              options={{ title: '개발용 네비게이터' }}
            />
            <Stack.Screen
              name="Auth"
              component={AuthNavigator}
              listeners={({ navigation }) => ({
                focus: async () => {
                  // 로그인 화면에 접근할 때 이미 로그인되어 있으면 프로필 선택으로 이동
                  const accessToken = await AsyncStorage.getItem('accessToken');
                  if (accessToken) {
                    navigation.replace('Profile');
                  }
                }
              })}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileNavigator}
              listeners={({ navigation }) => ({
                focus: async () => {
                  // 프로필 화면에 접근할 때 로그인되어 있지 않으면 로그인으로 이동
                  const accessToken = await AsyncStorage.getItem('accessToken');
                  if (!accessToken) {
                    navigation.replace('Auth');
                  }
                }
              })}
            />
            <Stack.Screen
              name="ChildApp"
              component={ChildNavigator}
              listeners={({ navigation }) => ({
                focus: async () => {
                  // 자녀 앱에 접근할 때 로그인되어 있지 않으면 로그인으로 이동
                  const accessToken = await AsyncStorage.getItem('accessToken');
                  if (!accessToken) {
                    navigation.replace('Auth');
                  }
                }
              })}
            />
            <Stack.Screen
              name="ParentApp"
              component={ParentNavigator}
              listeners={({ navigation }) => ({
                focus: async () => {
                  // 부모 앱에 접근할 때 로그인되어 있지 않으면 로그인으로 이동
                  const accessToken = await AsyncStorage.getItem('accessToken');
                  if (!accessToken) {
                    navigation.replace('Auth');
                  }
                }
              })}
            />
          </>
        ) : !isAuthenticated ? (
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
