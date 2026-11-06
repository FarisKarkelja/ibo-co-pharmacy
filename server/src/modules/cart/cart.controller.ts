import type { Request, Response } from 'express';
import { addToCartSchema, updateCartItemSchema } from '@ibo/shared';
import { z } from 'zod';
import { currentUser } from '../../lib/http';
import { parse } from '../../lib/validate';
import { cartService } from './cart.service';

const productIdParam = z.object({ productId: z.coerce.number().int().positive() });

// The cart always belongs to the signed-in user: the user id comes from the
// session, never from the URL or body (v1 trusted user_id and unit_price from the client).
export const cartController = {
  async get(req: Request, res: Response) {
    res.json(await cartService.getSummary(currentUser(req).id));
  },

  async add(req: Request, res: Response) {
    const { productId, quantity } = parse(addToCartSchema, req.body);
    res.status(201).json(await cartService.add(currentUser(req).id, productId, quantity));
  },

  async setQuantity(req: Request, res: Response) {
    const { productId } = parse(productIdParam, req.params);
    const { quantity } = parse(updateCartItemSchema, req.body);
    res.json(await cartService.setQuantity(currentUser(req).id, productId, quantity));
  },

  async remove(req: Request, res: Response) {
    const { productId } = parse(productIdParam, req.params);
    res.json(await cartService.remove(currentUser(req).id, productId));
  },

  async clear(req: Request, res: Response) {
    res.json(await cartService.clear(currentUser(req).id));
  },
};
