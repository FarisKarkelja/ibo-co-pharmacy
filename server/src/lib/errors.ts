// Errors thrown by services. The error handler turns them into JSON responses
// with the right HTTP status, so services never touch req/res.

export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (message: string, details?: Record<string, string[]>) =>
  new AppError(400, message, 'BAD_REQUEST', details);
export const unauthorized = (message = 'Morate biti prijavljeni.') => new AppError(401, message, 'UNAUTHORIZED');
export const forbidden = (message = 'Nemate dozvolu za ovu akciju.') => new AppError(403, message, 'FORBIDDEN');
export const notFound = (message = 'Traženi resurs ne postoji.') => new AppError(404, message, 'NOT_FOUND');
export const conflict = (message: string) => new AppError(409, message, 'CONFLICT');
