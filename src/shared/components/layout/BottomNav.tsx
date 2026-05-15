import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Sun, Dumbbell, Apple, Target } from 'lucide-react';
import clsx from 'clsx';

const navItems: { to: string; icon: LucideIcon; label: string; end?: boolean }[] = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio', end: true },
  { to: '/today', icon: Sun, label: 'Hoy' },
  { to: '/workouts', icon: Dumbbell, label: 'Entrenos' },
  { to: '/nutrition', icon: Apple, label: 'Nutrición' },
  { to: '/goals', icon: Target, label: 'Objetivos' },
];

export function BottomNav() {
  return (
    <nav
      className="flex items-end bg-[var(--bg-surface)]/95 backdrop-blur-xl border-t border-[var(--border-subtle)]"
      style={{ paddingBottom: 'max(var(--safe-bottom), 6px)' }}
    >
      {navItems.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            clsx(
              'flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1',
              'transition-all duration-150',
              isActive
                ? 'text-[var(--accent)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: 'var(--qyro-grad)' }}
                  />
                )}
              </div>
              <span className="text-[9px] font-semibold tracking-wide uppercase mt-0.5">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
