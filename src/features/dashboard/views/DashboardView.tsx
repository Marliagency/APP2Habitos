import { useEffect } from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useHabitsStore } from '../../habits/store/habitsStore';
import { useWorkoutsStore } from '../../workouts/store/workoutsStore';
import { useDashboardData } from '../hooks/useDashboardData';
import { KPIBand } from '../components/KPIBand';
import { LifeScoreSection } from '../components/LifeScoreSection';
import { HabitsSection } from '../components/HabitsSection';
import { WorkoutsSection } from '../components/WorkoutsSection';
import { Skeleton } from '../../../shared/components/ui';

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export default function DashboardView() {
  const habitsStore   = useHabitsStore();
  const workoutsStore = useWorkoutsStore();

  useEffect(() => {
    if (!habitsStore.loaded)   habitsStore.loadFromStorage();
    if (!workoutsStore.loaded) workoutsStore.loadFromStorage();
  }, []);

  const data = useDashboardData();

  if (!data.habitsLoaded || !data.workoutsLoaded) {
    return <DashboardSkeleton />;
  }

  const now   = new Date();
  const hour  = now.getHours();
  const greeting = hour < 13 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const dateStr  = format(now, "EEEE, d 'de' MMMM", { locale: es });

  // Habit rate today
  const todayStr = format(now, 'yyyy-MM-dd');
  const activeHabits = data.activeHabits;
  const completedToday = data.habits.filter(h => !h.archivedAt).filter(h => {
    const entry = habitsStore.getEntryForDate(h.id, todayStr);
    return entry && entry.count > 0;
  }).length;
  const habitRate7d = activeHabits.length > 0
    ? Math.round((completedToday / activeHabits.length) * 100)
    : 0;

  // Workouts this week
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd   = endOfWeek(now, { weekStartsOn: 1 });
  const workoutsThisWeek = data.workouts.filter(w => {
    try { return isWithinInterval(parseISO(w.date), { start: weekStart, end: weekEnd }); }
    catch { return false; }
  }).length;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">{greeting}</h1>
        <p className="text-xs text-[var(--text-tertiary)] mt-0.5 capitalize">{dateStr}</p>
      </div>

      {/* KPI Band */}
      <KPIBand
        lifeScore={data.lifeScore.today}
        trend7d={data.lifeScore.trend7d}
        habitRate7d={habitRate7d}
        workoutsThisWeek={workoutsThisWeek}
        totalPRs={data.totalPRs}
        totalWorkouts={data.workouts.length}
        last30Days={data.last30Days}
      />

      {/* Life Score section */}
      <LifeScoreSection
        lifeScore={data.lifeScore}
        last30Days={data.last30Days}
      />

      {/* Habits section */}
      {activeHabits.length > 0 && (
        <HabitsSection
          habits={data.habits}
          weekdayCompletion={data.weekdayCompletion}
          streakLeaderboard={data.streakLeaderboard}
          getStats={data.getStatsForHabit}
        />
      )}

      {/* Workouts section */}
      {data.workouts.length > 0 && (
        <WorkoutsSection
          workouts={data.workouts}
          weeklyVolume={data.weeklyVolume}
          totalPRs={data.totalPRs}
        />
      )}

      {/* Empty state for new users */}
      {activeHabits.length === 0 && data.workouts.length === 0 && (
        <div className="text-center py-16 space-y-2">
          <p className="text-4xl">🚀</p>
          <p className="text-base font-semibold text-[var(--text-primary)]">Empieza tu viaje</p>
          <p className="text-sm text-[var(--text-tertiary)] max-w-xs mx-auto">
            Crea tus primeros hábitos o registra un entrenamiento para ver tu dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
