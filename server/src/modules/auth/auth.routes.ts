import { Router } from 'express';
import { optionalAuth } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rate-limit';
import { authController } from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', authLimiter, authController.register);
authRouter.post('/login', authLimiter, authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', optionalAuth, authController.me);
