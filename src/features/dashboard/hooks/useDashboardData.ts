import { useMemo } from 'react';
import { useHabitsStore } from '../../habits/store/habitsStore';
import { useWorkoutsStore } from '../../workouts/store/workoutsStore';
import {
  computeLifeScore,
  getLast30DayScores,
  getHabitCompletionByWeekday,
  getWorkoutVolumeByWeek,
  getStreakLeaderboard,
} from '../utils/aggregations';
import { buildInsights } from '../utils/correlations';

export function useDashboardData() {
  const habitsStore  = useHabitsStore();
  const workoutsStore = useWorkoutsStore();

  const { habits, entries } = habitsStore;
  const { workouts } = workoutsStore;

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
    habitsLoaded: habitsStore.loaded,
    workoutsLoaded: workoutsStore.loaded,
    getStatsForHabit: (id: string) => habitsStore.getStatsForHabit(id),
  };
}
