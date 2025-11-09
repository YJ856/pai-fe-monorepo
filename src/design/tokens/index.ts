/**
 * 디자인 토큰
 *
 * 앱 전체에서 사용하는 색상, 스페이싱, 타이포그래피 등 정의
 * React Native StyleSheet에서 사용
 *
 * 사용 예시:
 * import { colors, spacing, typography } from '@/design/tokens';
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     padding: spacing.md,
 *     backgroundColor: colors.background.primary,
 *   },
 *   title: {
 *     ...typography.h1,
 *     color: colors.text.primary,
 *   },
 * });
 */

export const colors = {
  // Primary 색상 (Auth - Navy to Blue gradient)
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#1e3a8a', // 네이비 (로그인)
  },

  // Auth gradient colors
  auth: {
    from: '#1e3a8a', // 네이비
    to: '#3b82f6',   // 블루
  },

  // Parent mode colors (Blue gradient)
  parent: {
    from: '#5B9BD5',
    to: '#667BC6',
    light: '#4A8BC2',
  },

  // Child mode colors (Pink/Coral gradient)
  child: {
    from: '#FF6B9D',
    to: '#FFA06B',
    bg1: '#FFE5E0',
    bg2: '#FFF0ED',
  },

  // Secondary 색상
  secondary: {
    50: '#FCE4EC',
    100: '#F8BBD0',
    200: '#F48FB1',
    300: '#F06292',
    400: '#EC407A',
    500: '#E91E63',
    600: '#D81B60',
    700: '#C2185B',
    800: '#AD1457',
    900: '#880E4F',
  },

  // 배경 색상
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#EEEEEE',
    gray: '#E5E7EB',
  },

  // 텍스트 색상
  text: {
    primary: '#212121',
    secondary: '#757575',
    tertiary: '#9E9E9E',
    inverse: '#FFFFFF',
  },

  // 상태 색상
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },

  // 그림자
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
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

export const typography = {
  // Heading
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },

  // Body
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },

  // Button
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
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
} as const;
