import type { Request, Response } from 'express';
import { reviewQuerySchema, reviewSchema, reviewUpdateSchema } from '@ibo/shared';
import { currentUser, idParam } from '../../lib/http';
import { parse } from '../../lib/validate';
import { reviewsService } from './reviews.service';

export const reviewsController = {
  async list(req: Request, res: Response) {
    const { limit, location } = parse(reviewQuerySchema, req.query);
    res.json(await reviewsService.list(limit, location));
  },

  async summary(_req: Request, res: Response) {
    res.json(await reviewsService.summary());
  },

  async create(req: Request, res: Response) {
    res.status(201).json(await reviewsService.create(currentUser(req).id, parse(reviewSchema, req.body)));
  },

  async update(req: Request, res: Response) {
    res.json(await reviewsService.update(idParam(req), currentUser(req), parse(reviewUpdateSchema, req.body)));
  },

  async delete(req: Request, res: Response) {
    await reviewsService.delete(idParam(req), currentUser(req));
    res.status(204).end();
  },
};
