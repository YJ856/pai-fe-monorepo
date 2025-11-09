/**
 * 마이크로서비스 Base URL 관리
 *
 * React Native Config를 통해 환경별 서비스 URL 관리
 * - .env.development: 개발 환경
 * - .env.production: 프로덕션 환경
 *
 * 사용법:
 * 1. react-native-config 설치
 * 2. .env 파일에 각 서비스 URL 설정
 * 3. 이 파일에서 자동으로 로드
 */

import Config from 'react-native-config';

export const SERVICE_URLS = {
  // pai-service-user: 인증, 프로필
  USER_SERVICE: Config.USER_SERVICE_URL || 'http://localhost:3001',

  // pai-service-insight: 관심사 분석, 추천
  INSIGHT_SERVICE: Config.INSIGHT_SERVICE_URL || 'http://localhost:3002',

  // pai-service-quiz: 퀴즈
  QUIZ_SERVICE: Config.QUIZ_SERVICE_URL || 'http://localhost:3003',

  // pai-service-conversation: 대화
  CONVERSATION_SERVICE: Config.CONVERSATION_SERVICE_URL || 'http://localhost:3004',

  // pai-service-media: 미디어 업로드
  MEDIA_SERVICE: Config.MEDIA_SERVICE_URL || 'http://localhost:3005',
} as const;
