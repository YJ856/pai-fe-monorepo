/**
 * 인증 API
 *
 * 백엔드: pai-service-user (/api/auth)
 *
 * 주요 기능:
 * - 이메일 중복 확인
 * - 회원가입
 * - 로그인 (JWT Access Token + Refresh Token 발급)
 * - 로그아웃
 * - 토큰 갱신
 *
 * 사용 예시:
 * const { data } = await checkEmail('test@example.com');
 * const tokens = await login('test@example.com', 'password123');
 */

import { userServiceClient } from './client/axios';

/**
 * POST /api/auth/check-email
 * 이메일 중복 확인
 */
export const checkEmail = async (email: string) => {
  const response = await userServiceClient.post('/api/auth/check-email', { email });
  return response.data;
};

/**
 * POST /api/auth/signup
 * 회원가입
 *
 * Request:
 * - email: string
 * - password: string
 * - address: string (주소)
 * - latitude: number (위도)
 * - longitude: number (경도)
 */
export const signup = async (data: {
  email: string;
  password: string;
  address: string;
  latitude: number;
  longitude: number;
}) => {
  const response = await userServiceClient.post('/api/auth/signup', data);
  return response.data;
};

/**
 * POST /api/auth/login
 * 로그인
 *
 * Response:
 * - accessToken: string (JWT)
 * - refreshToken: string
 */
export const login = async (email: string, password: string) => {
  const response = await userServiceClient.post('/api/auth/login', {
    email,
    password,
  });
  return response.data.data;
};

/**
 * POST /api/auth/logout
 * 로그아웃 (인증 필요)
 * 서버 측 토큰 무효화
 */
export const logout = async () => {
  const response = await userServiceClient.post('/api/auth/logout');
  return response.data;
};

/**
 * POST /api/auth/refresh
 * Access Token 갱신
 *
 * Request:
 * - refreshToken: string
 *
 * Response:
 * - accessToken: string (새 JWT)
 * - refreshToken: string (새 Refresh Token)
 *
 * Note: 인터셉터에서 자동으로 호출되므로 직접 호출 불필요
 */
export const refreshToken = async (refreshToken: string) => {
  const response = await userServiceClient.post('/api/auth/refresh', {
    refreshToken,
  });
  return response.data.data;
};
