import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { Providers } from './providers';
import { AppShell } from '../shared/components/layout/AppShell';
import { AppRoutes } from './routes';
import { runMigrations } from '../shared/lib/migrations';

export function App() {
  useEffect(() => {
    runMigrations().catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <Providers>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </Providers>
    </BrowserRouter>
  );
}
