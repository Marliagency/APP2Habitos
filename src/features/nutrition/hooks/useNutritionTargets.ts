import { useActiveGoal } from '../../goals/hooks/useActiveGoal';
import { useNutritionStore } from '../store/nutritionStore';
import type { NutritionTargets } from '../types';

export type NutritionTargetsSource = 'manual' | 'goal';

export interface ResolvedNutritionTargets extends NutritionTargets {
  source: NutritionTargetsSource;
}

/**
 * Returns the effective nutrition targets:
 * - manual targets (from nutritionStore) take priority
 * - falls back to the active goal's derived targets
 * - returns null only when neither exists
 */
export function useNutritionTargets(): ResolvedNutritionTargets | null {
  const storeTargets = useNutritionStore(s => s.targets);
  const { derived }  = useActiveGoal();

  if (storeTargets) {
    return { ...storeTargets, source: 'manual' };
  }

  if (derived?.nutritionTargets) {
    return { ...derived.nutritionTargets, source: 'goal' };
  }

  return null;
}
