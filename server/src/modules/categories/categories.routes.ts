import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth';
import { imageUpload } from '../../middleware/upload';
import { categoriesController } from './categories.controller';

export const categoriesRouter = Router();

categoriesRouter.get('/', categoriesController.list);
categoriesRouter.get('/:id', categoriesController.getById);
categoriesRouter.post('/', requireAdmin, imageUpload('categories'), categoriesController.create);
categoriesRouter.patch('/:id', requireAdmin, imageUpload('categories'), categoriesController.update);
categoriesRouter.delete('/:id', requireAdmin, categoriesController.delete);
