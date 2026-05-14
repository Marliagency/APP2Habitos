import { Settings } from 'lucide-react';
import { Toggle } from '../../../shared/components/ui';
import { useAppSettings } from '../../../shared/hooks/useAppSettings';

export default function SettingsView() {
  const { settings, updateSettings } = useAppSettings();

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={20} className="text-[var(--text-tertiary)]" />
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Ajustes</h1>
      </div>
      <div className="space-y-4">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] divide-y divide-[var(--border-subtle)]">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-[var(--text-primary)]">Notificaciones</span>
            <Toggle checked={settings.notifications} onChange={(v) => updateSettings({ notifications: v })} />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-[var(--text-primary)]">Vibración háptica</span>
            <Toggle checked={settings.haptics} onChange={(v) => updateSettings({ haptics: v })} />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-[var(--text-primary)]">Modo oscuro</span>
            <Toggle checked={settings.theme === 'dark'} onChange={(v) => updateSettings({ theme: v ? 'dark' : 'light' })} />
          </div>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] text-center">APP2Habitos v1.0.0</p>
      </div>
    </div>
  );
}
