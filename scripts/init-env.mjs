// Creates server/.env from .env.example on first setup, with a random JWT secret.
// Existing .env files are never overwritten.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(import.meta.dirname, '..', 'server');
const target = path.join(dir, '.env');

if (fs.existsSync(target)) {
  console.log('server/.env already exists, keeping it.');
} else {
  const example = fs.readFileSync(path.join(dir, '.env.example'), 'utf8');
  const secret = crypto.randomBytes(48).toString('base64url');
  fs.writeFileSync(target, example.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`));
  console.log('Created server/.env (XAMPP defaults: user root, no password). Edit it if your MySQL differs.');
}
