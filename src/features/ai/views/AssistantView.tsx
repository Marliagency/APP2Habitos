import { Bot } from 'lucide-react';
import { EmptyState } from '../../../shared/components/ui';

export default function AssistantView() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-[var(--accent)] rounded-[var(--r-lg)] flex items-center justify-center">
          <Bot size={16} className="text-white" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Asistente IA</h1>
      </div>
      <EmptyState
        icon={<Bot size={24} />}
        title="Tu asistente personal"
        description="Conecta tu API key de Claude, OpenAI o Gemini en Ajustes para activar el asistente."
        action={{ label: 'Configurar IA', onClick: () => {} }}
      />
    </div>
  );
}
