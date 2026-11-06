import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

// One place that turns any thrown error into a consistent JSON response:
// { error: { message, code, details? } }. Internal errors never leak SQL or stack traces.

export function zodDetails(error: ZodError) {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    (details[key] ??= []).push(issue.message);
  }
  return details;
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: { message: `Ruta ${req.method} ${req.path} ne postoji.`, code: 'NOT_FOUND' } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { message: err.message, code: err.code, details: err.details } });
  }

  if (err instanceof ZodError) {
    const details = zodDetails(err);
    const first = Object.values(details)[0]?.[0] ?? 'Neispravni podaci.';
    return res.status(400).json({ error: { message: first, code: 'VALIDATION_ERROR', details } });
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Slika može imati najviše 3 MB.' : 'Greška pri uploadu slike.';
    return res.status(400).json({ error: { message, code: 'UPLOAD_ERROR' } });
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: { message: 'Neispravan JSON.', code: 'BAD_JSON' } });
  }

  // Errors from Express itself (e.g. a missing static file) carry their own status
  const status = (err as { status?: number; statusCode?: number })?.status ?? (err as { statusCode?: number })?.statusCode;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return res.status(status).json({ error: { message: status === 404 ? 'Datoteka ne postoji.' : 'Neispravan zahtjev.', code: 'BAD_REQUEST' } });
  }

  const mysqlCode = (err as { code?: string })?.code;
  if (mysqlCode === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: { message: 'Zapis s ovim podacima već postoji.', code: 'CONFLICT' } });
  }
  if (mysqlCode === 'ER_ROW_IS_REFERENCED_2' || mysqlCode === 'ER_ROW_IS_REFERENCED') {
    return res
      .status(409)
      .json({ error: { message: 'Zapis se ne može obrisati jer ga koriste drugi podaci.', code: 'CONFLICT' } });
  }

  logger.error({ err, method: req.method, url: req.originalUrl }, 'Unhandled error');
  res.status(500).json({ error: { message: 'Došlo je do greške na serveru. Pokušajte ponovo.', code: 'INTERNAL_ERROR' } });
}
