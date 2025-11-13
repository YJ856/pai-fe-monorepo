/**
 * 마이크로서비스 Base URL 관리
 *
 * Expo 환경 변수를 통해 환경별 서비스 URL 관리
 * - .env 파일에 EXPO_PUBLIC_ 접두사로 환경 변수 설정
 * - process.env를 통해 빌드 타임에 자동으로 로드
 *
 * 사용법:
 * 1. .env 파일에 각 서비스 URL 설정 (EXPO_PUBLIC_ 접두사 필수)
 * 2. 앱 재시작 (Expo는 빌드 타임에 환경 변수를 번들에 포함)
 *
 * 주의:
 * - 환경 변수 변경 후 반드시 앱 재시작 필요
 * - Android Emulator: 10.0.2.2 사용
 * - iOS Simulator: localhost 사용
 */

export const SERVICE_URLS = {
  // pai-service-user: 인증, 프로필
  USER_SERVICE:
    process.env.EXPO_PUBLIC_USER_SERVICE_URL || "http://10.0.2.2:3001",

  // pai-service-media: 미디어 업로드 (포트 3002)
  MEDIA_SERVICE:
    process.env.EXPO_PUBLIC_MEDIA_SERVICE_URL || "http://10.0.2.2:3002",

  // pai-service-insight: 관심사 분석, 추천
  INSIGHT_SERVICE:
    process.env.EXPO_PUBLIC_INSIGHT_SERVICE_URL || "http://10.0.2.2:3003",

  // pai-service-quiz: 퀴즈
  QUIZ_SERVICE:
    process.env.EXPO_PUBLIC_QUIZ_SERVICE_URL || "http://10.0.2.2:3004",

  // pai-service-conversation: 대화
  CONVERSATION_SERVICE:
    process.env.EXPO_PUBLIC_CONVERSATION_SERVICE_URL || "http://10.0.2.2:3005",
} as const;

// 개발 환경에서 URL 확인용
if (__DEV__) {
  console.log("[SERVICE_URLS] Configuration:", SERVICE_URLS);
}
