/**
 * TanStack Query Client Provider (React Native)
 * - 서버 상태 캐싱 및 동기화
 * - API 요청 상태 관리
 * - 자동 리패칭, 캐시 무효화 설정
 * - 네트워크 상태 감지 (React Native NetInfo)
 */

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

// React Native용 네트워크 상태 감지
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분 (formerly cacheTime)
    },
  },
});

interface Props {
  children: ReactNode;
}

export function QueryClientProvider({ children }: Props) {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
}
