import { Apple, Plus } from 'lucide-react';
import { Button, EmptyState } from '../../../shared/components/ui';

export default function NutritionView() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Nutrición</h1>
        <Button variant="primary" size="sm" icon={<Plus size={14} />}>
          Registrar comida
        </Button>
      </div>
      <EmptyState
        icon={<Apple size={24} />}
        title="Sin registros de comida"
        description="Rastrea tu ingesta para alcanzar tus objetivos nutricionales."
        action={{ label: 'Configurar objetivos', onClick: () => {} }}
      />
    </div>
  );
}
