# PAI Frontend 프로젝트 구조 문서

## 📊 통계
- **총 파일 수**: 62개 (TypeScript/TSX)
- **API 파일**: 10개 (백엔드 MSA 매칭)
- **화면(Screen)**: 22개
- **공용 컴포넌트**: 5개
- **유틸/훅**: 7개

---

## 🗂️ 전체 구조

```
pai-fe-monorepo/
├── src/
│   ├── app/                          # 앱 셸 (전역 부트스트랩)
│   │   ├── navigation/               # React Navigation 설정
│   │   │   ├── RootNavigator.tsx     # 루트 네비게이터
│   │   │   ├── AuthNavigator.tsx     # 인증 네비게이터
│   │   │   ├── ProfileNavigator.tsx  # 프로필 네비게이터
│   │   │   ├── ChildNavigator.tsx    # 자녀 앱 네비게이터
│   │   │   └── ParentNavigator.tsx   # 부모 앱 네비게이터
│   │   ├── providers/
│   │   │   └── query-client.tsx      # TanStack Query Provider
│   │   └── App.tsx                   # 최상위 컴포넌트
│   │
│   ├── api/                          # 백엔드 연결 레이어 (MSA 기반)
│   │   ├── client/
│   │   │   ├── axios.ts              # Axios 인스턴스 (5개 서비스별)
│   │   │   ├── serviceUrls.ts        # 마이크로서비스 URL 관리
│   │   │   └── interceptors.ts       # JWT 토큰 인터셉터, AsyncStorage
│   │   ├── auth.ts                   # 인증 API (pai-service-user)
│   │   ├── profiles.ts               # 프로필 API (pai-service-user)
│   │   ├── conversations.ts          # 대화 API (pai-service-conversation)
│   │   ├── quizzes.ts                # 퀴즈 API (pai-service-quiz)
│   │   ├── insights.ts               # 관심사 분석 API (pai-service-insight)
│   │   ├── recommendations.ts        # 추천 콘텐츠 API (pai-service-insight)
│   │   ├── media.ts                  # 미디어 업로드 API (pai-service-media)
│   │   └── types/
│   │       └── index.ts              # API 타입 정의
│   │
│   ├── design/                       # 디자인 시스템
│   │   ├── components/
│   │   │   ├── Button.tsx            # 공용 버튼 (variant, size, loading)
│   │   │   ├── Card.tsx              # 공용 카드 (elevated, outlined, filled)
│   │   │   ├── Input.tsx             # 공용 인풋 (label, error)
│   │   │   └── Tab.tsx               # 공용 탭 컴포넌트
│   │   ├── layouts/
│   │   │   └── ScreenContainer.tsx   # 공용 화면 레이아웃 (SafeAreaView)
│   │   └── tokens/
│   │       └── index.ts              # 디자인 토큰 (색상, 타이포, 스페이싱)
│   │
│   ├── shared/                       # 재사용 유틸/훅/타입
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts        # 디바운스 훅
│   │   │   └── useInfiniteScroll.ts  # 무한 스크롤 훅
│   │   ├── utils/
│   │   │   ├── date.ts               # 날짜 포맷 유틸
│   │   │   └── validation.ts         # 입력 유효성 검사
│   │   ├── types/
│   │   │   └── index.ts              # 공용 타입 정의
│   │   └── constants/
│   │       └── routes.ts             # 라우트 상수
│   │
│   └── screens/                      # 화면 (페이지)
│       ├── auth/                     # 공통: 인증
│       │   ├── Login/
│       │   │   └── index.tsx         # 로그인 화면
│       │   └── Signup/
│       │       └── index.tsx         # 회원가입 화면
│       │
│       ├── profiles/                 # 공통: 프로필
│       │   ├── Select/
│       │   │   └── index.tsx         # 프로필 선택 화면
│       │   └── Create/
│       │       └── index.tsx         # 프로필 생성 화면
│       │
│       ├── child/                    # 자녀 앱
│       │   ├── Chat/
│       │   │   └── index.tsx         # 대화 목록
│       │   ├── ChatDetail/
│       │   │   └── index.tsx         # 대화 상세
│       │   └── Quiz/
│       │       ├── index.tsx         # 퀴즈 탭 컨테이너
│       │       └── _tabs/
│       │           ├── TodayTab.tsx  # 오늘의 퀴즈
│       │           └── PastTab.tsx   # 지난 퀴즈
│       │
│       └── parent/                   # 부모 앱
│           ├── Chat/
│           │   └── index.tsx         # 대화 목록
│           ├── Quiz/
│           │   ├── index.tsx         # 퀴즈 탭 컨테이너
│           │   └── _tabs/
│           │       ├── TodayTab.tsx     # 오늘의 퀴즈
│           │       ├── PastTab.tsx      # 지난 퀴즈
│           │       └── ScheduledTab.tsx # 예정된 퀴즈
│           ├── Dashboard/
│           │   ├── index.tsx            # 대시보드 탭 컨테이너
│           │   ├── _tabs/
│           │   │   ├── InterestsTab.tsx        # 관심사 분석
│           │   │   ├── ActivityTab.tsx         # 활동 탭
│           │   │   └── RecommendationsTab.tsx  # 추천 콘텐츠
│           │   ├── activity/                   # 활동 서브 라우트
│           │   │   ├── Calendar/
│           │   │   │   └── index.tsx           # 캘린더 화면
│           │   │   ├── Gallery/
│           │   │   │   └── index.tsx           # 갤러리 화면
│           │   │   └── Detail/
│           │   │       └── index.tsx           # 대화 상세 화면
│           │   ├── hooks/
│           │   │   ├── useInterests.ts         # 관심사 데이터 훅
│           │   │   ├── useActivityData.ts      # 활동 데이터 훅
│           │   │   └── useRecommendations.ts   # 추천 데이터 훅
│           │   └── components/
│           │       ├── ActivityCalendar.tsx    # 달력 컴포넌트
│           │       ├── GalleryGrid.tsx         # 갤러리 그리드
│           │       ├── ConversationPreview.tsx # 대화 미리보기
│           │       ├── InterestCloud.tsx       # 워드클라우드
│           │       └── TrendChart.tsx          # 트렌드 차트
│           └── Profile/
│               ├── index.tsx                   # 프로필/설정
│               └── VoiceRegistration.tsx       # 음성 등록
│
├── assets/                           # 정적 리소스
│   ├── images/                       # 이미지 파일
│   └── fonts/                        # 폰트 파일
│
├── index.js                          # React Native 엔트리포인트
├── .env.example                      # 환경 변수 예시
└── README.md                         # 프로젝트 설명서
```

---

## 🔗 백엔드 MSA 매칭

| 프론트 API 파일 | 백엔드 서비스 | 주요 엔드포인트 |
|----------------|--------------|----------------|
| `api/auth.ts` | **pai-service-user** | `POST /api/auth/login`<br>`POST /api/auth/signup`<br>`POST /api/auth/refresh` |
| `api/profiles.ts` | **pai-service-user** | `GET /api/profiles`<br>`POST /api/profiles`<br>`POST /api/profiles/select` |
| `api/conversations.ts` | **pai-service-conversation** | `POST /api/conversations/record`<br>`POST /api/conversations/:id/end`<br>`GET /api/conversations` |
| `api/quizzes.ts` | **pai-service-quiz** | `POST /api/quiz`<br>`GET /api/quiz/parents/today`<br>`POST /api/quiz/children/:id/answer` |
| `api/insights.ts` | **pai-service-insight** | `GET /api/insights/interests/:childId/top`<br>`POST /api/insights/analytics` |
| `api/recommendations.ts` | **pai-service-insight** | `GET /api/insights/recommendations/:childId` |
| `api/media.ts` | **pai-service-media** | `POST /api/media/upload`<br>`GET /api/media` |

---

## 🎨 디자인 시스템

### Tokens (디자인 토큰)
- **Colors**: primary, secondary, background, text, status
- **Typography**: h1~h4, body1~2, caption, button
- **Spacing**: xs(4) ~ xxl(48)
- **BorderRadius**: sm(4) ~ full(9999)
- **Shadows**: sm, md, lg

### Components (공용 컴포넌트)
- **Button**: variant(primary/secondary/outline/ghost), size(sm/md/lg), loading
- **Card**: variant(elevated/outlined/filled), onPress
- **Input**: label, error, secureTextEntry
- **Tab**: tabs, activeTab, onTabChange
- **ScreenContainer**: scrollable, noPadding

---

## 📱 화면 구조

### 인증 플로우
1. **Login** → 로그인 성공 → ProfileSelect
2. **Signup** → 회원가입 성공 → ProfileSelect

### 프로필 플로우
1. **ProfileSelect** → 프로필 선택 → ChildApp 또는 ParentApp
2. **ProfileCreate** → 프로필 생성 → ProfileSelect

### 자녀 앱 (2개 탭)
- **Chat 탭**: 대화 목록 → ChatDetail
- **Quiz 탭**: TodayTab / PastTab

### 부모 앱 (4개 탭)
- **Chat 탭**: 대화 목록
- **Quiz 탭**: TodayTab / PastTab / ScheduledTab
- **Dashboard 탭**:
  - InterestsTab (관심사 분석)
  - ActivityTab (활동 → Calendar → Gallery → Detail)
  - RecommendationsTab (추천 콘텐츠)
- **Profile 탭**: 설정, 음성 등록

---

## 🛠️ 주요 기능별 구현 위치

### 인증 (Authentication)
- **파일**: `api/auth.ts`, `api/client/interceptors.ts`
- **화면**: `screens/auth/Login`, `screens/auth/Signup`
- **저장소**: AsyncStorage (`@pai:access_token`, `@pai:refresh_token`)

### 프로필 관리
- **파일**: `api/profiles.ts`
- **화면**: `screens/profiles/Select`, `screens/profiles/Create`
- **기능**: 부모/자녀 프로필 생성, 아바타 업로드, PIN 설정

### 대화 (Conversation)
- **파일**: `api/conversations.ts`
- **화면**: `screens/child/Chat`, `screens/parent/Dashboard/activity/`
- **흐름**: 실시간 기록(Redis) → 종료 시 DB 저장 → 목록 조회

### 퀴즈 (Quiz)
- **파일**: `api/quizzes.ts`
- **화면**: `screens/child/Quiz`, `screens/parent/Quiz`
- **기능**: 부모 출제 → 자녀 답변 → 정답 체크 → 보상

### 인사이트 (대시보드)
- **파일**: `api/insights.ts`, `api/recommendations.ts`
- **화면**: `screens/parent/Dashboard`
- **기능**:
  - 관심사 분석 (워드클라우드, 트렌드)
  - 활동 캘린더 (날짜별 대화 이벤트)
  - 추천 콘텐츠 (관심사 기반)

### 미디어
- **파일**: `api/media.ts`
- **기능**: 이미지/음성 파일 업로드 → S3 → CDN URL 반환

---

## 📦 필수 라이브러리

```bash
# Core
npm install react-native
npm install react

# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-safe-area-context react-native-screens

# State Management
npm install @tanstack/react-query

# HTTP Client
npm install axios

# Storage
npm install @react-native-async-storage/async-storage

# Network
npm install @react-native-community/netinfo

# Environment
npm install react-native-config
```

### 선택 라이브러리
```bash
# 이미지 선택
npm install react-native-image-picker

# 달력
npm install react-native-calendars

# 차트
npm install react-native-chart-kit react-native-svg

# 음성 녹음
npm install react-native-audio-recorder-player
```

---

## 🚀 다음 단계

### 1. 디자인 코드 삽입
각 화면 파일의 `// TODO: 디자인 코드 삽입 위치` 주석에 UI 코드 작성

### 2. API 연동
- TanStack Query 훅 구현 (`useQuery`, `useMutation`, `useInfiniteQuery`)
- 각 화면에서 API 호출 로직 추가

### 3. 네비게이션 완성
- 파라미터 타입 정의
- 화면 전환 로직 구현

### 4. 에러 핸들링
- 공통 에러 처리
- 로딩/에러 상태 UI

### 5. 테스트
- 단위 테스트
- 통합 테스트
- E2E 테스트

---

## 📝 주요 설계 원칙

1. **Co-location**: 관련 파일들을 가까이 배치 (예: Dashboard 내 hooks, components)
2. **MSA 매칭**: 백엔드 마이크로서비스별 API 파일 분리
3. **디자인 시스템**: 공용 컴포넌트와 토큰으로 일관성 유지
4. **타입 안전성**: TypeScript 활용
5. **재사용성**: shared/ 폴더에 도메인 중립적 코드 배치
