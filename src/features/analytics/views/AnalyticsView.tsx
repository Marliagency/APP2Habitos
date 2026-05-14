import { BarChart2 } from 'lucide-react';
import { EmptyState } from '../../../shared/components/ui';

export default function AnalyticsView() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Analytics</h1>
      <EmptyState
        icon={<BarChart2 size={24} />}
        title="Sin datos aún"
        description="Usa la app durante unos días para ver tus patrones y correlaciones."
      />
    </div>
  );
}
