/**
 * 프로필 전역 상태 관리 (Zustand)
 *
 * 주요 기능:
 * - 현재 선택된 프로필 정보 저장
 * - 사용자의 모든 프로필 목록 저장
 * - 자녀 프로필 목록 필터링
 * - 프로필 전환
 *
 * 사용처:
 * - RootNavigator: 프로필 선택 시 저장
 * - Dashboard: 선택된 자녀 프로필 ID 사용
 * - Profile: 현재 프로필 정보 표시
 */

import { create } from 'zustand';
import { Profile } from '../shared/types';

interface ProfileStore {
  // 현재 선택된 프로필
  currentProfile: Profile | null;

  // 사용자의 모든 프로필 목록
  profiles: Profile[];

  // 자녀 프로필만 필터링
  childProfiles: Profile[];

  // Actions
  setCurrentProfile: (profile: Profile) => void;
  setProfiles: (profiles: Profile[]) => void;
  clearProfile: () => void;

  // 자녀 프로필 목록 가져오기
  getChildProfiles: () => Profile[];
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  currentProfile: null,
  profiles: [],
  childProfiles: [],

  setCurrentProfile: (profile) => {
    set({ currentProfile: profile });
  },

  setProfiles: (profiles) => {
    const childProfiles = profiles.filter(p => p.profileType === 'child');
    set({ profiles, childProfiles });
  },

  clearProfile: () => {
    set({ currentProfile: null, profiles: [], childProfiles: [] });
  },

  getChildProfiles: () => {
    return get().childProfiles;
  },
}));
