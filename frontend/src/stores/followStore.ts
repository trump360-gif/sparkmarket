import { create } from 'zustand';

// ================================
// Types & Interfaces
// ================================

interface FollowState {
  // 사용자별 팔로우 상태 캐시 { [userId]: isFollowing }
  followingMap: Record<string, boolean>;
  // 내 팔로잉/팔로워 카운트
  myFollowingCount: number;
  myFollowersCount: number;
  // 팔로우 상태 변경 카운터 (레거시 호환)
  followChangeCounter: number;

  // Actions
  setFollowStatus: (userId: string, isFollowing: boolean) => void;
  getFollowStatus: (userId: string) => boolean | undefined;
  setMyFollowingCount: (count: number) => void;
  setMyFollowersCount: (count: number) => void;
  incrementMyFollowingCount: () => void;
  decrementMyFollowingCount: () => void;
  notifyFollowChange: () => void;
  clearCache: () => void;
}

// ================================
// Store
// ================================

export const useFollowStore = create<FollowState>((set, get) => ({
  followingMap: {},
  myFollowingCount: 0,
  myFollowersCount: 0,
  followChangeCounter: 0,

  setFollowStatus: (userId: string, isFollowing: boolean) =>
    set((state) => ({
      followingMap: { ...state.followingMap, [userId]: isFollowing },
    })),

  getFollowStatus: (userId: string) => get().followingMap[userId],

  setMyFollowingCount: (count: number) => set({ myFollowingCount: count }),

  setMyFollowersCount: (count: number) => set({ myFollowersCount: count }),

  incrementMyFollowingCount: () =>
    set((state) => ({ myFollowingCount: state.myFollowingCount + 1 })),

  decrementMyFollowingCount: () =>
    set((state) => ({ myFollowingCount: Math.max(0, state.myFollowingCount - 1) })),

  notifyFollowChange: () =>
    set((state) => ({ followChangeCounter: state.followChangeCounter + 1 })),

  clearCache: () => set({ followingMap: {} }),
}));
