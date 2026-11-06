import mysql from 'mysql2/promise';
import { env } from '../../config/env';

// One command for a fresh machine: creates the database (utf8mb4 for č, ć, š, ž, đ),
// applies the migrations and loads demo data.

async function setup() {
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  });
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await connection.end();
  console.log(`Database "${env.DB_NAME}" is ready.`);

  // Imported after the database exists, because the pool connects to it
  const { pool } = await import('../client');
  const { runMigrations } = await import('./migrate');
  const { seed } = await import('./seed');
  try {
    await runMigrations();
    console.log('Migrations applied.');
    await seed();
    console.log('Done. Start the app with: npm run dev');
  } finally {
    await pool.end();
  }
}

setup().catch((err) => {
  console.error('\nSetup failed:', err.message);
  if (err.code === 'ECONNREFUSED') console.error('Is MySQL running? Start it in the XAMPP Control Panel.');
  if (err.code === 'ER_ACCESS_DENIED_ERROR') console.error('Check DB_USER and DB_PASSWORD in server/.env.');
  process.exit(1);
});
