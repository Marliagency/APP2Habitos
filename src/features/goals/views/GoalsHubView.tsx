import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Edit2, Trash2, CheckCircle2, TrendingUp, Utensils, Dumbbell, Brain, ListTodo, Zap, Sparkles } from 'lucide-react';
import { useGoalsStore } from '../store/goalsStore';
import { useJournalStore } from '../../journal/store/journalStore';
import { useNutritionStore } from '../../nutrition/store/nutritionStore';
import { useHabitsStore } from '../../habits/store/habitsStore';
import { useWorkoutsStore } from '../../workouts/store/workoutsStore';
import { evaluateGoalProgress } from '../utils/goalInference';
import { INTENT_LABELS, INTENT_EMOJIS, PRIORITY_LABELS, PRIORITY_EMOJIS } from '../types';
import { Button, EmptyState, Skeleton } from '../../../shared/components/ui';
import { useToast } from '../../../shared/components/ui';
import { format, subDays } from 'date-fns';

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center border-4 shrink-0"
      style={{ borderColor: color }}
    >
      <span className="text-lg font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function ProgressRow({
  icon,
  label,
  ok,
}: { icon: React.ReactNode; label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`shrink-0 ${ok ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{icon}</div>
      <span className="text-xs text-[var(--text-secondary)] flex-1">{label}</span>
      <CheckCircle2 size={13} className={ok ? 'text-[var(--success)]' : 'text-[var(--text-tertiary)] opacity-30'} />
    </div>
  );
}

export default function GoalsHubView() {
  const navigate  = useNavigate();
  const { toast } = useToast();
  const { goal, loaded, loadFromStorage, clearGoal } = useGoalsStore();
  const { getAverageMood }       = useJournalStore();
  const { getTotalsForDate, targets: nutritionTargets, setTargets } = useNutritionStore();
  const { entries: habitEntries, habits, addHabit } = useHabitsStore();
  const { workouts }             = useWorkoutsStore();

  useEffect(() => {
    if (!loaded) loadFromStorage();
  }, [loaded, loadFromStorage]);

  if (!loaded) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Target size={20} className="text-[var(--text-tertiary)]" />
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Objetivos</h1>
        </div>
        <EmptyState
          icon={<Target size={24} />}
          title="Sin objetivo activo"
          description="Define tu objetivo principal y la app ajustará tus recomendaciones de entreno, nutrición y hábitos."
          action={{ label: 'Crear mi objetivo', onClick: () => navigate('/goals/wizard') }}
        />
      </div>
    );
  }

  // Compute progress from real store data
  const today  = format(new Date(), 'yyyy-MM-dd');
  const cutoff = format(subDays(new Date(), 7), 'yyyy-MM-dd');

  // Avg calories (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), i), 'yyyy-MM-dd')
  );
  const calorieReadings = last7
    .map(d => getTotalsForDate(d).calories)
    .filter(c => c > 0);
  const avgCalories = calorieReadings.length > 0
    ? calorieReadings.reduce((a, b) => a + b, 0) / calorieReadings.length
    : null;

  const proteinReadings = last7
    .map(d => getTotalsForDate(d).protein)
    .filter(p => p > 0);
  const avgProtein = proteinReadings.length > 0
    ? proteinReadings.reduce((a, b) => a + b, 0) / proteinReadings.length
    : null;

  // Workouts this week
  const workoutsThisWeek = workouts.filter(w => w.date >= cutoff && w.date <= today).length;

  // Habit completion this week
  const totalPossible   = Math.min(7, habits.length) * 7;
  const completedEntries = habitEntries.filter(e => e.date >= cutoff && e.count > 0).length;
  const habitPct = totalPossible > 0 ? (completedEntries / totalPossible) * 100 : 0;

  const avgMood = getAverageMood(7);

  const progress = evaluateGoalProgress(goal.derived, {
    avgCalories,
    avgProtein,
    workoutSessionsThisWeek: workoutsThisWeek,
    habitCompletionPct: habitPct,
    avgMood,
  });

  const handleApplyNutritionTargets = async () => {
    if (!goal) return;
    await setTargets({
      calories: goal.derived.calorieTarget,
      protein:  goal.derived.proteinG,
      carbs:    goal.derived.carbsG,
      fat:      goal.derived.fatG,
    });
    toast('Objetivos nutricionales aplicados desde tu meta', 'success');
  };

  const handleClear = async () => {
    await clearGoal();
    toast('Objetivo eliminado', 'info');
  };

  const handleAddHabit = async (suggestion: string) => {
    await addHabit({
      name: suggestion,
      emoji: '✨',
      color: '#6366f1',
      category: 'other',
      frequency: { type: 'daily', days: [0,1,2,3,4,5,6], timesPerWeek: null },
      schedule: null,
      type: 'boolean',
      targetCount: null,
      unit: null,
      difficulty: 'medium',
      linkedHabitId: null,
      archivedAt: null,
    });
    toast(`Hábito "${suggestion.slice(0, 30)}…" añadido`, 'success');
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target size={20} className="text-[var(--text-tertiary)]" />
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Objetivos</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<Edit2 size={13} />} onClick={() => navigate('/goals/wizard')}>
            Editar
          </Button>
        </div>
      </div>

      {/* Apply targets to Nutrition banner */}
      {!nutritionTargets && (
        <div className="flex items-center gap-3 px-3 py-2.5 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-[var(--r-xl)]">
          <Sparkles size={14} className="text-[var(--accent)] shrink-0" />
          <p className="text-xs text-[var(--text-secondary)] flex-1">
            Aplica los objetivos de calorías y proteína a la sección de Nutrición
          </p>
          <button
            onClick={handleApplyNutritionTargets}
            aria-label="Aplicar objetivos nutricionales"
            className="shrink-0 px-2.5 py-1 bg-[var(--accent)] text-white text-[10px] font-medium rounded-[var(--r-md)] hover:opacity-90 transition-opacity"
          >
            Aplicar
          </button>
        </div>
      )}

      {/* Active goal card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
        <div className="flex items-center gap-4">
          <ScoreBadge score={progress.score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{INTENT_EMOJIS[goal.intent]}</span>
              <p className="text-base font-semibold text-[var(--text-primary)]">{INTENT_LABELS[goal.intent]}</p>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">{goal.derived.weeklyGoalSummary}</p>
          </div>
        </div>
      </div>

      {/* Targets */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Calorías objetivo',  val: `${goal.derived.calorieTarget} kcal`, icon: <Utensils size={13} />, color: 'var(--warning)' },
          { label: 'Proteína diaria',    val: `${goal.derived.proteinG}g`,           icon: <TrendingUp size={13} />, color: 'var(--accent)' },
          { label: 'Entrenos / semana',  val: `${goal.derived.workoutDaysPerWeek}×`, icon: <Dumbbell size={13} />, color: 'var(--success)' },
          { label: 'Estilo de entreno',  val: goal.derived.workoutType,              icon: <Zap size={13} />, color: 'var(--text-secondary)' },
        ].map(({ label, val, icon, color }) => (
          <div key={label} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-3">
            <div className="flex items-center gap-1.5 mb-1.5" style={{ color }}>
              {icon}
              <span className="text-[10px] text-[var(--text-tertiary)]">{label}</span>
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{val}</p>
          </div>
        ))}
      </div>

      {/* Weekly progress */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">Progreso esta semana</p>
        <div className="space-y-3">
          <ProgressRow icon={<Utensils size={13} />} label={`Nutrición — ${avgCalories !== null ? Math.round(avgCalories) : '–'} kcal/día media`} ok={progress.nutritionOk} />
          <ProgressRow icon={<Dumbbell size={13} />} label={`Entrenos — ${workoutsThisWeek} de ${goal.derived.workoutDaysPerWeek} sesiones`} ok={progress.workoutOk} />
          <ProgressRow icon={<ListTodo size={13} />} label={`Hábitos — ${Math.round(habitPct)}% de cumplimiento`} ok={progress.habitsOk} />
          <ProgressRow icon={<Brain size={13} />}    label={`Estado de ánimo — ${avgMood !== null ? avgMood.toFixed(1) : '–'}/5 media`} ok={progress.moodOk} />
        </div>
      </div>

      {/* Smart adjustments */}
      {progress.adjustments.length > 0 && (
        <div className="bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-[var(--r-xl)] p-4">
          <p className="text-xs font-semibold text-[var(--warning)] mb-2.5">Ajustes sugeridos</p>
          <div className="space-y-2">
            {progress.adjustments.map((adj, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                <span className="text-[var(--warning)] shrink-0">→</span>
                <span>{adj}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habit suggestions */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-2.5">Hábitos recomendados</p>
        <div className="space-y-2">
          {goal.derived.habitSuggestions.slice(0, 5).map((h, i) => {
            const alreadyAdded = habits.some(hab => hab.name === h);
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[var(--accent)] shrink-0">✓</span>
                <span className="text-xs text-[var(--text-secondary)] flex-1">{h}</span>
                {alreadyAdded ? (
                  <span className="text-[10px] text-[var(--success)] shrink-0 font-medium">Añadido</span>
                ) : (
                  <button
                    onClick={() => handleAddHabit(h)}
                    className="shrink-0 px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-medium rounded-[var(--r-md)] hover:bg-[var(--accent)]/20 transition-colors"
                  >
                    Añadir
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Journal prompts */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-2.5">Preguntas de reflexión</p>
        <div className="space-y-2">
          {goal.derived.journalPrompts.map((p, i) => (
            <p key={i} className="text-xs text-[var(--text-secondary)] pl-2 border-l-2 border-[var(--accent)]/30">{p}</p>
          ))}
        </div>
      </div>

      {/* Priorities */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-2.5">Áreas prioritarias</p>
        <div className="flex flex-wrap gap-2">
          {goal.priorities.map(p => (
            <span key={p} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent)]/10 text-xs text-[var(--accent)] font-medium">
              {PRIORITY_EMOJIS[p]} {PRIORITY_LABELS[p]}
            </span>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-[var(--danger)] hover:opacity-80 transition-opacity"
        >
          <Trash2 size={12} />
          Eliminar objetivo
        </button>
      </div>
    </div>
  );
}
