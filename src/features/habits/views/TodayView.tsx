import { CheckSquare, Sun } from 'lucide-react';
import { EmptyState } from '../../../shared/components/ui';

export default function TodayView() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Sun size={20} className="text-[var(--warning)]" />
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">Tu día de un vistazo</p>
        </div>
      </div>
      <EmptyState
        icon={<CheckSquare size={24} />}
        title="Tu primer día"
        description="Configura tus hábitos para empezar a construir tu sistema operativo personal"
        action={{ label: 'Crear primer hábito', onClick: () => {} }}
      />
    </div>
  );
}
