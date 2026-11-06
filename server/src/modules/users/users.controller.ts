import type { Request, Response } from 'express';
import { changePasswordSchema, deleteAccountSchema, updateProfileSchema, updateRoleSchema } from '@ibo/shared';
import { AUTH_COOKIE, authCookieOptions } from '../../lib/auth-tokens';
import { currentUser, idParam } from '../../lib/http';
import { parse } from '../../lib/validate';
import { usersService } from './users.service';

export const usersController = {
  async me(req: Request, res: Response) {
    res.json(await usersService.getById(currentUser(req).id));
  },

  async updateMe(req: Request, res: Response) {
    res.json(await usersService.updateProfile(currentUser(req).id, parse(updateProfileSchema, req.body)));
  },

  async changePassword(req: Request, res: Response) {
    await usersService.changePassword(currentUser(req).id, parse(changePasswordSchema, req.body));
    res.json({ message: 'Lozinka je uspješno promijenjena.' });
  },

  async deleteMe(req: Request, res: Response) {
    const { password } = parse(deleteAccountSchema, req.body);
    await usersService.deleteOwnAccount(currentUser(req).id, password);
    res.clearCookie(AUTH_COOKIE, { ...authCookieOptions, maxAge: undefined });
    res.status(204).end();
  },

  async list(_req: Request, res: Response) {
    res.json(await usersService.list());
  },

  async getById(req: Request, res: Response) {
    res.json(await usersService.getById(idParam(req)));
  },

  async changeRole(req: Request, res: Response) {
    const { role } = parse(updateRoleSchema, req.body);
    res.json(await usersService.changeRole(currentUser(req).id, idParam(req), role));
  },

  async delete(req: Request, res: Response) {
    await usersService.deleteByAdmin(currentUser(req).id, idParam(req));
    res.status(204).end();
  },
};
