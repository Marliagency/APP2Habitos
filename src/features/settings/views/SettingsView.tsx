import { useState, useEffect, useRef } from 'react';
import { Key, Eye, EyeOff, CheckCircle2, Moon, Bell, Smartphone, Trash2, Download, Upload, Info } from 'lucide-react';
import { Toggle, Button } from '../../../shared/components/ui';
import { useAppSettings } from '../../../shared/hooks/useAppSettings';
import { useToast } from '../../../shared/components/ui';
import { storage, STORAGE_KEYS } from '../../../shared/lib/storage';

const AI_CLAUDE_KEY = 'ai_claude_key';
const AI_OPENAI_KEY = 'ai_openai_key';

function APIKeyField({ label, storageKey, placeholder }: {
  label: string; storageKey: string; placeholder: string;
}) {
  const { toast }                       = useToast();
  const [value, setValue]               = useState(() => localStorage.getItem(storageKey) ?? '');
  const [visible, setVisible]           = useState(false);
  const [saved, setSaved]               = useState(false);

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
    ? value.slice(0, 4) + '•'.repeat(Math.min(value.length - 8, 20)) + value.slice(-4)
    : '•'.repeat(value.length);

  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key size={13} className="text-[var(--text-tertiary)]" />
          <span className="text-sm text-[var(--text-primary)]">{label}</span>
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
            aria-label={visible ? 'Ocultar' : 'Mostrar'}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          >
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <Button variant="secondary" size="sm" onClick={handleSave}>Guardar</Button>
      </div>
      {saved && value && (
        <p className="text-[10px] text-[var(--text-tertiary)]">Almacenada: {masked}</p>
      )}
    </div>
  );
}

export default function SettingsView() {
  const { settings, updateSettings } = useAppSettings();
  const { toast }                    = useToast();
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [clearConfirm, setClearConfirm]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const keys = Object.values(STORAGE_KEYS);
      const data: Record<string, unknown> = {};
      for (const key of keys) {
        const val = await storage.getItem(key);
        if (val !== null) data[key] = val;
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `app2habitos_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Datos exportados', 'success');
    } catch {
      toast('Error al exportar', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Record<string, unknown>;
      const validKeys = new Set<string>(Object.values(STORAGE_KEYS));
      for (const [key, val] of Object.entries(data)) {
        if (validKeys.has(key)) {
          await storage.setItem(key, val);
        }
      }
      toast('Datos importados. Recarga la app para ver los cambios.', 'success');
    } catch {
      toast('Error al importar. Verifica que el archivo sea válido.', 'error');
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearAll = async () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 4000);
      return;
    }
    const keys = Object.values(STORAGE_KEYS);
    for (const key of keys) {
      await storage.removeItem(key).catch(() => {});
    }
    toast('Todos los datos eliminados. Recarga la app.', 'warning');
    setClearConfirm(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24 space-y-6">
      <h1 className="text-xl font-semibold text-[var(--text-primary)]">Ajustes</h1>

      {/* Appearance */}
      <div className="section-group">
        <p className="section-header">Apariencia</p>
        <div className="section-body">
          <div className="section-row">
            <div className="section-row-icon" style={{ background: '#1c1c1e20', color: '#1c1c1e' }}>
              <Moon size={15} />
            </div>
            <div className="section-row-content">
              <span className="section-row-label">Modo oscuro</span>
              <Toggle
                checked={settings.theme === 'dark'}
                onChange={v => updateSettings({ theme: v ? 'dark' : 'light' })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="section-group">
        <p className="section-header">Notificaciones</p>
        <div className="section-body">
          <div className="section-row">
            <div className="section-row-icon" style={{ background: '#ff3b3020', color: '#ff3b30' }}>
              <Bell size={15} />
            </div>
            <div className="section-row-content">
              <span className="section-row-label">Notificaciones push</span>
              <Toggle
                checked={settings.notifications}
                onChange={v => updateSettings({ notifications: v })}
              />
            </div>
          </div>
          <div className="section-row">
            <div className="section-row-icon" style={{ background: '#34c75920', color: '#34c759' }}>
              <Smartphone size={15} />
            </div>
            <div className="section-row-content">
              <span className="section-row-label">Vibración háptica</span>
              <Toggle
                checked={settings.haptics}
                onChange={v => updateSettings({ haptics: v })}
              />
            </div>
          </div>
        </div>
        <p className="section-footer">Las notificaciones se activan según los recordatorios de tus hábitos.</p>
      </div>

      {/* AI Keys */}
      <div className="section-group">
        <p className="section-header">Inteligencia Artificial</p>
        <div className="section-body">
          <APIKeyField
            label="Claude (Anthropic)"
            storageKey={AI_CLAUDE_KEY}
            placeholder="sk-ant-api03-…"
          />
          <div style={{ height: '0.5px', background: 'var(--border-subtle)', margin: '0 16px' }} />
          <APIKeyField
            label="OpenAI"
            storageKey={AI_OPENAI_KEY}
            placeholder="sk-proj-…"
          />
        </div>
        <p className="section-footer">
          Las claves se almacenan solo en este dispositivo y nunca se envían a servidores externos.
          Necesitas al menos una para el Asistente IA, análisis de fotos y el Diario con IA.
        </p>
      </div>

      {/* Data */}
      <div className="section-group">
        <p className="section-header">Datos</p>
        <div className="section-body">
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="section-row section-row-pressable w-full text-left"
          >
            <div className="section-row-icon" style={{ background: '#007aff20', color: '#007aff' }}>
              <Download size={15} />
            </div>
            <div className="section-row-content">
              <span className="section-row-label">{exportLoading ? 'Exportando…' : 'Exportar mis datos'}</span>
              <span className="section-row-value">JSON</span>
            </div>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importLoading}
            className="section-row section-row-pressable w-full text-left"
          >
            <div className="section-row-icon" style={{ background: '#34c75920', color: '#34c759' }}>
              <Upload size={15} />
            </div>
            <div className="section-row-content">
              <span className="section-row-label">{importLoading ? 'Importando…' : 'Importar datos'}</span>
              <span className="section-row-value">JSON</span>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={handleClearAll}
            className="section-row section-row-pressable w-full text-left"
          >
            <div className="section-row-icon" style={{ background: '#ff3b3020', color: '#ff3b30' }}>
              <Trash2 size={15} />
            </div>
            <div className="section-row-content">
              <span className="section-row-label" style={{ color: clearConfirm ? 'var(--danger)' : undefined }}>
                {clearConfirm ? '¿Seguro? Pulsa de nuevo para confirmar' : 'Borrar todos los datos'}
              </span>
            </div>
          </button>
        </div>
        <p className="section-footer">Exporta e importa un JSON con todos tus hábitos, entrenamientos, nutrición y diario.</p>
      </div>

      {/* About */}
      <div className="section-group">
        <p className="section-header">Acerca de</p>
        <div className="section-body">
          <div className="section-row">
            <div className="section-row-icon" style={{ background: '#5856d620', color: '#5856d6' }}>
              <Info size={15} />
            </div>
            <div className="section-row-content">
              <span className="section-row-label">APP2Habitos</span>
              <span className="section-row-value">v1.0.0</span>
            </div>
          </div>
        </div>
        <p className="section-footer">Tu sistema operativo personal — hábitos, entrenos, nutrición, diario y objetivos.</p>
      </div>
    </div>
  );
}
