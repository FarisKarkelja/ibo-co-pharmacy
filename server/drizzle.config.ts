import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// Used only by `npm run db:generate` to create SQL migration files from schema.ts.
export default defineConfig({
  dialect: 'mysql',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'ibo_co_pharmacy',
  },
});
