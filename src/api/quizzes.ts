import { quizServiceClient } from './client/axios';
import type {
  BaseResponse,

  ChildrenTodayQueryParam,
  ChildrenTodayResponseData,
  ChildrenCompletedQueryParam,
  ChildrenCompletedResponseData,
  AnswerQuizPathParam,
  AnswerQuizRequestDto,
  AnswerQuizResponseData,

  ParentsTodayQueryParam,
  ParentsTodayResponseData,
  ParentsCompletedQueryParam,
  ParentsCompletedResponseData,
  ParentsScheduledQueryParam,
  ParentsScheduledResponseData,
  CreateQuizRequestDto,
  CreateQuizResponseData,
  NextPublishDateData,
  ParentsQuizDetailPathParam,
  ParentsQuizDetailResponseData,
  UpdateQuizPathParam,
  UpdateQuizRequestDto,
  UpdateQuizResponseData,
  DeleteQuizPathParam,
  DeleteQuizResponseData,
  ParentsGrantRewardPathParam,
  ParentsGrantRewardRequestDto,
  ParentsGrantRewardResponseData,
} from 'pai-shared-types';


// ========== 부모용 API ==========

// 부모용 오늘의 퀴즈 조회: GET /api/quiz/parents/today?limit=10&cursor=xxx
export const getParentTodayQuizzes = async (params?: ParentsTodayQueryParam): Promise<ParentsTodayResponseData> => {
  const response = 
    await quizServiceClient.get<BaseResponse<ParentsTodayResponseData>>(
      '/api/quiz/parents/today', {params}
    );
  
  const data = response.data.data;

  if (!data) {
    return {
      items: [],
      nextCursor: null,
      hasNext: false,
    };
  }

  return data;
}

// 부모용 완료된 퀴즈 조회: GET /api/quiz/parents/completed?limit=10&cursor=xxx
export const getParentCompletedQuizzes = async (params?: ParentsCompletedQueryParam): Promise<ParentsCompletedResponseData> => {
  const response = 
    await quizServiceClient.get<BaseResponse<ParentsCompletedResponseData>>(
      '/api/quiz/parents/completed', {params}
    );

  const data = response.data.data;

  if (!data) {
    return {
      items: [],
      nextCursor: null,
      hasNext: false,
    }
  }

  return data;
}

// 부모용 예정된 퀴즈 조회: GET /api/quiz/parents/scheduled?limit=10&cursor=xxx
export const getParentScheduledQuizzes = async (params?: ParentsScheduledQueryParam): Promise<ParentsScheduledResponseData> => {
  const response = 
    await quizServiceClient.get<BaseResponse<ParentsScheduledResponseData>>(
      '/api/quiz/parents/scheduled', {params}
    );

  const data = response.data.data;

  if (!data) {
    return {
      items: [],
      nextCursor: null,
      hasNext: false,
    }
  }

  return data;
}

// 출제일 기본값 조회: GET /api/quiz/next-publish-date
export const getNextPublishDate = async (): Promise<NextPublishDateData> => {
  const response =
    await quizServiceClient.get<BaseResponse<NextPublishDateData>>(
      '/api/quiz/next-publish-date',
    );

  return response.data.data!;
}

// 퀴즈 생성: POST /api/quiz
export const createQuiz = async (data: CreateQuizRequestDto): Promise<CreateQuizResponseData> => {
  const response = 
    await quizServiceClient.post<BaseResponse<CreateQuizResponseData>>(
      '/api/quiz', data
    );

  return response.data.data!;
}

// 퀴즈 상세 조회(수정용): GET /api/quiz/:quizId
export const getQuizDetail = async (params: ParentsQuizDetailPathParam): Promise<ParentsQuizDetailResponseData> => {
  const { quizId } = params;
  const response = 
    await quizServiceClient.get<BaseResponse<ParentsQuizDetailResponseData>>(
      `/api/quiz/${quizId}`
    );
  
  return response.data.data!;
}

// 퀴즈 수정: PATCH /api/quiz/:quizId
export const updateQuiz = async (params: UpdateQuizPathParam, data: UpdateQuizRequestDto): Promise<UpdateQuizResponseData> => {
  const { quizId } = params;
  const response =
    await quizServiceClient.patch<BaseResponse<UpdateQuizResponseData>>(
      `/api/quiz/${quizId}`, data
    );

  return response.data.data!;
}

// 퀴즈 삭제: DELETE /api/quiz/:quizId
export const deleteQuiz = async (params: DeleteQuizPathParam): Promise<DeleteQuizResponseData> => {
  const { quizId } = params;
  const response =
    await quizServiceClient.delete<BaseResponse<DeleteQuizResponseData>>(
      `/api/quiz/${quizId}`
    );

  return response.data.data!;
}

// 보상 지급: PATCH /api/quiz/:quizId/:childProfileId/reward
export const grantQuizReward = async (params: ParentsGrantRewardPathParam, data: ParentsGrantRewardRequestDto): Promise<ParentsGrantRewardResponseData> => {
  const { quizId, childProfileId } = params;
  const response = 
    await quizServiceClient.patch<BaseResponse<ParentsGrantRewardResponseData>>(
      `/api/quiz/${quizId}/${childProfileId}/reward`, data
    );

  return response.data.data!;
}

// ========== 자녀용 API ==========

// 자녀용 오늘의 퀴즈 조회: GET /api/quiz/children/today?limit=10&cursor=xxx
export const getChildTodayQuizzes = async (params?: ChildrenTodayQueryParam): Promise<ChildrenTodayResponseData> => {
  const response = 
    await quizServiceClient.get<BaseResponse<ChildrenTodayResponseData>>(
      '/api/quiz/children/today', {params}
    );

  const data = response.data.data;

  if (!data) {
    return {
      items: [],
      nextCursor: null,
      hasNext: false,
    }
  }

  return data;
}

// 자녀용 완료된 퀴즈 조회: GET /api/quiz/children/completed?limit=10&cursor=xxx
export const getChildCompletedQuizzes = async (params?: ChildrenCompletedQueryParam): Promise<ChildrenCompletedResponseData> => {
  const response = 
    await quizServiceClient.get<BaseResponse<ChildrenCompletedResponseData>>(
      '/api/quiz/children/completed', {params}
    );

  const data = response.data.data;

  if (!data) {
    return {
      items: [],
      nextCursor: null,
      hasNext: false,
    }
  }

  return data;
}

// 자녀용 퀴즈 제출: POST /api/quiz/children/:quizId/answer
export const answerQuiz = async (params: AnswerQuizPathParam, data: AnswerQuizRequestDto): Promise<AnswerQuizResponseData> => {
  const { quizId } = params;
  const response = 
    await quizServiceClient.post<BaseResponse<AnswerQuizResponseData>>(
      `/api/quiz/children/${quizId}/answer`, data
    );

  return response.data.data!;
}

/**
 * GET → body 없음 → 2번째 인자가 config라서 {params}로 감싸 줌
 * POST/PATCH/DELETE → 2번째 인자가 body(data), config는 3번째 인자 → 그래서 data는 그냥 그대로 넘김
 */