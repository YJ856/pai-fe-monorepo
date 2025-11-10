/**
 * 폰트 로딩 유틸리티
 *
 * React Native에서는 expo-font를 사용하여 커스텀 폰트를 로드합니다.
 *
 * 주의: WOFF/WOFF2 폰트는 React Native에서 지원되지 않습니다.
 * TTF 또는 OTF 형식의 폰트 파일이 필요합니다.
 *
 * TODO:
 * 1. Ownglyph_ParkDaHyun-Light.ttf 파일을 src/assets/fonts/에 추가
 * 2. GyeonggiTitleM.ttf 파일을 src/assets/fonts/에 추가
 * 3. 또는 웹폰트를 사용하려면 react-native-webview와 HTML 렌더링 필요
 */

import * as Font from 'expo-font';

export const loadFonts = async () => {
  try {
    await Font.loadAsync({
      // Child mode font - 귀여운 손글씨 스타일
      // 'Ownglyph': require('@/assets/fonts/Ownglyph_ParkDaHyun-Light.ttf'),

      // Parent mode font - 깔끔한 한글 폰트
      // 'GyeonggiTitle': require('@/assets/fonts/GyeonggiTitleM.ttf'),

      // TODO: TTF 파일이 준비되면 위 주석을 해제하세요
    });

    console.log('Fonts loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading fonts:', error);
    return false;
  }
};

/**
 * 폰트 패밀리 헬퍼
 *
 * Child/Parent 모드에 따라 적절한 폰트를 반환합니다.
 * TTF 폰트가 로드되지 않은 경우 시스템 폰트로 폴백됩니다.
 */
export const getFontFamily = (mode: 'child' | 'parent' | 'default' = 'default'): string => {
  // TODO: TTF 폰트가 준비되면 아래 주석을 해제하세요
  /*
  switch (mode) {
    case 'child':
      return 'Ownglyph';
    case 'parent':
      return 'GyeonggiTitle';
    default:
      return 'System';
  }
  */

  // 임시: 시스템 폰트 사용
  return 'System';
};
