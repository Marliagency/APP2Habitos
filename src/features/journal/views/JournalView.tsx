import { useEffect, useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { BookOpen, Plus, Search, Flame, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJournalStore } from '../store/journalStore';
import { EntryCard } from '../components/EntryCard';
import { EntryForm } from '../components/EntryForm';
import { MoodDot } from '../components/MoodPicker';
import { Modal, EmptyState, Skeleton } from '../../../shared/components/ui';
import { useToast } from '../../../shared/components/ui';
import type { JournalEntry, Mood } from '../types';

// ─── Mini mood calendar (28 days) ────────────────────────────────────────────
function MoodCalendar({ calendar }: { calendar: { date: string; mood: Mood | null }[] }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {calendar.map(({ date, mood }) => (
        <div
          key={date}
          title={`${format(parseISO(date), 'd MMM', { locale: es })}${mood ? '' : ' — sin registro'}`}
          className="w-5 h-5 rounded-sm"
          style={{ backgroundColor: mood ? undefined : 'var(--bg-hover)' }}
        >
          {mood ? (
            <MoodDot mood={mood} size={20} />
          ) : null}
        </div>
      ))}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export default function JournalView() {
  const {
    entries, loaded,
    loadFromStorage, addEntry, updateEntry, deleteEntry, pinEntry,
    getStreakDays, getAverageMood, getMoodCalendar,
  } = useJournalStore();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!loaded) loadFromStorage();
  }, [loaded, loadFromStorage]);

  const streak = useMemo(() => getStreakDays(), [entries]);
  const avgMood = useMemo(() => getAverageMood(30), [entries]);
  const moodCalendar = useMemo(() => getMoodCalendar(28), [entries]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const sorted = [...entries]
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.date.localeCompare(a.date);
      });
    if (!q) return sorted;
    return sorted.filter(e =>
      e.content.toLowerCase().includes(q) ||
      e.title?.toLowerCase().includes(q) ||
      e.tags.some(t => t.includes(q))
    );
  }, [entries, search]);

  const openNew = () => {
    setEditingEntry(null);
    setModalOpen(true);
  };

  const openEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const handleSave = async (data: Parameters<typeof addEntry>[0]) => {
    setSaving(true);
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, data);
        toast('Entrada actualizada', 'success');
      } else {
        await addEntry(data);
        toast('Entrada guardada', 'success');
      }
      setModalOpen(false);
      setEditingEntry(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    await deleteEntry(id);
    setDeleteConfirm(null);
    toast('Entrada eliminada', 'info');
  };

  const handlePin = async (id: string, pinned: boolean) => {
    await pinEntry(id, pinned);
    toast(pinned ? 'Entrada fijada' : 'Entrada desfijada', 'info');
  };

  if (!loaded) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Diario</h1>
        <button
          onClick={openNew}
          aria-label="Nueva entrada"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] text-white rounded-[var(--r-lg)] text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          Nueva
        </button>
      </div>

      {/* Stats strip */}
      {entries.length > 0 && (
        <div className="flex items-center gap-4 mb-5 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)]">
          <div className="flex items-center gap-1.5">
            <Flame size={14} className="text-[var(--warning)]" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">{streak}</span>
            <span className="text-xs text-[var(--text-tertiary)]">días</span>
          </div>
          <div className="w-px h-4 bg-[var(--border-subtle)]" />
          {avgMood !== null && (
            <>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[var(--accent)]" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">{avgMood.toFixed(1)}</span>
                <span className="text-xs text-[var(--text-tertiary)]">ánimo medio</span>
              </div>
              <div className="w-px h-4 bg-[var(--border-subtle)]" />
            </>
          )}
          <div className="flex items-center gap-1.5">
            <BookOpen size={14} className="text-[var(--text-tertiary)]" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">{entries.length}</span>
            <span className="text-xs text-[var(--text-tertiary)]">entradas</span>
          </div>
        </div>
      )}

      {/* Mood calendar */}
      {entries.length > 0 && (
        <div className="mb-5 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)]">
          <p className="text-xs text-[var(--text-tertiary)] mb-2">Ánimo — últimos 28 días</p>
          <MoodCalendar calendar={moodCalendar} />
        </div>
      )}

      {/* Search */}
      {entries.length > 0 && (
        <div className="relative mb-4">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Buscar en el diario…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
        </div>
      )}

      {/* Entries */}
      {entries.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={24} />}
          title="Diario vacío"
          description="Escribe tu primera entrada. La IA te ayudará a reflexionar con preguntas de seguimiento personalizadas según tu estado de ánimo."
          action={{ label: 'Escribir hoy', onClick: openNew }}
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <Search size={24} className="mx-auto text-[var(--text-tertiary)] mb-2" />
          <p className="text-sm text-[var(--text-tertiary)]">Sin resultados para "{search}"</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-3">
            {filtered.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <EntryCard
                  entry={entry}
                  onSelect={openEdit}
                  onDelete={handleDelete}
                  onPin={handlePin}
                />
                {deleteConfirm === entry.id && (
                  <p className="text-[10px] text-[var(--danger)] text-center mt-1">
                    Pulsa eliminar de nuevo para confirmar
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Entry modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEntry(null); }}
        title={editingEntry ? 'Editar entrada' : 'Nueva entrada'}
        size="lg"
      >
        <EntryForm
          initial={editingEntry}
          onSave={handleSave}
          onCancel={() => { setModalOpen(false); setEditingEntry(null); }}
          saving={saving}
        />
      </Modal>
    </div>
  );
}
