import type { Request, Response } from 'express';
import { checkoutSchema, orderQuerySchema, updateOrderStatusSchema } from '@ibo/shared';
import { currentUser, idParam } from '../../lib/http';
import { parse } from '../../lib/validate';
import { ordersService } from './orders.service';

export const ordersController = {
  async checkout(req: Request, res: Response) {
    const { pickupLocation } = parse(checkoutSchema, req.body);
    res.status(201).json(await ordersService.checkout(currentUser(req).id, pickupLocation));
  },

  async listMine(req: Request, res: Response) {
    res.json(await ordersService.listForUser(currentUser(req).id));
  },

  async getMine(req: Request, res: Response) {
    res.json(await ordersService.getForUser(currentUser(req).id, idParam(req)));
  },

  async cancelMine(req: Request, res: Response) {
    res.json(await ordersService.cancelForUser(currentUser(req).id, idParam(req)));
  },

  async list(req: Request, res: Response) {
    const { status } = parse(orderQuerySchema, req.query);
    res.json(await ordersService.list(status));
  },

  async get(req: Request, res: Response) {
    res.json(await ordersService.get(idParam(req)));
  },

  async updateStatus(req: Request, res: Response) {
    const { status } = parse(updateOrderStatusSchema, req.body);
    res.json(await ordersService.updateStatus(idParam(req), status));
  },

  async delete(req: Request, res: Response) {
    await ordersService.delete(idParam(req));
    res.status(204).end();
  },
};
