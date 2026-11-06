import rateLimit from 'express-rate-limit';
import { isTest } from '../config/env';

const message = (text: string) => ({ error: { message: text, code: 'TOO_MANY_REQUESTS' } });

/** Slows down password guessing on login and mass account creation. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => isTest,
  message: message('Previše pokušaja. Pokušajte ponovo za nekoliko minuta.'),
});

export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => isTest,
  message: message('Poslali ste previše poruka. Pokušajte ponovo kasnije.'),
});
