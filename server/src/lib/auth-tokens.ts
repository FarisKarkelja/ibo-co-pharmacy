import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Role } from '@ibo/shared';
import { env, isProduction } from '../config/env';

export const AUTH_COOKIE = 'iboco_session';

export interface TokenPayload {
  sub: number;
  role: Role;
}

export function signToken(payload: TokenPayload) {
  return jwt.sign({ role: payload.role }, env.JWT_SECRET, {
    subject: String(payload.sub),
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'ibo-co-pharmacy',
  });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, { issuer: 'ibo-co-pharmacy' }) as jwt.JwtPayload;
  return { sub: Number(decoded.sub), role: decoded.role as Role };
}

/** httpOnly: JavaScript cannot read the token, so an XSS bug cannot steal it. */
export const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isProduction,
  path: '/',
  maxAge: 14 * 60 * 60 * 1000,
};

const SALT_ROUNDS = 12;
export const hashPassword = (plain: string) => bcrypt.hash(plain, SALT_ROUNDS);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
