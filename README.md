# PAI Frontend (React Native + Expo)

부모-자녀 상호작용 AI 앱 프론트엔드 (Expo CLI 기반)

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start

# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android
```

## 프로젝트 구조

```
src/
├── app/                    # 앱 셸 (전역 부트스트랩)
│   ├── navigation/         # React Navigation 설정
│   ├── providers/          # Query Client, Context Providers
│   └── App.tsx             # 최상위 컴포넌트
│
├── api/                    # 백엔드 연결 레이어 (MSA 기반)
│   ├── client/             # Axios 인스턴스, 인터셉터
│   ├── auth.ts             # 인증 API
│   ├── profiles.ts         # 프로필 API
│   ├── conversations.ts    # 대화 API
│   ├── quizzes.ts          # 퀴즈 API
│   ├── insights.ts         # 관심사 분석 API
│   ├── recommendations.ts  # 추천 콘텐츠 API
│   └── media.ts            # 미디어 업로드 API
│
├── design/                 # 디자인 시스템
│   ├── components/         # 공용 UI 컴포넌트 (Button, Card, Input 등)
│   ├── layouts/            # 레이아웃 컴포넌트 (ScreenContainer 등)
│   └── tokens/             # 디자인 토큰 (색상, 타이포, 스페이싱)
│
├── shared/                 # 재사용 유틸/훅/타입
│   ├── hooks/              # useDebounce, useInfiniteScroll 등
│   ├── utils/              # date, validation 유틸
│   ├── types/              # 공용 타입 정의
│   └── constants/          # routes 상수
│
├── screens/                # 화면 (페이지)
│   ├── auth/               # 로그인, 회원가입
│   ├── profiles/           # 프로필 선택, 생성
│   ├── child/              # 자녀 앱 (대화, 퀴즈)
│   └── parent/             # 부모 앱 (대화, 퀴즈, 대시보드, 프로필)
│       └── Dashboard/      # 대시보드 (관심사, 활동, 추천)
│           ├── _tabs/      # 탭 컴포넌트
│           ├── activity/   # 활동 서브 라우트 (캘린더, 갤러리, 상세)
│           ├── hooks/      # 대시보드 전용 훅
│           └── components/ # 대시보드 전용 컴포넌트
│
└── assets/                 # 정적 리소스 (이미지, 폰트)
```

## 백엔드 MSA 구조 매칭

| 프론트 API 파일 | 백엔드 서비스 | 엔드포인트 |
|----------------|--------------|-----------|
| `api/auth.ts` | pai-service-user | `/api/auth/*` |
| `api/profiles.ts` | pai-service-user | `/api/profiles/*` |
| `api/conversations.ts` | pai-service-conversation | `/api/conversations/*` |
| `api/quizzes.ts` | pai-service-quiz | `/api/quiz/*` |
| `api/insights.ts` | pai-service-insight | `/api/insights/*` |
| `api/recommendations.ts` | pai-service-insight | `/api/insights/recommendations/*` |
| `api/media.ts` | pai-service-media | `/api/media/*` |

## 주요 기술 스택

- **React Native** - 모바일 앱 프레임워크
- **React Navigation** - 네비게이션
- **TanStack Query** - 서버 상태 관리
- **Axios** - HTTP 클라이언트
- **AsyncStorage** - 로컬 스토리지 (토큰 저장)
- **TypeScript** - 타입 안정성

## 설치 및 실행

```bash
# 의존성 설치
npm install

# iOS 실행
npm run ios

# Android 실행
npm run android
```

## 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일 생성 후 마이크로서비스 URL 설정

```bash
cp .env.example .env
```

## 디자인 코드 삽입 가이드

각 화면/컴포넌트 파일에 `// TODO: 디자인 코드 삽입 위치` 주석이 있습니다.
해당 위치에 UI 코드를 작성하시면 됩니다.

## 라이브러리 설치 필요

```bash
# 필수 라이브러리
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-safe-area-context react-native-screens
npm install @tanstack/react-query
npm install axios
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
npm install react-native-config

# 선택 라이브러리 (기능별)
npm install react-native-image-picker              # 이미지 선택
npm install react-native-calendars                 # 달력
npm install react-native-chart-kit react-native-svg # 차트
npm install react-native-audio-recorder-player     # 음성 녹음
```

## 다음 단계

1. 각 화면에 디자인 코드 삽입
2. TanStack Query 훅 구현 (useQuery, useMutation, useInfiniteQuery)
3. 네비게이션 파라미터 타입 정의 완성
4. 에러 핸들링 추가
5. 로딩/에러 상태 UI 추가
