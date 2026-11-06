import pino from 'pino';
import { env, isProduction, isTest } from '../config/env';

// Structured logger. Passwords, tokens and cookies are always redacted,
// so credentials never end up in log files (a problem in v1).
export const logger = pino({
  level: isTest ? 'silent' : isProduction ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.newPassword',
      '*.currentPassword',
      '*.passwordHash',
    ],
    censor: '[redacted]',
  },
  transport:
    !isProduction && !isTest && env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
      : undefined,
});
