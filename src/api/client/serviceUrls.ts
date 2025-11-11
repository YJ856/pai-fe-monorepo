/**
 * 마이크로서비스 Base URL 관리
 *
 * Expo 환경 변수를 통해 환경별 서비스 URL 관리
 * - .env 파일에 EXPO_PUBLIC_ 접두사로 환경 변수 설정
 * - process.env를 통해 자동으로 로드
 *
 * 사용법:
 * 1. .env 파일에 각 서비스 URL 설정 (EXPO_PUBLIC_ 접두사 필수)
 * 2. 이 파일에서 자동으로 로드
 */

const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return defaultValue;
};

export const SERVICE_URLS = {
  // pai-service-user: 인증, 프로필
  USER_SERVICE: getEnvVar('EXPO_PUBLIC_USER_SERVICE_URL', 'http://localhost:3001'),

  // pai-service-insight: 관심사 분석, 추천
  INSIGHT_SERVICE: getEnvVar('EXPO_PUBLIC_INSIGHT_SERVICE_URL', 'http://localhost:3002'),

  // pai-service-quiz: 퀴즈
  QUIZ_SERVICE: getEnvVar('EXPO_PUBLIC_QUIZ_SERVICE_URL', 'http://localhost:3003'),

  // pai-service-conversation: 대화
  CONVERSATION_SERVICE: getEnvVar('EXPO_PUBLIC_CONVERSATION_SERVICE_URL', 'http://localhost:3004'),

  // pai-service-media: 미디어 업로드
  MEDIA_SERVICE: getEnvVar('EXPO_PUBLIC_MEDIA_SERVICE_URL', 'http://localhost:3005'),
} as const;
