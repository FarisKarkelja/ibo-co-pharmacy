import { Router } from 'express';
import { requireAdmin, requireAuth } from '../../middleware/auth';
import { usersController } from './users.controller';

export const usersRouter = Router();

// Own account
usersRouter.get('/me', requireAuth, usersController.me);
usersRouter.patch('/me', requireAuth, usersController.updateMe);
usersRouter.patch('/me/password', requireAuth, usersController.changePassword);
usersRouter.delete('/me', requireAuth, usersController.deleteMe);

// Administration
usersRouter.get('/', requireAdmin, usersController.list);
usersRouter.get('/:id', requireAdmin, usersController.getById);
usersRouter.patch('/:id/role', requireAdmin, usersController.changeRole);
usersRouter.delete('/:id', requireAdmin, usersController.delete);
