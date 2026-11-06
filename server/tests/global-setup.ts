import mysql from 'mysql2/promise';
import { testEnv } from '../vitest.config';

export async function setup() {
  Object.assign(process.env, testEnv);
  const { env } = await import('../src/config/env');
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  });
  await connection.query(`DROP DATABASE IF EXISTS \`${env.DB_NAME}\``);
  await connection.query(`CREATE DATABASE \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.end();

  const { runMigrations } = await import('../src/db/scripts/migrate');
  const { pool } = await import('../src/db/client');
  await runMigrations();
  await pool.end();
}
