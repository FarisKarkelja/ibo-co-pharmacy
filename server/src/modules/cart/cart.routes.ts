import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { cartController } from './cart.controller';

export const cartRouter = Router();

cartRouter.use(requireAuth);
cartRouter.get('/', cartController.get);
cartRouter.post('/items', cartController.add);
cartRouter.patch('/items/:productId', cartController.setQuantity);
cartRouter.delete('/items/:productId', cartController.remove);
cartRouter.delete('/', cartController.clear);
