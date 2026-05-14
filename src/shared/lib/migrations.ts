import { storage } from './storage';

interface Migration {
  version: number;
  name: string;
  up: () => Promise<void>;
}

const migrations: Migration[] = [
  // Example migration structure for future use
  // { version: 2, name: 'add-habit-identity', up: async () => { ... } }
];

const MIGRATION_VERSION_KEY = 'app.migration.version';

export async function runMigrations(): Promise<void> {
  const currentVersion = (await storage.getItem<number>(MIGRATION_VERSION_KEY)) ?? 1;
  const pending = migrations.filter(m => m.version > currentVersion);

  for (const migration of pending) {
    try {
      await migration.up();
      await storage.setItem(MIGRATION_VERSION_KEY, migration.version);
    } catch (error) {
      console.error(`Migration ${migration.name} failed:`, error);
      throw error;
    }
  }
}
