import { Router } from 'express';
import { requireAdmin, requireAuth } from '../../middleware/auth';
import { ordersController } from './orders.controller';

export const ordersRouter = Router();

// Customer
ordersRouter.post('/checkout', requireAuth, ordersController.checkout);
ordersRouter.get('/me', requireAuth, ordersController.listMine);
ordersRouter.get('/me/:id', requireAuth, ordersController.getMine);
ordersRouter.post('/me/:id/cancel', requireAuth, ordersController.cancelMine);

// Administration
ordersRouter.get('/', requireAdmin, ordersController.list);
ordersRouter.get('/:id', requireAdmin, ordersController.get);
ordersRouter.patch('/:id/status', requireAdmin, ordersController.updateStatus);
ordersRouter.delete('/:id', requireAdmin, ordersController.delete);
