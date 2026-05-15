import { create } from 'zustand';
import type { LifeGoal, LifeIntent, BodyProfile, TimeBudget, PriorityArea } from '../types';
import { inferGoalTargets } from '../utils/goalInference';
import { storage, STORAGE_KEYS } from '../../../shared/lib/storage';
const uid  = () => crypto.randomUUID();
const now  = () => new Date().toISOString();

interface GoalsState {
  goal:   LifeGoal | null;
  loaded: boolean;

  loadFromStorage: () => Promise<void>;
  saveGoal: (
    intent:     LifeIntent,
    body:       BodyProfile,
    time:       TimeBudget,
    priorities: PriorityArea[],
  ) => Promise<LifeGoal>;
  clearGoal: () => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goal:   null,
  loaded: false,

  loadFromStorage: async () => {
    const goal = await storage.getItem<LifeGoal>(STORAGE_KEYS.goals);
    set({ goal: goal ?? null, loaded: true });
  },

  saveGoal: async (intent, body, time, priorities) => {
    const derived = inferGoalTargets(intent, body, time, priorities);
    const goal: LifeGoal = {
      id:          uid(),
      intent,
      bodyProfile: body,
      timeBudget:  time,
      priorities,
      derived,
      createdAt:   now(),
      updatedAt:   now(),
      active:      true,
    };
    set({ goal });
    await storage.setItem(STORAGE_KEYS.goals, goal);
    return goal;
  },

  clearGoal: async () => {
    set({ goal: null });
    await storage.removeItem(STORAGE_KEYS.goals);
  },
}));
