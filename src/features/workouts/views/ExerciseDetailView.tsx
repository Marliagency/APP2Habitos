import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, BarChart2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { useWorkoutsStore } from '../store/workoutsStore';
import { EXERCISE_MAP } from '../data/exercises';
import { calc1RM, calc1RMBrzycki, calc1RMLombardi } from '../types';
import { Button } from '../../../shared/components/ui';

export default function ExerciseDetailView() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { workouts } = useWorkoutsStore();

  const exercise = exerciseId ? EXERCISE_MAP.get(exerciseId) : null;

  type HistoryEntry = { date: string; label: string; weight: number; reps: number; e1rm: number; volume: number; sets: number };

  const history = useMemo((): HistoryEntry[] => {
    if (!exerciseId) return [];
    const result: HistoryEntry[] = [];
    for (const w of workouts) {
      const ex = w.exercises.find(e => e.exerciseId === exerciseId);
      if (!ex) continue;
      const working = ex.sets.filter(s => s.completed && s.weight != null && s.reps != null && s.type !== 'warmup');
      if (working.length === 0) continue;
      const topSet = working.reduce((best, s) =>
        calc1RM(s.weight!, s.reps!) > calc1RM(best.weight!, best.reps!) ? s : best
      );
      const totalVolume = working.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);
      result.push({
        date:   w.date,
        label:  format(parseISO(w.date), 'd MMM', { locale: es }),
        weight: topSet.weight!,
        reps:   topSet.reps!,
        e1rm:   calc1RM(topSet.weight!, topSet.reps!),
        volume: Math.round(totalVolume),
        sets:   working.length,
      });
    }
    return result;
  }, [workouts, exerciseId]);

  const pr1RM = history.length > 0 ? Math.max(...history.map(h => h.e1rm)) : 0;
  const prWeight = history.length > 0 ? Math.max(...history.map(h => h.weight)) : 0;
  const lastSession = history[history.length - 1];

  if (!exercise) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <Button variant="ghost" icon={<ArrowLeft size={14} />} onClick={() => navigate(-1)}>Volver</Button>
        <p className="mt-4 text-sm text-[var(--text-tertiary)]">Ejercicio no encontrado.</p>
      </div>
    );
  }

  const topSet1RMBreakdown = lastSession ? [
    { method: 'Epley',    value: calc1RM(lastSession.weight, lastSession.reps) },
    { method: 'Brzycki',  value: calc1RMBrzycki(lastSession.weight, lastSession.reps) },
    { method: 'Lombardi', value: calc1RMLombardi(lastSession.weight, lastSession.reps) },
    { method: 'Media',    value: calc1RM(lastSession.weight, lastSession.reps) },
  ] : [];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] transition-colors shrink-0"
        >
          <ArrowLeft size={18} className="text-[var(--text-secondary)]" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">{exercise.name}</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {exercise.muscleGroups.map(m => m).join(' · ')} · {exercise.equipment}
          </p>
        </div>
      </div>

      {/* PR stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy size={12} className="text-[var(--warning)]" />
            <span className="text-[10px] text-[var(--text-tertiary)]">1RM estimado</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)]">{pr1RM}<span className="text-xs font-normal text-[var(--text-tertiary)]"> kg</span></p>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-3 text-center">
          <p className="text-[10px] text-[var(--text-tertiary)] mb-1">Peso máximo</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">{prWeight}<span className="text-xs font-normal text-[var(--text-tertiary)]"> kg</span></p>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-3 text-center">
          <p className="text-[10px] text-[var(--text-tertiary)] mb-1">Sesiones</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">{history.length}</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <BarChart2 size={28} className="mx-auto text-[var(--text-tertiary)]" />
          <p className="text-sm text-[var(--text-tertiary)]">Sin historial aún. Registra este ejercicio para ver estadísticas.</p>
        </div>
      ) : (
        <>
          {/* 1RM trend chart */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-[var(--accent)]" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">Progreso 1RM estimado</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={history} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => [`${v} kg`, '1RM est.']}
                />
                <Line type="monotone" dataKey="e1rm" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Volume chart */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Volumen por sesión (kg)</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={history} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => [`${v} kg`, 'Volumen']}
                />
                <Bar dataKey="volume" fill="var(--neutral-900)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 1RM breakdown for last session */}
          {lastSession && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Desglose 1RM — última sesión ({lastSession.weight}kg × {lastSession.reps})
              </p>
              <div className="grid grid-cols-2 gap-3">
                {topSet1RMBreakdown.map(({ method, value }) => (
                  <div key={method} className="flex items-center justify-between px-3 py-2 bg-[var(--bg-base)] rounded-[var(--r-lg)]">
                    <span className="text-xs text-[var(--text-secondary)]">{method}</span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{value} kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session history list */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Historial de sesiones</p>
            <div className="space-y-2">
              {[...history].reverse().slice(0, 10).map((h, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-1.5 rounded-[var(--r-md)] hover:bg-[var(--bg-hover)]">
                  <span className="text-xs text-[var(--text-tertiary)] w-12 shrink-0">{h.label}</span>
                  <span className="text-xs font-medium text-[var(--text-primary)]">{h.weight}kg × {h.reps}</span>
                  <span className="text-xs text-[var(--text-tertiary)]">{h.sets} sets</span>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[var(--accent)] font-medium">~{h.e1rm}kg</span>
                    <span className="text-[9px] text-[var(--text-tertiary)]">1RM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
