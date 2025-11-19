/**
 * useEmailDomain 훅
 *
 * 이메일 도메인 드롭다운 UI 상태 관리
 *
 * 주요 기능:
 * - 로그인/회원가입 도메인 모달 상태 관리
 * - 도메인 선택 핸들러
 *
 * 반환값:
 * - loginDomainModalVisible, setLoginDomainModalVisible
 * - signupDomainModalVisible, setSignupDomainModalVisible
 * - handleSelectLoginDomain
 * - handleSelectSignupDomain
 */

import { useState } from "react";

export function useEmailDomain(
  setLoginEmailDomain: (domain: string) => void,
  setLoginCustomDomain: (domain: string) => void,
  handleSignupDomainChange: (domain: string) => void
) {
  const [loginDomainModalVisible, setLoginDomainModalVisible] = useState(false);
  const [signupDomainModalVisible, setSignupDomainModalVisible] =
    useState(false);

  const handleSelectLoginDomain = (domain: string) => {
    setLoginEmailDomain(domain);
    setLoginDomainModalVisible(false);
    if (domain === "직접 입력") {
      setLoginCustomDomain("");
    }
  };

  const handleSelectSignupDomain = (domain: string) => {
    handleSignupDomainChange(domain);
    setSignupDomainModalVisible(false);
  };

  return {
    loginDomainModalVisible,
    setLoginDomainModalVisible,
    signupDomainModalVisible,
    setSignupDomainModalVisible,
    handleSelectLoginDomain,
    handleSelectSignupDomain,
  };
}
