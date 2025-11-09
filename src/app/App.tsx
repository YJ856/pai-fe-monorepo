/**
 * React Native 최상위 앱 컴포넌트
 * - 전역 Provider 구성 (Query Client, Auth Context 등)
 * - Navigation Container 바인딩
 * - 앱 전역 상태 관리
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from './providers/query-client';
import { RootNavigator } from './navigation/RootNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider>
        <RootNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
