/**
 * 날짜 유틸리티
 *
 * 날짜 포맷팅, 한국 시간(KST) 변환 등
 *
 * 주요 함수:
 * - formatDate: 날짜를 원하는 형식으로 포맷팅
 * - formatKST: 한국 시간으로 변환
 * - getYMD: YYYY-MM-DD 형식 반환
 * - isToday: 오늘 날짜인지 확인
 * - isSameDay: 두 날짜가 같은 날인지 확인
 */

/**
 * 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getYMD(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 날짜를 YYYY년 MM월 DD일 형식으로 반환
 */
export function formatKoreanDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 시간을 HH:MM 형식으로 반환
 */
export function getHHMM(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 오늘 날짜인지 확인
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return isSameDay(date, today);
}

/**
 * 두 날짜가 같은 날인지 확인
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * ISO 문자열을 Date 객체로 변환
 */
export function parseISOString(isoString: string): Date {
  return new Date(isoString);
}

/**
 * 상대 시간 표시 (몇 분 전, 몇 시간 전 등)
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return getYMD(date);
}
