/**
 * 입력 유효성 검사 유틸리티
 *
 * 회원가입, 프로필 생성 등에서 사용
 *
 * 주요 함수:
 * - validateEmail: 이메일 형식 검사
 * - validatePassword: 비밀번호 규칙 검사
 * - validatePin: PIN 번호 형식 검사
 */

/**
 * 이메일 형식 검사
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 비밀번호 규칙 검사
 * - 최소 8자 이상
 * - 영문, 숫자 포함
 */
export function validatePassword(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return { isValid: false, message: '비밀번호는 최소 8자 이상이어야 합니다.' };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return { isValid: false, message: '비밀번호는 영문과 숫자를 포함해야 합니다.' };
  }

  return { isValid: true };
}

/**
 * PIN 번호 형식 검사
 * - 4자리 숫자
 */
export function validatePin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/**
 * 이름 유효성 검사
 * - 2자 이상, 20자 이하
 */
export function validateName(name: string): {
  isValid: boolean;
  message?: string;
} {
  if (name.length < 2) {
    return { isValid: false, message: '이름은 최소 2자 이상이어야 합니다.' };
  }

  if (name.length > 20) {
    return { isValid: false, message: '이름은 최대 20자까지 가능합니다.' };
  }

  return { isValid: true };
}
