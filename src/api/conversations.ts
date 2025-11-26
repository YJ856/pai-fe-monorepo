import { conversationServiceClient } from './client/axios';
import { 
  BaseResponse,
  RecordConversationRequestDto,
  RecordConversationResponseData,

  EndConversationPathParam,
  EndConversationResponseData,

  GetConversationsCalendarQueryParam,
  GetConversationsCalendarResponseData,

  GetConversationsQueryParam,
  GetConversationsResponseData,

  GetConversationDetailResponseData,

 } from 'pai-shared-types';


// 대화 기록: POST /api/conversations/record
export const recordConversation = async (data: RecordConversationRequestDto): Promise<RecordConversationResponseData> => {
  const response = 
    await conversationServiceClient.post<BaseResponse<RecordConversationResponseData>>(
      '/api/conversations/record', data
    );

  return response.data.data!;
}

// 대화 종료: POST /api/conversations/:conversationSessionId/end
export const endConversation = async (params: EndConversationPathParam): Promise<EndConversationResponseData> => {
  const { conversationSessionId } = params;
  const response = 
    await conversationServiceClient.post<BaseResponse<EndConversationResponseData>>(
      `/api/conversations/${conversationSessionId}/end`
    );

  return response.data.data!;
}

// 월별 캘린더용 요약 조회: GET /api/conversations/calendar
export const getConversationsCalendar = async (params: GetConversationsCalendarQueryParam): Promise<GetConversationsCalendarResponseData> => {
  const response =
    await conversationServiceClient.get<BaseResponse<GetConversationsCalendarResponseData>>(
      '/api/conversations/calendar', {params}
    );

  return response.data.data!;
}

// 특정 날짜 + 특정 아이의 대화 목록 조회: GET /api/conversations
export const getConversationsByDate = async (params: GetConversationsQueryParam): Promise<GetConversationsResponseData> => {
  const response = 
    await conversationServiceClient.get<BaseResponse<GetConversationsResponseData>>(
      '/api/conversations', {params}
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

// 상세 대화 내용 조회: GET /api/conversations/:conversationId
export const getConversationDetail = async (conversationId: string): Promise<GetConversationDetailResponseData> => {
  const response =
    await conversationServiceClient.get<BaseResponse<GetConversationDetailResponseData>>(
      `/api/conversations/${conversationId}`, 
    );
  
  return response.data.data!;
}