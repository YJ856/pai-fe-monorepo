/**
 * Axios 인터셉터 설정
 *
 * 주요 기능:
 * 1. 요청 인터셉터
 *    - JWT Access Token 자동 추가 (Authorization 헤더)
 *    - 프로필 ID 자동 추가 (X-Profile-Id 헤더)
 *
 * 2. 응답 인터셉터
 *    - 401 Unauthorized 시 자동 토큰 갱신
 *    - 토큰 갱신 실패 시 로그아웃 처리
 *
 * 3. AsyncStorage 기반 토큰 관리
 *    - Access Token, Refresh Token 영구 저장
 *    - 앱 재시작 시에도 로그인 유지
 */

import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  userServiceClient,
  insightServiceClient,
  quizServiceClient,
  conversationServiceClient,
  mediaServiceClient
} from './axios';
import { reset } from '../../utils/navigationRef';
import { authEvents } from '../../utils/authEvents';

// AsyncStorage 키 (기존 코드와 호환)
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const PROFILE_ID_KEY = '@pai:selected_profile_id';
const DEVICE_ID_KEY = '@pai:device_id';

/**
 * 간단한 UUID v4 생성 함수
 */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 토큰 및 디바이스 관리 유틸리티
 * React Native AsyncStorage 사용
 */
export const tokenManager = {
  getAccessToken: async () => await AsyncStorage.getItem(TOKEN_KEY),
  setAccessToken: async (token: string) => await AsyncStorage.setItem(TOKEN_KEY, token),

  getRefreshToken: async () => await AsyncStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: async (token: string) => await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token),

  getProfileId: async () => await AsyncStorage.getItem(PROFILE_ID_KEY),
  setProfileId: async (profileId: string) => await AsyncStorage.setItem(PROFILE_ID_KEY, profileId),

  /**
   * Device ID 가져오기
   * 없으면 생성 후 저장
   */
  getDeviceId: async (): Promise<string> => {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = generateUUID();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  },

  clearTokens: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, PROFILE_ID_KEY]);
    // Note: deviceId는 유지 (기기 고유값이므로)
  },
};

/**
 * 요청 인터셉터
 * 모든 API 요청에 토큰, 프로필 ID, 디바이스 ID 자동 추가
 */
const requestInterceptor = async (config: InternalAxiosRequestConfig) => {
  const accessToken = await tokenManager.getAccessToken();
  const profileId = await tokenManager.getProfileId();
  const deviceId = await tokenManager.getDeviceId();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (profileId) {
    config.headers['X-Profile-Id'] = profileId;
  }

  // 모든 요청에 디바이스 ID 추가
  config.headers['x-device-id'] = deviceId;

  return config;
};

/**
 * 응답 인터셉터
 * 401 에러 발생 시 토큰 자동 갱신 시도
 */
const setupResponseInterceptor = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // refresh 엔드포인트는 재시도하지 않음 (무한 루프 방지)
      if (originalRequest.url?.includes('/api/auth/refresh')) {
        return Promise.reject(error);
      }

      // 401 에러이고 아직 재시도하지 않은 경우
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = await tokenManager.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const deviceId = await tokenManager.getDeviceId();

          // pai-service-user의 /api/auth/refresh 호출
          // 인터셉터를 거치지 않도록 직접 호출
          const response = await userServiceClient.post(
            '/api/auth/refresh',
            {
              refreshToken,
              deviceId,
            },
            {
              headers: {
                // refresh 요청에는 Authorization 헤더를 추가하지 않음
              },
              // 재시도 플래그를 설정하여 인터셉터에서 다시 처리하지 않도록 함
              _retry: true,
            } as any
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // 새 토큰 저장
          await tokenManager.setAccessToken(accessToken);
          await tokenManager.setRefreshToken(newRefreshToken);

          // 원래 요청에 새 토큰 추가 후 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 처리
          console.log('[AUTH] Refresh token expired - Clearing tokens and redirecting to login');
          await tokenManager.clearTokens();

          // 인증 이벤트 발생
          authEvents.emit();

          // 로그인 화면으로 네비게이션
          reset('Auth');

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * 모든 axios 클라이언트에 인터셉터 적용
 * App.tsx에서 앱 시작 시 한 번만 호출
 */
export function setupInterceptors() {
  const clients = [
    userServiceClient,
    insightServiceClient,
    quizServiceClient,
    conversationServiceClient,
    mediaServiceClient,
  ];

  clients.forEach((client) => {
    client.interceptors.request.use(requestInterceptor);
    setupResponseInterceptor(client);
  });
}
