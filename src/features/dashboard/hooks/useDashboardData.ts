import { useMemo } from 'react';
import { format } from 'date-fns';
import { useHabitsStore }    from '../../habits/store/habitsStore';
import { useWorkoutsStore }  from '../../workouts/store/workoutsStore';
import { useJournalStore }   from '../../journal/store/journalStore';
import { useNutritionStore } from '../../nutrition/store/nutritionStore';
import { useTasksStore }     from '../../tasks/store/tasksStore';
import {
  computeLifeScore,
  getLast30DayScores,
  getHabitCompletionByWeekday,
  getWorkoutVolumeByWeek,
  getStreakLeaderboard,
} from '../utils/aggregations';
import { buildInsights } from '../utils/correlations';

export function useDashboardData() {
  const habitsStore    = useHabitsStore();
  const workoutsStore  = useWorkoutsStore();
  const journalStore   = useJournalStore();
  const nutritionStore = useNutritionStore();
  const tasksStore     = useTasksStore();

  const { habits, entries } = habitsStore;
  const { workouts }        = workoutsStore;
  const { entries: journalEntries } = journalStore;
  const { tasks }           = tasksStore;

  const lifeScore = useMemo(
    () => computeLifeScore(habits, entries, workouts),
    [habits, entries, workouts],
  );

  const last30Days = useMemo(
    () => getLast30DayScores(habits, entries, workouts),
    [habits, entries, workouts],
  );

  const weekdayCompletion = useMemo(
    () => getHabitCompletionByWeekday(habits, entries),
    [habits, entries],
  );

  const weeklyVolume = useMemo(
    () => getWorkoutVolumeByWeek(workouts, 8),
    [workouts],
  );

  const streakLeaderboard = useMemo(
    () => getStreakLeaderboard(habits, id => habitsStore.getStatsForHabit(id) ?? { currentStreak: 0, longestStreak: 0, completionRate30d: 0 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [habits, entries],
  );

  const correlationInsights = useMemo(
    () => buildInsights(
      last30Days.map(d => d.habitsScore),
      last30Days.map(d => d.workoutScore),
    ),
    [last30Days],
  );

  const totalPRs = useMemo(
    () => workouts.reduce((s, w) => s + w.prs.length, 0),
    [workouts],
  );

  const totalWorkoutVolume = useMemo(
    () => workouts.reduce((s, w) => s + w.totalVolume, 0),
    [workouts],
  );

  const activeHabits = habitsStore.getActiveHabits();

  // ── New cross-feature KPIs ─────────────────────────────────────────────────
  const journalStreak = useMemo(
    () => journalStore.getStreakDays(),
    [journalEntries],
  );

  const todayMood = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return journalStore.getMoodByDate(today);
  }, [journalEntries]);

  const avgMood7d = useMemo(
    () => journalStore.getAverageMood(7),
    [journalEntries],
  );

  const tasksPendingToday = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return tasks.filter(t =>
      (t.status === 'todo' || t.status === 'in_progress') &&
      (!t.dueDate || t.dueDate <= today)
    ).length;
  }, [tasks]);

  const caloriesToday = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const totals = nutritionStore.getTotalsForDate(today);
    return totals.calories > 0 ? Math.round(totals.calories) : null;
  }, [nutritionStore, nutritionStore.meals]);

  const calorieTarget = nutritionStore.targets?.calories ?? null;

  return {
    lifeScore,
    last30Days,
    weekdayCompletion,
    weeklyVolume,
    streakLeaderboard,
    correlationInsights,
    totalPRs,
    totalWorkoutVolume,
    habits,
    activeHabits,
    workouts,
    habitsLoaded:    habitsStore.loaded,
    workoutsLoaded:  workoutsStore.loaded,
    journalLoaded:   journalStore.loaded,
    nutritionLoaded: nutritionStore.loaded,
    tasksLoaded:     tasksStore.loaded,
    getStatsForHabit: (id: string) => habitsStore.getStatsForHabit(id),
    // Cross-feature
    journalStreak,
    todayMood,
    avgMood7d,
    tasksPendingToday,
    caloriesToday,
    calorieTarget,
    journalEntries,
    tasks,
  };
}
