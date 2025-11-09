/**
 * Axios 인스턴스 설정 (React Native)
 *
 * 백엔드 MSA(Microservices Architecture) 구조에 맞춰
 * 각 서비스별로 독립적인 axios 인스턴스 생성
 *
 * 서비스 목록:
 * - userServiceClient: 인증, 회원가입, 프로필 관리
 * - insightServiceClient: 관심사 분석, 추천 콘텐츠
 * - quizServiceClient: 퀴즈 생성/조회/답변
 * - conversationServiceClient: 대화 기록/조회
 * - mediaServiceClient: 파일 업로드/다운로드
 */

import axios from 'axios';
import { SERVICE_URLS } from './serviceUrls';

// 사용자 서비스 (인증, 프로필)
export const userServiceClient = axios.create({
  baseURL: SERVICE_URLS.USER_SERVICE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인사이트 서비스 (관심사, 추천)
export const insightServiceClient = axios.create({
  baseURL: SERVICE_URLS.INSIGHT_SERVICE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 퀴즈 서비스
export const quizServiceClient = axios.create({
  baseURL: SERVICE_URLS.QUIZ_SERVICE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 대화 서비스
export const conversationServiceClient = axios.create({
  baseURL: SERVICE_URLS.CONVERSATION_SERVICE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 미디어 서비스 (파일 업로드/다운로드)
export const mediaServiceClient = axios.create({
  baseURL: SERVICE_URLS.MEDIA_SERVICE,
  timeout: 30000, // 파일 업로드 고려하여 타임아웃 증가
  headers: {
    'Content-Type': 'application/json',
  },
});
