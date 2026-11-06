import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth';
import { imageUpload } from '../../middleware/upload';
import { productsController } from './products.controller';

export const productsRouter = Router();

productsRouter.get('/', productsController.list);
productsRouter.get('/:id', productsController.getById);
productsRouter.post('/', requireAdmin, imageUpload('products'), productsController.create);
productsRouter.patch('/:id', requireAdmin, imageUpload('products'), productsController.update);
productsRouter.delete('/:id', requireAdmin, productsController.delete);
