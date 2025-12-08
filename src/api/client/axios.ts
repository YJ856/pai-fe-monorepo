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

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVICE_URLS } from "./serviceUrls";

// 사용자 서비스 (인증, 프로필)
export const userServiceClient = axios.create({
  baseURL: SERVICE_URLS.USER_SERVICE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 인사이트 서비스 (관심사, 추천)
export const insightServiceClient = axios.create({
  baseURL: SERVICE_URLS.INSIGHT_SERVICE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 퀴즈 서비스
export const quizServiceClient = axios.create({
  baseURL: SERVICE_URLS.QUIZ_SERVICE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 대화 서비스
export const conversationServiceClient = axios.create({
  baseURL: SERVICE_URLS.CONVERSATION_SERVICE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 미디어 서비스 (파일 업로드/다운로드)
export const mediaServiceClient = axios.create({
  baseURL: SERVICE_URLS.MEDIA_SERVICE,
  timeout: 30000, // 파일 업로드 고려하여 타임아웃 증가
  headers: {
    "Content-Type": "application/json",
  },
});

// ai 서비스 (vqa 답변 받기)
export const aiServiceClient = axios.create({
  baseURL: SERVICE_URLS.AI_SERVICE,
  timeout: 30000, // AI 동작 시간 고려
  headers: {
    "Content-Type": "application/json",
  },
});


// 인증 토큰 인터셉터
const addAuthInterceptor = (client: any) => {
  client.interceptors.request.use(
    async (config: any) => {
      // 회원가입, 로그인, 토큰 갱신은 토큰 불필요
      const publicEndpoints = ["/api/auth/signup", "/api/auth/login", "/api/auth/refresh"];
      const isPublicEndpoint = publicEndpoints.some((endpoint) =>
        config.url?.includes(endpoint)
      );

      if (!isPublicEndpoint) {
        // AsyncStorage에서 토큰 가져오기
        const accessToken = await AsyncStorage.getItem("accessToken");
        console.log(
          "[AUTH-INTERCEPTOR] AccessToken from AsyncStorage:",
          accessToken ? `${accessToken.substring(0, 20)}...` : "NULL"
        );

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          console.log(
            "[AUTH-INTERCEPTOR] Authorization header set successfully"
          );
        } else {
          console.warn(
            "[AUTH-INTERCEPTOR] No accessToken found in AsyncStorage!"
          );
        }
      }

      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );
};

// 디버깅용 인터셉터 (개발 환경)
const addDebugInterceptor = (client: any, serviceName: string) => {
  // Request 인터셉터
  client.interceptors.request.use(
    (config: any) => {
      console.log(`[${serviceName}] Request:`, {
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        method: config.method,
        data: config.data,
        headers: config.headers,
      });
      return config;
    },
    (error: any) => {
      console.error(`[${serviceName}] Request Error:`, error);
      return Promise.reject(error);
    }
  );

  // Response 인터셉터
  client.interceptors.response.use(
    (response: any) => {
      console.log(`[${serviceName}] Response:`, {
        status: response.status,
        data: response.data,
      });
      return response;
    },
    (error: any) => {
      // 에러 로그만 출력 (401 처리는 interceptors.ts에서 담당)
      console.error(`[${serviceName}] Response Error:`, {
        message: error.message,
        code: error.code,
        config: error.config
          ? {
              url: error.config.url,
              baseURL: error.config.baseURL,
            }
          : null,
        response: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : null,
      });

      return Promise.reject(error);
    }
  );
};

// 모든 클라이언트에 인증 인터셉터 추가
addAuthInterceptor(userServiceClient);
addAuthInterceptor(insightServiceClient);
addAuthInterceptor(quizServiceClient);
addAuthInterceptor(conversationServiceClient);
addAuthInterceptor(mediaServiceClient);
addAuthInterceptor(aiServiceClient);

// 모든 클라이언트에 디버깅 인터셉터 추가
addDebugInterceptor(userServiceClient, "USER");
addDebugInterceptor(insightServiceClient, "INSIGHT");
addDebugInterceptor(quizServiceClient, "QUIZ");
addDebugInterceptor(conversationServiceClient, "CONVERSATION");
addDebugInterceptor(mediaServiceClient, "MEDIA");
addDebugInterceptor(aiServiceClient, "AI");
