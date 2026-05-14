import { NavLink } from 'react-router-dom';
import {
  CheckSquare, Dumbbell, Apple, BookOpen, ListTodo,
  Bot, BarChart2, Settings, Home
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/today', icon: Home, label: 'Hoy' },
  { to: '/habits', icon: CheckSquare, label: 'Hábitos', color: 'var(--habit-color)' },
  { to: '/workouts', icon: Dumbbell, label: 'Entrenamientos', color: 'var(--workout-color)' },
  { to: '/nutrition', icon: Apple, label: 'Nutrición', color: 'var(--nutrition-color)' },
  { to: '/journal', icon: BookOpen, label: 'Diario', color: 'var(--journal-color)' },
  { to: '/tasks', icon: ListTodo, label: 'Tareas', color: 'var(--task-color)' },
];

const bottomItems = [
  { to: '/assistant', icon: Bot, label: 'Asistente IA' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
];

export function Sidebar() {
  return (
    <nav className="flex flex-col h-full w-full bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] py-4">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[var(--accent)] rounded-[var(--r-md)] flex items-center justify-center">
            <span className="text-white text-xs font-bold">A2</span>
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">APP2Habitos</span>
        </div>
      </div>
      <div className="flex-1 px-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-[var(--r-md)] text-sm transition-all duration-150',
                isActive
                  ? 'bg-[var(--bg-selected)] text-[var(--text-primary)] font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} style={{ color: isActive && color ? color : undefined }} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      <div className="px-2 space-y-0.5 border-t border-[var(--border-subtle)] pt-2 mt-2">
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-[var(--r-md)] text-sm transition-all duration-150',
                isActive
                  ? 'bg-[var(--bg-selected)] text-[var(--text-primary)] font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              )
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
