import { BookOpen, Plus } from 'lucide-react';
import { Button, EmptyState } from '../../../shared/components/ui';

export default function JournalView() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Diario</h1>
        <Button variant="primary" size="sm" icon={<Plus size={14} />}>
          Nueva entrada
        </Button>
      </div>
      <EmptyState
        icon={<BookOpen size={24} />}
        title="Diario vacío"
        description="Escribe tu primera entrada. La IA te ayudará a reflexionar con preguntas de seguimiento."
        action={{ label: 'Escribir hoy', onClick: () => {} }}
      />
    </div>
  );
}
