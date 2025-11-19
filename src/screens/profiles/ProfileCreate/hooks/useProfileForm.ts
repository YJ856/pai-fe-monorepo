/**
 * useProfileForm 훅
 *
 * 프로필 생성 폼 상태 관리 및 유효성 검사
 *
 * 주요 기능:
 * - 프로필 타입, 이름, 생년월일, 성별, PIN 상태 관리
 * - 생년월일 포맷팅 (YYYY-MM-DD)
 * - 폼 유효성 검사
 *
 * 반환값:
 * - profileType, setProfileType
 * - name, setName
 * - birthdate, setBirthdate
 * - gender, setGender
 * - pin, setPin
 * - confirmPin, setConfirmPin
 * - errors, setErrors
 * - formatBirthdate
 * - validateForm
 */

import { useState } from "react";
import { ProfileType, Gender } from "../../../../shared/types";

export function useProfileForm() {
  const [profileType, setProfileType] = useState<ProfileType>("child");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatBirthdate = (text: string) => {
    // 숫자만 추출
    const numbers = text.replace(/[^\d]/g, "");

    // 최대 8자리까지만
    const limitedNumbers = numbers.slice(0, 8);

    // YYYY-MM-DD 형식으로 포맷팅
    let formatted = limitedNumbers;
    if (limitedNumbers.length >= 7) {
      // 8자리 이상: YYYY-MM-DD
      formatted = `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(
        4,
        6
      )}-${limitedNumbers.slice(6)}`;
    } else if (limitedNumbers.length >= 5) {
      // 6~7자리: YYYY-MM-
      formatted = `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4)}`;
    } else if (limitedNumbers.length >= 4) {
      // 4~5자리: YYYY-
      formatted = `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4)}`;
    }

    return formatted;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "이름을 입력해주세요";
    }

    if (!birthdate.trim()) {
      newErrors.birthdate = "생년월일을 입력해주세요";
    } else if (
      birthdate.length !== 10 ||
      !birthdate.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      newErrors.birthdate = "올바른 날짜 형식을 입력해주세요 (YYYY-MM-DD)";
    }

    if (profileType === "parent") {
      if (!pin || pin.length !== 4) {
        newErrors.pin = "4자리 PIN을 입력해주세요";
      }
      if (pin !== confirmPin) {
        newErrors.confirmPin = "PIN이 일치하지 않습니다";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    profileType,
    setProfileType,
    name,
    setName,
    birthdate,
    setBirthdate,
    gender,
    setGender,
    pin,
    setPin,
    confirmPin,
    setConfirmPin,
    errors,
    setErrors,
    formatBirthdate,
    validateForm,
  };
}
