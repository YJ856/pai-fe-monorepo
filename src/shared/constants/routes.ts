/**
 * 라우트 상수 정의
 *
 * React Navigation의 화면 이름을 상수로 관리
 * 문자열 하드코딩 방지 및 타입 안전성 확보
 *
 * 사용 예시:
 * navigation.navigate(ROUTES.CHILD.CHAT);
 * navigation.navigate(ROUTES.PARENT.DASHBOARD, { tab: 'interests' });
 */

export const ROUTES = {
  // 인증
  AUTH: {
    LOGIN: 'Login',
    SIGNUP: 'Signup',
  },

  // 프로필
  PROFILES: {
    SELECT: 'ProfileSelect',
    CREATE: 'ProfileCreate',
  },

  // 자녀 앱
  CHILD: {
    CHAT: 'ChildChat',
    CHAT_DETAIL: 'ChildChatDetail',
    QUIZ: 'ChildQuiz',
  },

  // 부모 앱
  PARENT: {
    CHAT: 'ParentChat',
    QUIZ: 'ParentQuiz',
    DASHBOARD: 'ParentDashboard',
    PROFILE: 'ParentProfile',

    // 대시보드 서브 라우트
    DASHBOARD_ACTIVITY_CALENDAR: 'ActivityCalendar',
    DASHBOARD_ACTIVITY_GALLERY: 'ActivityGallery',
    DASHBOARD_ACTIVITY_DETAIL: 'ActivityDetail',
  },
} as const;

// 타입 추론을 위한 유틸리티 타입
export type RouteNames = typeof ROUTES[keyof typeof ROUTES];
