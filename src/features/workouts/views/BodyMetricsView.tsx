import { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNutritionStore } from '../../nutrition/store/nutritionStore';
import { Button, Modal } from '../../../shared/components/ui';

export default function BodyMetricsView() {
  const { bodyWeight, logBodyWeight, deleteBodyWeight, loaded, loadFromStorage } = useNutritionStore();
  const [showAdd, setShowAdd]   = useState(false);
  const [input, setInput]       = useState('');
  const [note, setNote]         = useState('');

  if (!loaded) { loadFromStorage(); return null; }

  const sorted = [...bodyWeight].sort((a, b) => a.date.localeCompare(b.date));
  const last   = sorted[sorted.length - 1];
  const prev   = sorted[sorted.length - 2];
  const diff   = last && prev ? Math.round((last.weight - prev.weight) * 10) / 10 : null;

  const chartData = sorted.slice(-30).map(b => ({
    date:  b.date,
    label: format(parseISO(b.date), 'd MMM', { locale: es }),
    weight: b.weight,
  }));

  const handleSave = async () => {
    const w = parseFloat(input);
    if (!w || isNaN(w)) return;
    await logBodyWeight(w, note || undefined);
    setInput('');
    setNote('');
    setShowAdd(false);
  };

  const TrendIcon = diff == null ? Minus : diff > 0 ? TrendingUp : TrendingDown;
  const trendColor = diff == null ? 'var(--text-tertiary)' : diff > 0 ? 'var(--danger)' : 'var(--success)';

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Peso corporal</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{sorted.length} registros</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
          Registrar
        </Button>
      </div>

      {/* Current stats */}
      {last && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-3 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{last.weight}</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">kg actual</p>
          </div>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendIcon size={14} style={{ color: trendColor }} />
              <p className="text-2xl font-bold" style={{ color: trendColor }}>
                {diff != null ? (diff > 0 ? `+${diff}` : diff) : '—'}
              </p>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)]">vs anterior</p>
          </div>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-3 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {sorted.length >= 2 ? Math.round((sorted[sorted.length - 1].weight - sorted[0].weight) * 10) / 10 : '—'}
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)]">cambio total</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Últimos 30 días</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [`${v} kg`, 'Peso']}
              />
              <Line type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History list */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <TrendingUp size={28} className="mx-auto text-[var(--text-tertiary)]" />
          <p className="text-sm text-[var(--text-tertiary)]">Sin registros aún. Empieza a trackear tu peso.</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] divide-y divide-[var(--border-subtle)]">
          {[...sorted].reverse().slice(0, 20).map((b, i) => {
            const prev2 = sorted.find(s => s.date < b.date);
            const d = prev2 ? Math.round((b.weight - prev2.weight) * 10) / 10 : null;
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{b.weight} kg</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">
                    {format(parseISO(b.date), "d 'de' MMMM yyyy", { locale: es })}
                    {b.note ? ` · ${b.note}` : ''}
                  </p>
                </div>
                {d != null && (
                  <span className={`text-xs font-medium ${d > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                    {d > 0 ? '+' : ''}{d} kg
                  </span>
                )}
                <button
                  onClick={() => deleteBodyWeight(b.date)}
                  className="w-7 h-7 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Registrar peso">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)]">Peso (kg)</label>
            <input
              type="number" step="0.1" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="75.5" autoFocus
              className="w-full h-9 px-3 text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)]">Nota (opcional)</label>
            <input
              type="text" value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ayunas, por la mañana..."
              className="w-full h-9 px-3 text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>
          <Button variant="primary" size="md" className="w-full" onClick={handleSave} disabled={!input}>
            Guardar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
