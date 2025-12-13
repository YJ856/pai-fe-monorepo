/**
 * React Native 최상위 앱 컴포넌트
 * - 전역 Provider 구성 (Query Client, Auth Context 등)
 * - Navigation Container 바인딩
 * - 앱 전역 상태 관리
 */

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from './providers/query-client';
import { setupInterceptors } from '../api/client/interceptors';
import { navigationRef } from '../utils/navigationRef';
import { AuthNavigator } from './navigation/AuthNavigator';
import { ProfileNavigator } from './navigation/ProfileNavigator';
import { ChildNavigator } from './navigation/ChildNavigator';
import { ParentNavigator } from './navigation/ParentNavigator';

export type RootStackParamList = {
  Auth: undefined;
  Profile: undefined;
  ChildApp: undefined;
  ParentApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// 앱 초기화 시 인터셉터 설정 (자식 컴포넌트의 API 요청보다 먼저 실행 보장)
setupInterceptors();

function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth" component={AuthNavigator} />
            <Stack.Screen name="Profile" component={ProfileNavigator} />
            <Stack.Screen name="ChildApp" component={ChildNavigator} />
            <Stack.Screen name="ParentApp" component={ParentNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
