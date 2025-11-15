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
import type {
  BaseResponse,
  ChildrenTodayQueryParam,
  ChildrenTodayResponseData,
  AnswerQuizResponseData,
  ChildrenCompletedQueryParam,
  ChildrenCompletedResponseData,
  ParentsTodayQueryParam,
  ParentsTodayResponseData,
  ParentsCompletedQueryParam,
  ParentsCompletedResponseData,
  ParentsScheduledQueryParam,
  ParentsScheduledResponseData,
  CreateQuizRequestDto,
  CreateQuizResponseData,
  NextPublishDateData,
} from 'pai-shared-types';


// ========== 부모용 API ==========

/**
 * GET /api/quiz/next-publish-date
 * 다음 출제 가능 날짜 조회
 *
 * 퀴즈 생성 시 기본 출제일로 사용
 */
export const getNextPublishDate = async (): Promise<string> => {
  const response = await quizServiceClient.get<BaseResponse<NextPublishDateData>>('/api/quiz/next-publish-date');
  return response.data.data!.defaultPublishDate;
};

/**
 * POST /api/quiz
 * 퀴즈 생성 (부모가 자녀에게 출제)
 *
 * Request:
 * - question: string (필수)
 * - answer: string (필수)
 * - hint?: string | null
 * - reward?: string | null
 * - publishDate?: string | null (null이면 오늘 날짜로 설정됨)
 */
export const createQuiz = async (
  data: CreateQuizRequestDto,
): Promise<CreateQuizResponseData> => {
  const response = await quizServiceClient.post<
    BaseResponse<CreateQuizResponseData>
  >('/api/quiz', data);
  return response.data.data!;
};

/**
 * GET /api/quiz/parents/today?limit=10&cursor=xxx
 * 부모용: 오늘의 퀴즈 조회 (cursor 기반 페이지네이션)
 *
 * Query:
 * - limit?: number  // 페이지 크기(기본 20, 최대 50)
 * - cursor?: string // Base64("quizId")
 */
export const getParentTodayQuizzes = async (
  params?: ParentsTodayQueryParam,
): Promise<ParentsTodayResponseData> => {
  const response = await quizServiceClient.get<
    BaseResponse<ParentsTodayResponseData>
  >('/api/quiz/parents/today', {
    params,
  });

  const data = response.data.data;

  if (!data) {
    return {
      items: [],
      nextCursor: null,
      hasNext: false,
    };
  }

  return data;
};

/**
 * GET /api/quiz/parents/completed?limit=10&cursor=xxx
 * 부모용: 완료된 퀴즈 조회 (cursor 기반 페이지네이션)
 *
 * Query:
 * - limit?: number  // 페이지 크기(기본 20, 최대 50)
 * - cursor?: string // Base64("publishDate|quizId")
 */
export const getParentCompletedQuizzes = async (
  params?: ParentsCompletedQueryParam,
): Promise<ParentsCompletedResponseData> => {
  const response = await quizServiceClient.get<
    BaseResponse<ParentsCompletedResponseData>
  >('/api/quiz/parents/completed', {
    params,
  });

  const data = response.data.data;

  if (!data) {
    return {
      items: [],
      nextCursor: null,
      hasNext: false,
    };
  }

  return data;
};

/**
 * GET /api/quiz/parents/scheduled?limit=10&cursor=xxx
 * 부모용: 예정된 퀴즈 조회 (cursor 기반 페이지네이션)
 *
 * Query:
 * - limit?: number  // 페이지 크기(기본 20, 최대 50)
 * - cursor?: string // Base64("publishDate|quizId")
 */
export const getParentScheduledQuizzes = async (
  params?: ParentsScheduledQueryParam,
): Promise<ParentsScheduledResponseData> => {
  const response = await quizServiceClient.get<
    BaseResponse<ParentsScheduledResponseData>
  >('/api/quiz/parents/scheduled', {
    params,
  });

  const data = response.data.data;

  if (!data) {
    return {
      items: [],
      nextCursor: null,
      hasNext: false,
    };
  }

  return data;
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
 * GET /api/quiz/children/today?limit=10&cursor=xxx
 * 자녀용: 오늘의 퀴즈 조회 (cursor 기반 페이지네이션)
 *
 * Query:
 * - limit?: number  // 페이지 크기(기본 20, 최대 50)
 * - cursor?: string // Base64("quizId")
 */
export const getChildTodayQuizzes = async (
  params?: ChildrenTodayQueryParam,
): Promise<ChildrenTodayResponseData> => {
  const response = await quizServiceClient.get<
    BaseResponse<ChildrenTodayResponseData>
  >('/api/quiz/children/today', {
    params,
  });

  const data = response.data.data;

  // 혹시라도 null이면 "빈 페이지"로 처리
  if (!data) {
    return {
      items: [],
      nextCursor: null,
      hasNext: false,
    };
  }

  return data;
};

/**
 * POST /api/quiz/children/:quizId/answer
 * 자녀용: 퀴즈 답변 제출
 */
export const answerQuiz = async (
  quizId: string,
  answer: string,
): Promise<AnswerQuizResponseData> => {
  const response = await quizServiceClient.post<
    BaseResponse<AnswerQuizResponseData>
  >(`/api/quiz/children/${quizId}/answer`, {
    answer,
  });

  // 필요하면 여기서도 null 방어 로직 넣어도 됨
  return response.data.data!;
};

/**
 * GET /api/quiz/children/completed?limit=10&cursor=xxx
 * 자녀용: 완료된 퀴즈 조회 (cursor 기반 페이지네이션)
 *
 * Query:
 * - limit?: number  // 페이지 크기
 * - cursor?: string // Base64("publishDate|quizId")
 */ 
export const getChildCompletedQuizzes = async (
  params?: ChildrenCompletedQueryParam,
): Promise<ChildrenCompletedResponseData> => {
  const response = await quizServiceClient.get<BaseResponse<ChildrenCompletedResponseData>>('/api/quiz/children/completed', {
    params,
  });

  const data = response.data.data;

  // 혹시라도 null이면 "빈 페이지"로 처리
  if (!data) {
    return {
      items: [],
      nextCursor: null,
      hasNext: false,
    };
  }

  return data; 
};
