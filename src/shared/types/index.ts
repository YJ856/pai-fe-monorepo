/**
 * 공용 타입 정의
 *
 * 도메인 중립적인 경량 타입 정의
 * API 응답 타입은 api/types에서 관리
 */

/**
 * 프로필 타입
 */
export type ProfileType = "parent" | "child";

/**
 * 성별
 */
export type Gender = "male" | "female";

/**
 * 사용자 정보 (최소)
 */
export interface User {
  id: string;
  email: string;
}

/**
 * 퀴즈 상태
 */
export type QuizStatus = "today" | "completed" | "scheduled";

/**
 * 대화 정보 (최소)
 */
export interface Conversation {
  id: string;
  title: string;
  startDate: string;
  thumbnailUrl?: string;
}

/**
 * React Navigation 공용 파라미터 타입
 */
export interface NavigationParams {
  conversationId?: string;
  quizId?: string;
  date?: string;
  childProfileId?: string;
}
