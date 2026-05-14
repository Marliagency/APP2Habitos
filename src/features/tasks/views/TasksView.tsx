import { ListTodo, Plus } from 'lucide-react';
import { Button, EmptyState } from '../../../shared/components/ui';

export default function TasksView() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Tareas</h1>
        <Button variant="primary" size="sm" icon={<Plus size={14} />}>
          Nueva tarea
        </Button>
      </div>
      <EmptyState
        icon={<ListTodo size={24} />}
        title="Inbox vacío"
        description="Captura todo lo que necesitas hacer. Sin presión — lo organizamos después."
        action={{ label: 'Añadir tarea', onClick: () => {} }}
      />
    </div>
  );
}
