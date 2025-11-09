# Assets 폴더

정적 리소스 관리 폴더

## 구조

```
assets/
  images/        # 이미지 파일 (PNG, JPG, SVG 등)
  fonts/         # 커스텀 폰트 파일 (TTF, OTF 등)
```

## 사용법

### 이미지
```tsx
import logoImage from '@/assets/images/logo.png';

<Image source={logoImage} />
```

### 폰트
1. fonts/ 폴더에 폰트 파일 추가
2. react-native.config.js에서 폰트 경로 설정
3. `npx react-native-asset` 실행
4. design/tokens/index.ts에서 fontFamily 사용
