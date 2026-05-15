import { useMemo } from 'react';
import { subDays, format } from 'date-fns';
import { RotateCcw } from 'lucide-react';
import { useNutritionStore } from '../store/nutritionStore';
import { useToast } from '../../../shared/components/ui';
import { fmt } from '../../../shared/utils/fmt';
import type { Meal, MealEntry } from '../types';

interface RecentFoodsBarProps {
  targetMealType?: Meal['type'];
  date: string;
}

interface RecentFood {
  name: string;
  calories: number;
  protein: number;
  serving: string;
  quantity: number;
  entry: MealEntry;
}

export function RecentFoodsBar({ date }: RecentFoodsBarProps) {
  const store = useNutritionStore();
  const { toast } = useToast();

  const recentFoods = useMemo<RecentFood[]>(() => {
    const cutoff = format(subDays(new Date(), 14), 'yyyy-MM-dd');
    const seen = new Set<string>();
    const results: RecentFood[] = [];

    const pastMeals = [...store.meals]
      .filter(m => m.date >= cutoff && m.date < date)
      .sort((a, b) => b.date.localeCompare(a.date));

    for (const meal of pastMeals) {
      for (const entry of meal.entries) {
        const key = entry.name.toLowerCase().trim();
        if (!seen.has(key) && entry.macros.calories > 0) {
          seen.add(key);
          results.push({
            name: entry.name,
            calories: entry.macros.calories,
            protein: entry.macros.protein,
            serving: entry.serving,
            quantity: entry.quantity,
            entry,
          });
        }
        if (results.length >= 12) break;
      }
      if (results.length >= 12) break;
    }
    return results;
  }, [store.meals, date]);

  if (recentFoods.length === 0) return null;

  const handleAdd = async (food: RecentFood) => {
    const hour = new Date().getHours();
    const mealType: Meal['type'] =
      hour < 11 ? 'breakfast' :
      hour < 15 ? 'lunch' :
      hour < 20 ? 'dinner' : 'snack';

    await store.quickAdd({
      name:     food.name,
      macros:   food.entry.macros,
      quantity: food.quantity,
      serving:  food.serving,
      source:   food.entry.source,
      mealType,
      date,
    });
    toast(`${food.name} añadido`, 'success');
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 px-0.5">
        <RotateCcw size={11} className="text-[var(--text-tertiary)]" />
        <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
          Añadir de nuevo
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {recentFoods.map((food, i) => (
          <button
            key={i}
            onClick={() => handleAdd(food)}
            className="flex-none flex flex-col items-start gap-0.5 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] hover:border-[var(--nutrition-color)] hover:bg-[var(--bg-hover)] transition-all text-left min-w-[100px] max-w-[130px]"
          >
            <span className="text-xs font-medium text-[var(--text-primary)] line-clamp-2 leading-tight">{food.name}</span>
            <span className="text-[9px] text-[var(--text-tertiary)] tabular-nums">
              {fmt(food.calories, { integer: true })} kcal
            </span>
            {food.protein > 0 && (
              <span className="text-[9px] text-[var(--accent)] tabular-nums">
                P {fmt(food.protein, { decimals: 1 })}g
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
