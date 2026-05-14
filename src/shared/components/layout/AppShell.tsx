import { useTheme } from '../../hooks/useTheme';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  useTheme();

  return (
    <div className="flex h-screen h-[100dvh] bg-[var(--bg-void)] overflow-hidden">
      <aside className="hidden md:flex w-60 shrink-0">
        <Sidebar />
      </aside>
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="min-h-full pb-20 md:pb-0">
          {children}
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40">
        <BottomNav />
      </div>
    </div>
  );
}
