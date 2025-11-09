/**
 * useDebounce 훅
 *
 * 입력값 변경을 지연시켜 API 호출 횟수 감소
 *
 * 사용처:
 * - 검색 인풋 (타이핑 중 API 호출 방지)
 * - 자동완성
 *
 * 사용 예시:
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // API 호출
 *   }
 * }, [debouncedSearchTerm]);
 */

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
