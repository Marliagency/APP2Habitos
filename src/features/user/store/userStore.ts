import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../../../shared/lib/storage';
import type { UserProfile, ActivityLevel, Goal, Sex } from '../types';

interface UserState {
  profile: UserProfile | null;
  loaded: boolean;

  loadFromStorage: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setOnboardingStep: (step: number) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  loaded: false,

  loadFromStorage: async () => {
    const profile = await storage.getItem<UserProfile>(STORAGE_KEYS.userProfile);
    set({ profile, loaded: true });
  },

  updateProfile: async (patch) => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, ...patch };
    await storage.setItem(STORAGE_KEYS.userProfile, updated);
    set({ profile: updated });
  },

  completeOnboarding: async () => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, onboardingCompleted: true, onboardingStep: 8 };
    await storage.setItem(STORAGE_KEYS.userProfile, updated);
    set({ profile: updated });
    await storage.setItem(STORAGE_KEYS.onboarding, { completed: true, completedAt: new Date().toISOString() });
  },

  setOnboardingStep: async (step) => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, onboardingStep: step };
    await storage.setItem(STORAGE_KEYS.userProfile, updated);
    set({ profile: updated });
  },
}));

export type { ActivityLevel, Goal, Sex };
