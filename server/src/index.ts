import { createApp } from './app';
import { env } from './config/env';
import { pool } from './db/client';
import { logger } from './lib/logger';

async function main() {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    logger.error(
      { err: (err as Error).message },
      `Cannot connect to MySQL at ${env.DB_HOST}:${env.DB_PORT} (database "${env.DB_NAME}"). ` +
        'Is MySQL running in XAMPP, and did you run "npm run db:setup"?',
    );
    process.exit(1);
  }

  const server = createApp().listen(env.PORT, () => {
    logger.info(`API ready on http://localhost:${env.PORT}/api  (docs: http://localhost:${env.PORT}/api/docs)`);
  });

  const shutdown = () => {
    server.close(() => pool.end().then(() => process.exit(0)));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();
