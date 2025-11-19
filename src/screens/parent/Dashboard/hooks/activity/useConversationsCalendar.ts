/**
 * 부모 대시보드 - 대화 캘린더 요약 Custom Hook
 *
 * 역할:
 * - 특정 연/월 기준으로 자녀별 대화 개수 요약 조회 (useQuery)
 * - 로딩/에러/결과 상태를 한 번에 반환
 *
 * API:
 * - GET /api/conversations/calendar
 */

import { useQuery } from "@tanstack/react-query";
import { getConversationsCalendar } from "@/api/conversations";
import type { GetConversationsCalendarQueryParam, GetConversationsCalendarResponseData } from "pai-shared-types";

export function useConversationsCalendar(params: GetConversationsCalendarQueryParam) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<GetConversationsCalendarResponseData, Error>({
    queryKey: ['parent-conversations', 'calendar', params],
    queryFn: () => getConversationsCalendar(params),
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });

  return {

    calendar: data ?? null,
  
    days: data?.days ?? [],
    totalCount: data?.totalCount ?? 0,
    year: data?.year ?? params.year,
    month: data?.month ?? params.month,

    // 상태
    isLoading,
    isError,
    error,
  };
}