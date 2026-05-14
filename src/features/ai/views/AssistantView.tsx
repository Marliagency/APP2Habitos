import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, User, Settings, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { Button, Spinner } from '../../../shared/components/ui';
import { useToast } from '../../../shared/components/ui';
import { useGoalsStore } from '../../goals/store/goalsStore';
import { useHabitsStore } from '../../habits/store/habitsStore';
import { useNutritionStore } from '../../nutrition/store/nutritionStore';
import { useWorkoutsStore } from '../../workouts/store/workoutsStore';
import { useJournalStore } from '../../journal/store/journalStore';
import { INTENT_LABELS } from '../../goals/types';

const AI_CLAUDE_KEY = 'ai_claude_key';
const AI_OPENAI_KEY = 'ai_openai_key';

type Role    = 'user' | 'assistant' | 'system';
type Model   = 'claude' | 'openai';

interface Message {
  id:        string;
  role:      Role;
  content:   string;
  timestamp: string;
  model?:    Model;
  error?:    boolean;
}

const BASE_PROMPT = `Eres un asistente personal de productividad y bienestar integrado en APP2Habitos.
Ayudas al usuario con sus hábitos, entrenamiento, nutrición, diario personal y tareas.
Eres conciso, empático y orientado a la acción. Respondes en español.
Cuando el usuario mencione hábitos, ejercicio, comida o emociones, ofrece consejos personalizados y concretos basados en los datos del usuario a continuación.`;

function buildSystemPrompt(ctx: {
  goalLabel?: string;
  goalSummary?: string;
  calorieTarget?: number;
  proteinTarget?: number;
  habitNames: string[];
  avgCalories7d: number | null;
  workoutsThisWeek: number;
  avgMood7d: number | null;
  todayCalories: number | null;
}): string {
  const lines: string[] = [BASE_PROMPT, '', '## Datos del usuario (hoy)'];
  const today = format(new Date(), 'yyyy-MM-dd');
  lines.push(`Fecha: ${today}`);

  if (ctx.goalLabel) lines.push(`Objetivo principal: ${ctx.goalLabel}${ctx.goalSummary ? ` — ${ctx.goalSummary}` : ''}`);
  if (ctx.calorieTarget) lines.push(`Objetivo de calorías: ${ctx.calorieTarget} kcal/día`);
  if (ctx.proteinTarget) lines.push(`Objetivo de proteínas: ${ctx.proteinTarget}g/día`);
  if (ctx.habitNames.length) lines.push(`Hábitos activos: ${ctx.habitNames.slice(0, 6).join(', ')}`);
  if (ctx.avgCalories7d !== null) lines.push(`Calorías media últimos 7 días: ${Math.round(ctx.avgCalories7d)} kcal`);
  if (ctx.todayCalories !== null) lines.push(`Calorías registradas hoy: ${ctx.todayCalories} kcal`);
  if (ctx.workoutsThisWeek >= 0) lines.push(`Entrenamientos esta semana: ${ctx.workoutsThisWeek}`);
  if (ctx.avgMood7d !== null) lines.push(`Estado de ánimo medio (7d): ${ctx.avgMood7d.toFixed(1)}/5`);

  return lines.join('\n');
}

const QUICK_PROMPTS = [
  '¿Cómo puedo mejorar mi racha de hábitos?',
  'Dame un plan de entrenamiento para hoy',
  '¿Qué debería comer para mis objetivos?',
  'Ayúdame a reflexionar sobre mi semana',
  '¿Cómo gestionar mejor mi tiempo?',
];

async function callClaude(messages: { role: string; content: string }[], apiKey: string, systemPrompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':            'application/json',
      'x-api-key':               apiKey,
      'anthropic-version':       '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:     systemPrompt,
      messages:   messages.filter(m => m.role !== 'system'),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Error ${res.status}`);
  }
  const data = await res.json() as { content: { text: string }[] };
  return data.content[0]?.text ?? '';
}

async function callOpenAI(messages: { role: string; content: string }[], apiKey: string, systemPrompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:       'gpt-4o-mini',
      max_tokens:  1024,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.filter(m => m.role !== 'system'),
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Error ${res.status}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message?.content ?? '';
}

const uid = () => crypto.randomUUID();

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-[var(--accent)]' : msg.error ? 'bg-[var(--danger)]/20' : 'bg-[var(--bg-hover)]'
      }`}>
        {isUser
          ? <User size={14} className="text-white" />
          : msg.error
            ? <AlertCircle size={14} className="text-[var(--danger)]" />
            : <Bot size={14} className="text-[var(--text-secondary)]" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-3.5 py-2.5 rounded-[var(--r-xl)] text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-[var(--accent)] text-white rounded-tr-sm'
            : msg.error
              ? 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20 rounded-tl-sm'
              : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm'
        }`}>
          {msg.content}
        </div>
        <span className="text-[9px] text-[var(--text-tertiary)] px-1">
          {format(new Date(msg.timestamp), 'HH:mm')}
          {msg.model && !isUser && ` · ${msg.model === 'claude' ? 'Claude' : 'GPT-4o mini'}`}
        </span>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-2.5"
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[var(--bg-hover)]">
        <Bot size={14} className="text-[var(--text-secondary)]" />
      </div>
      <div className="px-3.5 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] rounded-tl-sm flex gap-1 items-center">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function AssistantView() {
  const navigate   = useNavigate();
  const { toast }  = useToast();

  const claudeKey  = localStorage.getItem(AI_CLAUDE_KEY) ?? '';
  const openaiKey  = localStorage.getItem(AI_OPENAI_KEY) ?? '';
  const hasKey     = !!(claudeKey || openaiKey);

  // App context for dynamic system prompt
  const { goal }                  = useGoalsStore();
  const { habits, getActiveHabits } = useHabitsStore();
  const nutritionStore            = useNutritionStore();
  const { workouts }              = useWorkoutsStore();
  const { getAverageMood }        = useJournalStore();

  const preferredModel: Model = claudeKey ? 'claude' : 'openai';
  const [model,    setModel]    = useState<Model>(preferredModel);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !hasKey) return;

    const activeKey = model === 'claude' ? claudeKey : openaiKey;
    if (!activeKey) {
      toast(`No hay clave API para ${model === 'claude' ? 'Claude' : 'OpenAI'}`, 'error');
      return;
    }

    // Build live context snapshot
    const today    = format(new Date(), 'yyyy-MM-dd');
    const cutoff   = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const last7    = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
    const calReadings = last7.map(d => nutritionStore.getTotalsForDate(d).calories).filter(c => c > 0);
    const todayKcal   = nutritionStore.getTotalsForDate(today).calories;
    const workoutsThisWeek = workouts.filter(w => w.date >= cutoff && w.date <= today).length;

    const systemPrompt = buildSystemPrompt({
      goalLabel:        goal ? INTENT_LABELS[goal.intent] : undefined,
      goalSummary:      goal?.derived.weeklyGoalSummary,
      calorieTarget:    goal?.derived.calorieTarget ?? nutritionStore.targets?.calories,
      proteinTarget:    goal?.derived.proteinG ?? nutritionStore.targets?.protein,
      habitNames:       getActiveHabits().map(h => h.name),
      avgCalories7d:    calReadings.length ? calReadings.reduce((a, b) => a + b, 0) / calReadings.length : null,
      workoutsThisWeek,
      avgMood7d:        getAverageMood(7),
      todayCalories:    todayKcal > 0 ? Math.round(todayKcal) : null,
    });

    const userMsg: Message = {
      id:        uid(),
      role:      'user',
      content:   trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role as string, content: m.content }));
      const reply = model === 'claude'
        ? await callClaude(history, activeKey, systemPrompt)
        : await callOpenAI(history, activeKey, systemPrompt);

      const assistantMsg: Message = {
        id:        uid(),
        role:      'assistant',
        content:   reply,
        timestamp: new Date().toISOString(),
        model,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg: Message = {
        id:        uid(),
        role:      'assistant',
        content:   err instanceof Error ? err.message : 'Error desconocido al contactar con la IA.',
        timestamp: new Date().toISOString(),
        error:     true,
      };
      setMessages(prev => [...prev, errMsg]);
      toast('Error al enviar mensaje', 'error');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [messages, model, claudeKey, openaiKey, hasKey, loading, toast, goal, habits, workouts, nutritionStore, getActiveHabits, getAverageMood]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!hasKey) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-full flex items-center justify-center">
          <Bot size={28} className="text-[var(--accent)]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Asistente IA</h2>
          <p className="text-sm text-[var(--text-tertiary)] max-w-xs">
            Configura tu clave API de Claude o OpenAI en Ajustes para activar el asistente personal.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Settings size={14} />}
          onClick={() => navigate('/settings')}
        >
          Ir a Ajustes
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-base)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[var(--accent)] rounded-[var(--r-md)] flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">Asistente IA</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Model toggle */}
          <div className="flex bg-[var(--bg-hover)] rounded-[var(--r-md)] p-0.5">
            {(claudeKey ? ['claude'] : []).concat(openaiKey ? ['openai'] : []).map(m => (
              <button
                key={m}
                onClick={() => setModel(m as Model)}
                className={`px-2.5 py-1 rounded-sm text-[10px] font-medium transition-all ${
                  model === m
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)]'
                }`}
              >
                {m === 'claude' ? 'Claude' : 'GPT-4o'}
              </button>
            ))}
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              aria-label="Limpiar conversación"
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Trash2 size={13} className="text-[var(--text-tertiary)]" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bot size={20} className="text-[var(--accent)]" />
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)]">¿En qué puedo ayudarte?</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Pregúntame sobre hábitos, entrenamientos, nutrición o bienestar.</p>
            </div>
            <div className="space-y-2">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left px-3.5 py-2.5 rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje… (Enter para enviar, Shift+Enter para nueva línea)"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none px-3.5 py-2.5 rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 disabled:opacity-50 max-h-32 overflow-y-auto"
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            aria-label="Enviar mensaje"
            className="w-10 h-10 flex items-center justify-center rounded-[var(--r-lg)] bg-[var(--accent)] text-white disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
          >
            {loading ? <Spinner size="sm" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
