import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sun, Moon, Sunset, CheckCircle2, Flame, CheckSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '../hooks/useHabits';
import { HabitCard } from '../components/HabitCard';
import { EmptyState, ProgressBar, Skeleton } from '../../../shared/components/ui';

function getGreeting(): { text: string; Icon: typeof Sun } {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Buenos días',   Icon: Sun };
  if (h < 19) return { text: 'Buenas tardes', Icon: Sunset };
  return              { text: 'Buenas noches', Icon: Moon };
}

export default function TodayView() {
  const navigate = useNavigate();
  const {
    todayHabits, completedToday, totalToday, loaded,
    markComplete, decrementCount, markSkipped, unmark,
  } = useHabits();

  const today = format(new Date(), 'yyyy-MM-dd');
  const { text: greeting, Icon: GreetingIcon } = getGreeting();
  const progress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;
  const allDone  = totalToday > 0 && completedToday === totalToday;

  if (!loaded) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-20 w-full" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Greeting */}
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-11 h-11 rounded-[var(--r-xl)] bg-[var(--warning-subtle)] flex items-center justify-center shrink-0"
        >
          <GreetingIcon size={22} className="text-[var(--warning)]" />
        </motion.div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">{greeting}</h1>
          <p className="text-sm text-[var(--text-tertiary)] capitalize mt-0.5">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>
      </div>

      {/* Progress card */}
      {totalToday > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {allDone
                ? <CheckCircle2 size={16} className="text-[var(--success)]" />
                : <Flame size={16} className="text-[var(--warning)]" />
              }
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {allDone ? '¡Día completado! 🎉' : 'Progreso del día'}
              </span>
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
              {completedToday}/{totalToday}
            </span>
          </div>
          <ProgressBar value={progress} color={allDone ? 'var(--success)' : 'var(--accent)'} />
        </motion.div>
      )}

      {/* Habit list */}
      {totalToday === 0 ? (
        <EmptyState
          icon={<CheckSquare size={24} />}
          title="Sin hábitos para hoy"
          description="Configura tus hábitos para ver tu progreso diario aquí."
          action={{ label: 'Ir a Hábitos', onClick: () => navigate('/habits') }}
        />
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
            Hábitos de hoy
          </p>
          <AnimatePresence initial={false}>
            {todayHabits.map(({ entry, stats, ...habit }) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                entry={entry}
                stats={stats}
                onComplete={() => markComplete(habit.id)}
                onUnmark={() => unmark(habit.id, today)}
                onSkip={() => markSkipped(habit.id, today)}
                onIncrement={habit.type === 'count' ? () => markComplete(habit.id) : undefined}
                onDecrement={habit.type === 'count' ? () => decrementCount(habit.id) : undefined}
                onClick={() => navigate('/habits')}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
