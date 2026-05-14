import { CheckSquare, Plus } from 'lucide-react';
import { Button, EmptyState } from '../../../shared/components/ui';

export default function HabitsView() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Hábitos</h1>
        <Button variant="primary" size="sm" icon={<Plus size={14} />}>
          Nuevo hábito
        </Button>
      </div>
      <EmptyState
        icon={<CheckSquare size={24} />}
        title="Sin hábitos aún"
        description="Los hábitos son la base de tu sistema. Empieza con uno pequeño."
        action={{ label: 'Crear hábito', onClick: () => {} }}
      />
    </div>
  );
}
