import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { reviewsController } from './reviews.controller';

export const reviewsRouter = Router();

reviewsRouter.get('/', reviewsController.list);
reviewsRouter.get('/summary', reviewsController.summary);
reviewsRouter.post('/', requireAuth, reviewsController.create);
reviewsRouter.patch('/:id', requireAuth, reviewsController.update);
reviewsRouter.delete('/:id', requireAuth, reviewsController.delete);
