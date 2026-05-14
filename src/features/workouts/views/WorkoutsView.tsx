import { Dumbbell, Plus } from 'lucide-react';
import { Button, EmptyState } from '../../../shared/components/ui';

export default function WorkoutsView() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Entrenamientos</h1>
        <Button variant="primary" size="sm" icon={<Plus size={14} />}>
          Registrar entreno
        </Button>
      </div>
      <EmptyState
        icon={<Dumbbell size={24} />}
        title="Sin entrenamientos"
        description="Registra tu primer entrenamiento para empezar a rastrear tu progreso."
        action={{ label: 'Empezar entreno', onClick: () => {} }}
      />
    </div>
  );
}
