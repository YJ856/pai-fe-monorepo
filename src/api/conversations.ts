/**
 * 대화 API
 *
 * 백엔드: pai-service-conversation (/api/conversations)
 *
 * 주요 기능:
 * - 실시간 대화 기록 (Redis 임시 저장)
 * - 대화 종료 및 DB 영구 저장
 * - 대화 목록 조회 (페이지네이션)
 * - 대화 상세 조회 (질문-답변 목록)
 *
 * 대화 흐름:
 * 1. recordConversation() 반복 호출 (실시간 대화 중)
 * 2. endConversation() 호출 (대화 종료 시 DB 저장)
 * 3. getConversations() 조회 (대화 목록)
 * 4. getConversationDetail() 조회 (대화 상세)
 */

import { conversationServiceClient } from './client/axios';

/**
 * POST /api/conversations/record
 * 실시간 대화 기록 (Redis 임시 저장)
 *
 * Request:
 * - conversationSessionId: string (세션 고유 ID)
 * - childProfileId: string
 * - questionText: string
 * - answerText: string
 * - imageMediaId?: string (질문 이미지)
 * - keyword?: string (키워드 추출)
 */
export const recordConversation = async (data: {
  conversationSessionId: string;
  childProfileId: string;
  questionText: string;
  answerText: string;
  imageMediaId?: string;
  keyword?: string;
}) => {
  const response = await conversationServiceClient.post('/api/conversations/record', data);
  return response.data;
};

/**
 * POST /api/conversations/:conversationSessionId/end
 * 대화 종료 및 DB 영구 저장
 *
 * Redis에 임시 저장된 대화 내용을 DB로 옮기고
 * 첫 번째 이미지를 대표 이미지로 설정
 */
export const endConversation = async (conversationSessionId: string) => {
  const response = await conversationServiceClient.post(
    `/api/conversations/${conversationSessionId}/end`
  );
  return response.data.data;
};

/**
 * GET /api/conversations?childProfileId=&page=1&limit=10
 * 대화 목록 조회 (페이지네이션)
 *
 * Query:
 * - childProfileId: string (필수)
 * - page: number (기본값: 1)
 * - limit: number (기본값: 10)
 *
 * Response:
 * - conversations: Array<{
 *     id: string,
 *     title: string,
 *     startDate: string,
 *     firstMediaId: string (썸네일용)
 *   }>
 * - totalCount: number
 * - totalPages: number
 */
export const getConversations = async (params: {
  childProfileId: string;
  page?: number;
  limit?: number;
}) => {
  const response = await conversationServiceClient.get('/api/conversations', {
    params: {
      page: 1,
      limit: 10,
      ...params,
    },
  });
  return response.data.data;
};

/**
 * GET /api/conversations/:conversationId
 * 대화 상세 조회 (질문-답변 목록)
 *
 * Response:
 * - conversation: {
 *     id: string,
 *     title: string,
 *     startDate: string,
 *     questions: Array<{
 *       questionOrder: number,
 *       questionText: string,
 *       imageMediaId?: string,
 *       keyword?: string,
 *       answer: {
 *         answerText: string
 *       }
 *     }>
 *   }
 */
export const getConversationDetail = async (conversationId: string) => {
  const response = await conversationServiceClient.get(`/api/conversations/${conversationId}`);
  return response.data.data;
};
