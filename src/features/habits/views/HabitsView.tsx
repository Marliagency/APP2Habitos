import { useState } from 'react';
import { Plus, Archive, Settings2, Flame, BarChart2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Button, EmptyState, Modal, Tabs, TabsList, TabsTrigger, TabsContent,
  Skeleton, Badge,
} from '../../../shared/components/ui';
import { useHabits } from '../hooks/useHabits';
import { HabitCard } from '../components/HabitCard';
import { HabitForm } from '../components/HabitForm';
import { HabitHeatmap } from '../components/HabitHeatmap';
import { HabitStatsDisplay } from '../components/HabitStats';
import { HABIT_PRESETS } from '../data/presets';
import type { Habit, HabitEntry, HabitStats } from '../types';

export default function HabitsView() {
  const {
    habits, loaded,
    addHabit, updateHabit, archiveHabit,
    markComplete, decrementCount, markSkipped, unmark,
    getEntriesForHabit, getStatsForHabit, getEntryForDate,
  } = useHabits();

  const [tab, setTab] = useState('all');
  const [showAdd, setShowAdd]         = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [editHabit, setEditHabit]     = useState<Habit | null>(null);
  const [detailHabit, setDetailHabit] = useState<Habit | null>(null);
  const [saving, setSaving]           = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const activeHabits   = habits.filter(h => !h.archivedAt);
  const archivedHabits = habits.filter(h =>  h.archivedAt);

  const handleAdd = async (data: Omit<Habit, 'id' | 'createdAt' | 'order'>) => {
    setSaving(true);
    await addHabit(data);
    setSaving(false);
    setShowAdd(false);
  };

  const handleEdit = async (data: Omit<Habit, 'id' | 'createdAt' | 'order'>) => {
    if (!editHabit) return;
    setSaving(true);
    await updateHabit(editHabit.id, data);
    setSaving(false);
    setEditHabit(null);
  };

  const handleAddPreset = async (preset: typeof HABIT_PRESETS[0]) => {
    await addHabit({ ...preset, archivedAt: null });
  };

  if (!loaded) {
    return (
      <div className="p-4 md:p-6 space-y-3">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Hábitos</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {activeHabits.length} activo{activeHabits.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowPresets(true)}>
            Plantillas
          </Button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
            Nuevo
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">Todos ({activeHabits.length})</TabsTrigger>
          <TabsTrigger value="archived">Archivados ({archivedHabits.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {activeHabits.length === 0 ? (
            <EmptyState
              icon={<Flame size={24} />}
              title="Sin hábitos aún"
              description="Crea tu primer hábito o elige de las plantillas predefinidas."
              action={{ label: 'Ver plantillas', onClick: () => setShowPresets(true) }}
              className="mt-4"
            />
          ) : (
            <div className="mt-3 space-y-2">
              <AnimatePresence initial={false}>
                {activeHabits.map(habit => {
                  const entry = getEntryForDate(habit.id, today);
                  const stats = getStatsForHabit(habit.id);
                  return (
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
                      onClick={() => setDetailHabit(habit)}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived">
          {archivedHabits.length === 0 ? (
            <EmptyState
              icon={<Archive size={24} />}
              title="Sin hábitos archivados"
              className="mt-4"
            />
          ) : (
            <div className="mt-3 space-y-2">
              {archivedHabits.map(habit => (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] opacity-60"
                >
                  <span className="text-xl">{habit.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{habit.name}</p>
                    <Badge variant="default">Archivado</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateHabit(habit.id, { archivedAt: null })}
                  >
                    Restaurar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Modals ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nuevo hábito">
        <HabitForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} loading={saving} />
      </Modal>

      <Modal open={!!editHabit} onClose={() => setEditHabit(null)} title="Editar hábito">
        {editHabit && (
          <HabitForm
            initialData={editHabit}
            onSubmit={handleEdit}
            onCancel={() => setEditHabit(null)}
            loading={saving}
          />
        )}
      </Modal>

      <Modal
        open={!!detailHabit}
        onClose={() => setDetailHabit(null)}
        title={detailHabit ? `${detailHabit.emoji} ${detailHabit.name}` : ''}
        size="lg"
      >
        {detailHabit && (
          <HabitDetail
            habit={detailHabit}
            entries={getEntriesForHabit(detailHabit.id)}
            stats={getStatsForHabit(detailHabit.id)}
            onEdit={() => { setEditHabit(detailHabit); setDetailHabit(null); }}
            onArchive={async () => { await archiveHabit(detailHabit.id); setDetailHabit(null); }}
          />
        )}
      </Modal>

      <Modal open={showPresets} onClose={() => setShowPresets(false)} title="Hábitos recomendados" size="lg">
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {HABIT_PRESETS.map((preset, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-lg)] bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <span className="text-xl shrink-0">{preset.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{preset.name}</p>
                {preset.description && (
                  <p className="text-xs text-[var(--text-tertiary)] truncate">{preset.description}</p>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={() => handleAddPreset(preset)}>
                Añadir
              </Button>
            </motion.div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

// ── Detail sub-component ──────────────────────────────────────────────────────

interface HabitDetailProps {
  habit: Habit;
  entries: HabitEntry[];
  stats: HabitStats | null;
  onEdit: () => void;
  onArchive: () => Promise<void>;
}

function HabitDetail({ habit, entries, stats, onEdit, onArchive }: HabitDetailProps) {
  return (
    <div className="space-y-5">
      {habit.identity && (
        <p
          className="text-sm text-[var(--text-secondary)] italic border-l-2 pl-3"
          style={{ borderColor: habit.color }}
        >
          "{habit.identity}"
        </p>
      )}

      {stats ? (
        <HabitStatsDisplay stats={stats} color={habit.color} />
      ) : (
        <p className="text-sm text-[var(--text-tertiary)]">Sin datos aún. ¡Empieza hoy!</p>
      )}

      <div>
        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-2">
          Últimos 90 días
        </p>
        <HabitHeatmap
          entries={entries}
          color={habit.color}
          targetCount={habit.targetCount ?? 1}
        />
      </div>

      <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
        <Button variant="secondary" size="sm" icon={<Settings2 size={14} />} onClick={onEdit} className="flex-1">
          Editar
        </Button>
        <Button variant="ghost" size="sm" icon={<Archive size={14} />} onClick={onArchive} className="flex-1">
          Archivar
        </Button>
        <Button variant="ghost" size="sm" icon={<BarChart2 size={14} />} onClick={() => undefined} className="flex-1">
          Gráficos
        </Button>
      </div>
    </div>
  );
}
