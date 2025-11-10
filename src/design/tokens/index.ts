/**
 * 디자인 토큰 (Design_v2 기반)
 *
 * 앱 전체에서 사용하는 색상, 스페이싱, 타이포그래피 등 정의
 * Parent-Child AI App Design_v2의 globals.css를 React Native용으로 변환
 *
 * 사용 예시:
 * import { colors, spacing, typography } from '@/design/tokens';
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     padding: spacing.md,
 *     backgroundColor: colors.background,
 *   },
 *   title: {
 *     ...typography.h1,
 *     color: colors.foreground,
 *   },
 * });
 */

export const colors = {
  // ===== Design System Base Colors (shadcn/ui style) =====

  // Primary color - 거의 검정색 (기본 텍스트/버튼)
  primary: '#030213',
  primaryForeground: '#FFFFFF',

  // Secondary color - 밝은 회색
  secondary: '#F2F2F7',
  secondaryForeground: '#030213',

  // Background colors
  background: '#FFFFFF',
  foreground: '#030213',

  // Card colors
  card: '#FFFFFF',
  cardForeground: '#030213',

  // Popover colors
  popover: '#FFFFFF',
  popoverForeground: '#030213',

  // Muted colors (비활성/보조 요소)
  muted: '#ECECF0',
  mutedForeground: '#717182',

  // Accent colors (강조 배경)
  accent: '#E9EBEF',
  accentForeground: '#030213',

  // Destructive/Error colors
  destructive: '#D4183D',
  destructiveForeground: '#FFFFFF',

  // Border & Input colors
  border: 'rgba(0, 0, 0, 0.1)',
  input: 'transparent',
  inputBackground: '#F3F3F5',

  // Ring (focus outline) color
  ring: '#B5B5B5',

  // Switch background
  switchBackground: '#CBCED4',

  // ===== Auth Colors (로그인/회원가입) =====
  auth: {
    from: '#1e3a8a', // 네이비
    to: '#3b82f6',   // 블루
    sparkle: 'rgba(255, 255, 255, 0.8)', // Sparkle 효과용
  },

  // ===== Parent Mode Colors =====
  parent: {
    from: '#5B9BD5',
    to: '#667BC6',
    light: '#4A8BC2',
    primary: '#2563eb', // blue-600
    background: '#eff6ff', // blue-50
    backgroundSecondary: '#e0e7ff', // indigo-50
  },

  // ===== Child Mode Colors =====
  child: {
    from: '#FFD93D', // 노란색
    to: '#6BCF7F',   // 초록색
    primary: '#FFD93D',
    background: '#FFF9E6', // 밝은 크림색
    cardBackground: '#FFFFFF',
    // Legacy colors
    pink: '#FF6B9D',
    coral: '#FFA06B',
    bg1: '#FFE5E0',
    bg2: '#FFF0ED',
  },

  // ===== Chart Colors =====
  chart: {
    1: '#E69F5C', // orange
    2: '#6BA5A5', // teal
    3: '#4D5F7A', // blue-gray
    4: '#E8D77E', // yellow
    5: '#D9C473', // gold
  },

  // ===== Sidebar Colors =====
  sidebar: {
    background: '#FAFAFA',
    foreground: '#030213',
    primary: '#030213',
    primaryForeground: '#FAFAFA',
    accent: '#F5F5F5',
    accentForeground: '#303030',
    border: '#E5E5E5',
    ring: '#B5B5B5',
  },

  // ===== Status Colors =====
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#D4183D',
    info: '#2196F3',
  },

  // ===== Shadow Colors =====
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },

  // ===== Legacy/Helper Colors (하위 호환성) =====
  text: {
    primary: '#030213',
    secondary: '#717182',
    tertiary: '#9E9E9E',
    inverse: '#FFFFFF',
  },

  // ===== Dark Mode Colors (미래 다크모드 지원용) =====
  dark: {
    background: '#030213',
    foreground: '#FAFAFA',
    card: '#030213',
    cardForeground: '#FAFAFA',
    popover: '#030213',
    popoverForeground: '#FAFAFA',
    primary: '#FAFAFA',
    primaryForeground: '#303030',
    secondary: '#424242',
    secondaryForeground: '#FAFAFA',
    muted: '#424242',
    mutedForeground: '#B5B5B5',
    accent: '#424242',
    accentForeground: '#FAFAFA',
    destructive: '#8B1E3F',
    destructiveForeground: '#E69898',
    border: '#424242',
    input: '#424242',
    ring: '#707070',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ===== Font Families =====
export const fonts = {
  // Child mode - 귀여운 손글씨 스타일
  child: 'Ownglyph',

  // Parent mode - 깔끔한 한글 폰트
  parent: 'GyeonggiTitle',

  // Default system font
  default: 'System',
} as const;

export const typography = {
  // Heading (Design_v2 기준 - line-height 1.5배)
  h1: {
    fontSize: 32,
    fontWeight: '500' as const, // medium
    lineHeight: 48, // 32 * 1.5
  },
  h2: {
    fontSize: 28,
    fontWeight: '500' as const,
    lineHeight: 42, // 28 * 1.5
  },
  h3: {
    fontSize: 24,
    fontWeight: '500' as const,
    lineHeight: 36, // 24 * 1.5
  },
  h4: {
    fontSize: 20,
    fontWeight: '500' as const,
    lineHeight: 30, // 20 * 1.5
  },

  // Body
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24, // 16 * 1.5
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 21, // 14 * 1.5
  },

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18, // 12 * 1.5
  },

  // Button
  button: {
    fontSize: 16,
    fontWeight: '500' as const, // medium (원본에 맞춤)
    lineHeight: 24,
  },

  // Label
  label: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
} as const;

export const borderRadius = {
  // Design_v2 기준: --radius: 0.625rem (10px)
  sm: 6,   // --radius-sm: calc(var(--radius) - 4px)
  md: 8,   // --radius-md: calc(var(--radius) - 2px)
  lg: 10,  // --radius-lg: var(--radius)
  xl: 14,  // --radius-xl: calc(var(--radius) + 4px)
  '2xl': 20, // rounded-2xl
  '3xl': 24, // rounded-3xl (로그인 카드 등)
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  // 로그인 카드, 중요 UI 요소용
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  // shadow-2xl (로그인 화면)
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 16,
  },
} as const;

// ===== Sparkle Effect Configuration =====
// 버튼과 탭의 별똥별 효과 설정
export const sparkleEffect = {
  // 작은 sparkle (버튼용)
  small: [
    { x: '15%', y: '25%', size: 1.5, opacity: 0.8 },
    { x: '65%', y: '75%', size: 1.5, opacity: 0.6 },
    { x: '85%', y: '15%', size: 1.5, opacity: 0.7 },
    { x: '35%', y: '85%', size: 1.5, opacity: 0.5 },
    { x: '50%', y: '50%', size: 1, opacity: 0.6 },
    { x: '90%', y: '65%', size: 1.5, opacity: 0.6 },
    { x: '25%', y: '60%', size: 1, opacity: 0.5 },
  ],
  // 중간 sparkle (탭용)
  medium: [
    { x: '20%', y: '30%', size: 1, opacity: 0.8 },
    { x: '60%', y: '70%', size: 1, opacity: 0.6 },
    { x: '80%', y: '20%', size: 1, opacity: 0.7 },
    { x: '40%', y: '80%', size: 1, opacity: 0.5 },
    { x: '90%', y: '60%', size: 1, opacity: 0.6 },
  ],
  color: 'rgba(255, 255, 255, 0.8)',
} as const;
