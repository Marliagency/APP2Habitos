import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, CheckSquare, Dumbbell, Apple, ListTodo } from 'lucide-react';
import clsx from 'clsx';

const navItems: { to: string; icon: LucideIcon; label: string; end?: boolean }[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/habits', icon: CheckSquare, label: 'Hábitos' },
  { to: '/workouts', icon: Dumbbell, label: 'Entrenos' },
  { to: '/nutrition', icon: Apple, label: 'Nutrición' },
  { to: '/tasks', icon: ListTodo, label: 'Tareas' },
];

export function BottomNav() {
  return (
    <nav
      className="flex items-end bg-[var(--bg-surface)]/90 backdrop-blur-md border-t border-[var(--border-subtle)]"
      style={{ paddingBottom: 'max(var(--safe-bottom), 8px)' }}
    >
      {navItems.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            clsx(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[44px]',
              'transition-colors duration-150',
              isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
            )
          }
        >
          <Icon size={22} strokeWidth={1.75} />
          <span className="text-[10px]">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
