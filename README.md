## 개요

- 부모-자녀 상호작용 AI 앱(React Native + Expo)
- 부모 : 대화/퀴즈 생성/대시 보드
- 자녀: AI 대화/ 퀴즈 풀이
- 백엔드: MSA (5개 서비스 연동)

## 빠른 시작

```bash
npm install
cp .env.example .env
npm start
npm run ios / npm run android / npm run web
```

## 주요 디렉터리

| 폴더                             | 역할                                        |
| -------------------------------- | ------------------------------------------- |
| `src/app/`                       | 앱 루트, 네비게이션 구조                    |
| `src/api/`                       | MSA API 연동 (Axios 인스턴스 5개)           |
| `src/design/`                    | 디자인 시스템 (컴포넌트 + 토큰 6000줄)      |
| `src/screens/`                   | 부모/자녀 앱 화면 구조                      |
| `src/shared/`                    | hooks, utils, constants, types 등 공용 코드 |
| `src/assets/`                    | 이미지, 폰트 리소스                         |
| `android/`                       | Android 빌드 설정                           |
| `.expo/`                         | Expo 캐시                                   |
| `Parent-Child AI App Design_v2/` | Figma 디자인 참조                           |

---

## API 구성

| 파일                 | 서비스       | 주요 기능        |
| -------------------- | ------------ | ---------------- |
| `auth.ts`            | user         | 로그인/회원가입  |
| `profiles.ts`        | user         | 프로필 CRUD      |
| `conversations.ts`   | conversation | 대화 녹음, 목록  |
| `quizzes.ts`         | quiz         | 퀴즈 생성/풀이   |
| `insights.ts`        | insight      | 분석/관심사      |
| `recommendations.ts` | insight      | 추천 콘텐츠      |
| `media.ts`           | media        | 파일 업로드/조회 |

---

## 네비게이션 구조

- AuthNavigator: 로그인/회원가입
- ParentNavigator: 부모 (대화, 퀴즈, 대시보드, 프로필)
- ChildNavigator: 자녀 (AI대화, 퀴즈, 대시보드)
- ProfileNavigator: 프로필 생성/선택

---

## 기술 스택

- React Native / Expo / TypeScript
- React Navigation (stack, taps)
- TanStack Query (서버 상태)
- Axios + AsyncStorage
- Lucide, Linear Gradient, SVG
- Expo AV, Image Picker

## BaseResponse 구조

- 모든 API 응답은 pai-shared-types에 정의된 interface로 래핑된다.
  np
