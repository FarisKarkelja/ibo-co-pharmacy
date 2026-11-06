import path from 'node:path';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db, pool } from '../client';

export const MIGRATIONS_DIR = path.resolve(process.cwd(), 'src/db/migrations');

/** Applies pending SQL migrations from src/db/migrations (tracked in __drizzle_migrations). */
export async function runMigrations() {
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
}

if (process.argv[1]?.replace(/\\/g, '/').match(/scripts\/migrate\.(ts|js)$/)) {
  runMigrations()
    .then(() => {
      console.log('Migrations applied.');
      return pool.end();
    })
    .catch(async (err) => {
      console.error(err);
      await pool.end();
      process.exit(1);
    });
}
