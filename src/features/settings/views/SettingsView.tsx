import { useState, useEffect } from 'react';
import { Settings, Key, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Toggle, Button } from '../../../shared/components/ui';
import { useAppSettings } from '../../../shared/hooks/useAppSettings';
import { useToast } from '../../../shared/components/ui';

const AI_CLAUDE_KEY  = 'ai_claude_key';
const AI_OPENAI_KEY  = 'ai_openai_key';

function APIKeyField({
  label,
  storageKey,
  placeholder,
}: {
  label: string;
  storageKey: string;
  placeholder: string;
}) {
  const { toast } = useToast();
  const [value,   setValue]   = useState(() => localStorage.getItem(storageKey) ?? '');
  const [visible, setVisible] = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(storageKey) ?? '';
    setValue(existing);
    setSaved(!!existing);
  }, [storageKey]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed) {
      localStorage.setItem(storageKey, trimmed);
      setSaved(true);
      toast(`Clave ${label} guardada`, 'success');
    } else {
      localStorage.removeItem(storageKey);
      setSaved(false);
      toast(`Clave ${label} eliminada`, 'info');
    }
  };

  const masked = value.length > 8
    ? value.slice(0, 4) + '•'.repeat(value.length - 8) + value.slice(-4)
    : '•'.repeat(value.length);

  return (
    <div className="px-4 py-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key size={13} className="text-[var(--text-tertiary)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
        </div>
        {saved && <CheckCircle2 size={13} className="text-[var(--success)]" />}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={e => { setValue(e.target.value); setSaved(false); }}
            placeholder={placeholder}
            className="w-full px-3 py-2 pr-9 rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
          <button
            onClick={() => setVisible(v => !v)}
            aria-label={visible ? 'Ocultar clave' : 'Mostrar clave'}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <Button variant="secondary" size="sm" onClick={handleSave}>
          Guardar
        </Button>
      </div>
      {saved && value && (
        <p className="text-[10px] text-[var(--text-tertiary)]">
          Almacenada localmente: {masked}
        </p>
      )}
      <p className="text-[10px] text-[var(--text-tertiary)]">
        Las claves se guardan solo en este dispositivo y nunca se envían a servidores externos.
      </p>
    </div>
  );
}

export default function SettingsView() {
  const { settings, updateSettings } = useAppSettings();

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={20} className="text-[var(--text-tertiary)]" />
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Ajustes</h1>
      </div>

      <div className="space-y-5">
        {/* General */}
        <section>
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-2 px-1">General</p>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] divide-y divide-[var(--border-subtle)]">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-[var(--text-primary)]">Notificaciones</span>
              <Toggle checked={settings.notifications} onChange={v => updateSettings({ notifications: v })} />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-[var(--text-primary)]">Vibración háptica</span>
              <Toggle checked={settings.haptics} onChange={v => updateSettings({ haptics: v })} />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-[var(--text-primary)]">Modo oscuro</span>
              <Toggle checked={settings.theme === 'dark'} onChange={v => updateSettings({ theme: v ? 'dark' : 'light' })} />
            </div>
          </div>
        </section>

        {/* AI Keys */}
        <section>
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-2 px-1">Inteligencia Artificial</p>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] divide-y divide-[var(--border-subtle)]">
            <APIKeyField
              label="Clave API Claude (Anthropic)"
              storageKey={AI_CLAUDE_KEY}
              placeholder="sk-ant-api03-…"
            />
            <APIKeyField
              label="Clave API OpenAI"
              storageKey={AI_OPENAI_KEY}
              placeholder="sk-proj-…"
            />
          </div>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-2 px-1">
            Necesitas al menos una clave para usar el Asistente IA, análisis de fotos de alimentos y el Diario con sugerencias de reflexión.
          </p>
        </section>

        <p className="text-xs text-[var(--text-tertiary)] text-center pt-2">APP2Habitos v1.0.0</p>
      </div>
    </div>
  );
}
