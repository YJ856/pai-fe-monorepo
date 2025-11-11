/**
 * 인증 이벤트 관리
 * - 401 에러 발생 시 앱 전체에 로그아웃 이벤트 전파
 */

type AuthEventListener = () => void;

class AuthEventEmitter {
  private listeners: AuthEventListener[] = [];

  subscribe(listener: AuthEventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit() {
    this.listeners.forEach((listener) => listener());
  }
}

export const authEvents = new AuthEventEmitter();
