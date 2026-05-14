import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Camera, Mic, ScanLine, Plus, Target, Scale, ChevronLeft, ChevronRight, ChefHat, PenLine } from 'lucide-react';
import { useNutritionStore } from '../store/nutritionStore';
import { DailyRings } from '../components/DailyRings';
import { MealCard } from '../components/MealCard';
import { PhotoAnalyzer } from '../components/PhotoAnalyzer';
import { VoiceInput } from '../components/VoiceInput';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { NutritionTargetsWizard } from '../components/NutritionTargetsWizard';
import { MealTemplateSheet } from '../components/MealTemplateSheet';
import { ManualFoodForm } from '../components/ManualFoodForm';
import { Button, Modal, Skeleton } from '../../../shared/components/ui';
import { MEAL_LABELS } from '../types';
import type { Meal } from '../types';

const MEAL_TYPES: Meal['type'][] = ['breakfast', 'lunch', 'dinner', 'snack'];

type AddMode = 'photo' | 'voice' | 'barcode' | 'template' | 'manual' | null;

export default function NutritionView() {
  const store = useNutritionStore();
  const [date, setDate]           = useState(format(new Date(), 'yyyy-MM-dd'));
  const [addMode, setAddMode]     = useState<AddMode>(null);
  const [activeMealType, setActiveMealType] = useState<Meal['type']>('snack');
  const [showTargets, setShowTargets]       = useState(false);
  const [showWeight, setShowWeight]         = useState(false);
  const [weightInput, setWeightInput]       = useState('');

  useEffect(() => {
    if (!store.loaded) store.loadFromStorage();
  }, []);

  const totals   = store.getTotalsForDate(date);
  const meals    = store.getMealsForDate(date);
  const targets  = store.targets;
  const isToday  = date === format(new Date(), 'yyyy-MM-dd');

  const changeDay = (delta: number) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setDate(format(d, 'yyyy-MM-dd'));
  };

  const openAdd = (mealType: Meal['type'], mode: AddMode) => {
    setActiveMealType(mealType);
    setAddMode(mode);
  };

  const handleLogWeight = async () => {
    const w = parseFloat(weightInput);
    if (!w || isNaN(w)) return;
    await store.logBodyWeight(w, undefined, date);
    setWeightInput('');
    setShowWeight(false);
  };

  if (!store.loaded) {
    return (
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }

  const remainingCal = (targets?.calories ?? 2000) - totals.calories;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Nutrición</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {remainingCal >= 0 ? `${remainingCal} kcal restantes` : `${Math.abs(remainingCal)} kcal por encima del objetivo`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={<Scale size={14} />} onClick={() => setShowWeight(true)} />
          <Button variant="ghost" size="sm" icon={<Target size={14} />} onClick={() => setShowTargets(true)}>
            Objetivos
          </Button>
        </div>
      </div>

      {/* Day navigator */}
      <div className="flex items-center gap-2 justify-center">
        <button
          onClick={() => changeDay(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] transition-colors"
        >
          <ChevronLeft size={16} className="text-[var(--text-secondary)]" />
        </button>
        <span className="text-sm font-medium text-[var(--text-primary)] min-w-[160px] text-center capitalize">
          {isToday ? 'Hoy' : format(new Date(date + 'T12:00:00'), "EEEE, d 'de' MMM", { locale: es })}
        </span>
        <button
          onClick={() => changeDay(1)}
          disabled={isToday}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-30"
        >
          <ChevronRight size={16} className="text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* Daily Rings or setup prompt */}
      {targets ? (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
          <DailyRings totals={totals} targets={targets} />
        </div>
      ) : (
        <button
          onClick={() => setShowTargets(true)}
          className="w-full flex items-center justify-center gap-2 py-6 border-2 border-dashed border-[var(--border-default)] rounded-[var(--r-xl)] text-sm text-[var(--text-secondary)] hover:border-[var(--nutrition-color)] hover:text-[var(--nutrition-color)] transition-all"
        >
          <Target size={18} /> Configurar objetivos nutricionales
        </button>
      )}

      {/* Quick add buttons */}
      <div className="flex gap-2">
        {([
          { mode: 'photo' as AddMode,    icon: Camera,   label: 'Foto' },
          { mode: 'voice' as AddMode,    icon: Mic,      label: 'Voz' },
          { mode: 'barcode' as AddMode,  icon: ScanLine, label: 'Código' },
          { mode: 'template' as AddMode, icon: ChefHat,  label: 'Plantilla' },
          { mode: 'manual' as AddMode,   icon: PenLine,  label: 'Manual' },
        ]).map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => openAdd('snack', mode)}
            className="flex-1 flex flex-col items-center gap-1.5 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] hover:border-[var(--nutrition-color)] hover:bg-[var(--bg-hover)] transition-all"
          >
            <Icon size={18} className="text-[var(--text-secondary)]" />
            <span className="text-[10px] text-[var(--text-tertiary)]">{label}</span>
          </button>
        ))}
      </div>

      {/* Meal cards */}
      <div className="space-y-3">
        {MEAL_TYPES.map(mealType => {
          const meal = meals.find(m => m.type === mealType);
          return meal ? (
            <MealCard
              key={meal.id}
              meal={meal}
              onAddEntry={() => openAdd(mealType, 'photo')}
            />
          ) : isToday ? (
            <button
              key={mealType}
              onClick={async () => { await store.addMeal(date, mealType); }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--bg-surface)] border border-dashed border-[var(--border-default)] rounded-[var(--r-xl)] hover:border-[var(--nutrition-color)] hover:bg-[var(--bg-hover)] transition-all"
            >
              <Plus size={14} className="text-[var(--text-tertiary)] shrink-0" />
              <span className="text-sm text-[var(--text-secondary)]">{MEAL_LABELS[mealType]}</span>
            </button>
          ) : null;
        })}
      </div>

      {/* Totals summary card */}
      {totals.calories > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
          <p className="text-xs font-medium text-[var(--text-tertiary)] mb-3">Resumen del día</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'kcal',     value: totals.calories, color: 'var(--accent)' },
              { label: 'Proteínas',value: `${totals.protein}g`, color: 'var(--nutrition-color)' },
              { label: 'Carbos',   value: `${totals.carbs}g`,   color: 'var(--warning)' },
              { label: 'Grasas',   value: `${totals.fat}g`,     color: 'var(--journal-color)' },
            ].map(m => (
              <div key={m.label}>
                <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
                <p className="text-[9px] text-[var(--text-tertiary)]">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal open={addMode === 'photo'} onClose={() => setAddMode(null)} title="Analizar foto">
        <PhotoAnalyzer mealType={activeMealType} onDone={() => setAddMode(null)} />
      </Modal>
      <Modal open={addMode === 'voice'} onClose={() => setAddMode(null)} title="Entrada de voz">
        <VoiceInput mealType={activeMealType} onDone={() => setAddMode(null)} />
      </Modal>
      <Modal open={addMode === 'barcode'} onClose={() => setAddMode(null)} title="Código de barras">
        <BarcodeScanner mealType={activeMealType} onDone={() => setAddMode(null)} />
      </Modal>
      <Modal open={addMode === 'manual'} onClose={() => setAddMode(null)} title="Añadir alimento manual">
        <ManualFoodForm mealType={activeMealType} date={date} onDone={() => setAddMode(null)} />
      </Modal>
      <Modal open={showTargets} onClose={() => setShowTargets(false)} title="Objetivos nutricionales">
        <NutritionTargetsWizard onDone={() => setShowTargets(false)} />
      </Modal>
      <MealTemplateSheet
        open={addMode === 'template'}
        onClose={() => setAddMode(null)}
        date={date}
        mealType={activeMealType}
      />

      <Modal open={showWeight} onClose={() => setShowWeight(false)} title="Peso corporal">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)]">Peso en kg</label>
            <input
              type="number" step="0.1" value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogWeight()}
              placeholder="75.5" autoFocus
              className="w-full h-9 px-3 text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>
          <Button variant="primary" size="md" className="w-full" onClick={handleLogWeight} disabled={!weightInput}>
            Guardar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
