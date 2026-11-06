import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '../config/env';
import * as schema from './schema';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: 10,
  // DECIMAL columns come back as strings by default; numbers are easier to work with
  decimalNumbers: true,
  timezone: 'Z',
});

// Store and read all timestamps in UTC, whatever time zone the MySQL server uses.
// Without this, CURRENT_TIMESTAMP is written in server-local time and read back as UTC.
pool.pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

export const db = drizzle(pool, { schema, mode: 'default' });

export type Database = typeof db;
/** Either the root db or an open transaction; repositories accept both. */
export type DbExecutor = Database | Parameters<Parameters<Database['transaction']>[0]>[0];
