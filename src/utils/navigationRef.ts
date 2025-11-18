/**
 * Navigation Reference
 * - React Navigation의 전역 navigation ref
 * - Axios 인터셉터 등 컴포넌트 외부에서 네비게이션 제어를 위해 사용
 *
 * 공식 문서: https://reactnavigation.org/docs/navigating-without-navigation-prop/
 */

import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

/**
 * 컴포넌트 외부에서 네비게이션 실행
 * @param name 화면 이름 (예: 'Auth', 'Profile')
 * @param params 화면에 전달할 파라미터
 */
export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  } else {
    console.warn('[NavigationRef] Navigation is not ready yet');
  }
}

/**
 * 현재 스택을 리셋하고 특정 화면으로 이동
 * @param name 화면 이름
 */
export function reset(name: string) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: name as never }],
    });
  } else {
    console.warn('[NavigationRef] Navigation is not ready yet');
  }
}
