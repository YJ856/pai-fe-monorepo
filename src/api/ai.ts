import { aiServiceClient } from "./client/axios";

// VQA 요청 타입
export interface VqaRequestDto {
  media_id: string;
  question: string;
}

// VQA 응답 타입
export interface VqaResponseData {
  answer: string;
  keywords: string[];
}

// VQA 답변 받기: POST /api/ai/vqa/
export const getVqaAnswer = async (
  data: VqaRequestDto
): Promise<VqaResponseData> => {
  const response = await aiServiceClient.post<VqaResponseData>(
    "/api/ai/vqa/",
    data
  );

  return response.data;
};