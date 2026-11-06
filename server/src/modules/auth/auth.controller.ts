import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from '@ibo/shared';
import { AUTH_COOKIE, authCookieOptions } from '../../lib/auth-tokens';
import { parse } from '../../lib/validate';
import { usersService } from '../users/users.service';
import { authService } from './auth.service';

export const authController = {
  async register(req: Request, res: Response) {
    const { user, token } = await authService.register(parse(registerSchema, req.body));
    res.cookie(AUTH_COOKIE, token, authCookieOptions).status(201).json(user);
  },

  async login(req: Request, res: Response) {
    const { user, token } = await authService.login(parse(loginSchema, req.body));
    res.cookie(AUTH_COOKIE, token, authCookieOptions).json(user);
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie(AUTH_COOKIE, { ...authCookieOptions, maxAge: undefined }).status(204).end();
  },

  /** Returns the signed-in user, or null for guests (200 either way, so the client can check silently). */
  async me(req: Request, res: Response) {
    res.json(req.user ? await usersService.getById(req.user.id) : null);
  },
};
