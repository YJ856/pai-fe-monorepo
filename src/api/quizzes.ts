/**
 * 퀴즈 API
 *
 * 백엔드: pai-service-quiz (/api/quiz)
 *
 * 부모용 API:
 * - 퀴즈 생성 (자녀에게 출제)
 * - 오늘/완료/예정 퀴즈 조회
 * - 퀴즈 수정/삭제
 *
 * 자녀용 API:
 * - 오늘/완료된 퀴즈 조회
 * - 퀴즈 답변 제출
 *
 * 퀴즈 상태:
 * - today: 오늘 출제된 퀴즈
 * - completed: 완료된 퀴즈
 * - scheduled: 예정된 퀴즈 (미래 날짜)
 */

import { quizServiceClient } from './client/axios';

// ========== 부모용 API ==========

/**
 * GET /api/quiz/next-publish-date
 * 다음 출제 가능 날짜 조회
 *
 * 퀴즈 생성 시 기본 출제일로 사용
 */
export const getNextPublishDate = async () => {
  const response = await quizServiceClient.get('/api/quiz/next-publish-date');
  return response.data.data;
};

/**
 * POST /api/quiz
 * 퀴즈 생성 (부모가 자녀에게 출제)
 *
 * Request:
 * - question: string
 * - answer: string
 * - reward?: string (보상 설명)
 * - hint?: string
 * - publishDate: string (YYYY-MM-DD)
 * - childProfileIds: string[] (출제할 자녀 프로필 ID 목록)
 */
export const createQuiz = async (data: {
  question: string;
  answer: string;
  reward?: string;
  hint?: string;
  publishDate: string;
  childProfileIds: string[];
}) => {
  const response = await quizServiceClient.post('/api/quiz', data);
  return response.data.data;
};

/**
 * GET /api/quiz/parents/today?childProfileId=
 * 부모용: 오늘의 퀴즈 조회
 *
 * Query:
 * - childProfileId: string (선택적, 특정 자녀 필터링)
 */
export const getParentTodayQuizzes = async (childProfileId?: string) => {
  const response = await quizServiceClient.get('/api/quiz/parents/today', {
    params: { childProfileId },
  });
  return response.data.data;
};

/**
 * GET /api/quiz/parents/completed?childProfileId=&page=1&limit=10
 * 부모용: 완료된 퀴즈 조회
 *
 * Query:
 * - childProfileId: string (선택적)
 * - page: number
 * - limit: number
 */
export const getParentCompletedQuizzes = async (params: {
  childProfileId?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await quizServiceClient.get('/api/quiz/parents/completed', {
    params: {
      page: 1,
      limit: 10,
      ...params,
    },
  });
  return response.data.data;
};

/**
 * GET /api/quiz/parents/scheduled?childProfileId=&page=1&limit=10
 * 부모용: 예정된 퀴즈 조회
 *
 * Query:
 * - childProfileId: string (선택적)
 * - page: number
 * - limit: number
 */
export const getParentScheduledQuizzes = async (params: {
  childProfileId?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await quizServiceClient.get('/api/quiz/parents/scheduled', {
    params: {
      page: 1,
      limit: 10,
      ...params,
    },
  });
  return response.data.data;
};

/**
 * GET /api/quiz/:quizId
 * 퀴즈 상세 조회
 */
export const getQuizDetail = async (quizId: string) => {
  const response = await quizServiceClient.get(`/api/quiz/${quizId}`);
  return response.data.data;
};

/**
 * PATCH /api/quiz/:quizId
 * 퀴즈 수정
 *
 * Request:
 * - question?: string
 * - answer?: string
 * - reward?: string
 * - hint?: string
 * - publishDate?: string
 */
export const updateQuiz = async (
  quizId: string,
  data: {
    question?: string;
    answer?: string;
    reward?: string;
    hint?: string;
    publishDate?: string;
  }
) => {
  const response = await quizServiceClient.patch(`/api/quiz/${quizId}`, data);
  return response.data.data;
};

/**
 * DELETE /api/quiz/:quizId
 * 퀴즈 삭제
 */
export const deleteQuiz = async (quizId: string) => {
  const response = await quizServiceClient.delete(`/api/quiz/${quizId}`);
  return response.data;
};

// ========== 자녀용 API ==========

/**
 * GET /api/quiz/children/today?limit=10
 * 자녀용: 오늘의 퀴즈 조회
 *
 * Query:
 * - limit: number (기본값: 10)
 */
export const getChildTodayQuizzes = async (limit = 10) => {
  const response = await quizServiceClient.get('/api/quiz/children/today', {
    params: { limit },
  });
  return response.data.data;
};

/**
 * GET /api/quiz/children/completed?page=1&limit=10
 * 자녀용: 완료된 퀴즈 조회
 *
 * Query:
 * - page: number
 * - limit: number
 */
export const getChildCompletedQuizzes = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await quizServiceClient.get('/api/quiz/children/completed', {
    params: {
      page: 1,
      limit: 10,
      ...params,
    },
  });
  return response.data.data;
};

/**
 * POST /api/quiz/children/:quizId/answer
 * 자녀용: 퀴즈 답변 제출
 *
 * Request:
 * - answer: string
 *
 * Response:
 * - isCorrect: boolean
 * - correctAnswer?: string (틀린 경우)
 * - rewardGranted: boolean
 */
export const answerQuiz = async (quizId: string, answer: string) => {
  const response = await quizServiceClient.post(`/api/quiz/children/${quizId}/answer`, {
    answer,
  });
  return response.data.data;
};
