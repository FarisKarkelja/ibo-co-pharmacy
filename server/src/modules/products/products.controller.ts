import type { Request, Response } from 'express';
import { productQuerySchema, productSchema, productUpdateSchema } from '@ibo/shared';
import { idParam } from '../../lib/http';
import { parse } from '../../lib/validate';
import { publicUrlFor, removeUpload } from '../../middleware/upload';
import { productsService } from './products.service';

const uploadedUrl = (req: Request) => (req.file ? publicUrlFor('products', req.file.filename) : undefined);

async function withUploadCleanup<T>(req: Request, fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (err) {
    removeUpload(uploadedUrl(req));
    throw err;
  }
}

export const productsController = {
  async list(req: Request, res: Response) {
    res.json(await productsService.list(parse(productQuerySchema, req.query)));
  },

  async getById(req: Request, res: Response) {
    res.json(await productsService.getById(idParam(req)));
  },

  async create(req: Request, res: Response) {
    const product = await withUploadCleanup(req, () =>
      productsService.create(parse(productSchema, req.body), uploadedUrl(req) ?? null),
    );
    res.status(201).json(product);
  },

  async update(req: Request, res: Response) {
    const product = await withUploadCleanup(req, () =>
      productsService.update(idParam(req), parse(productUpdateSchema, req.body ?? {}), uploadedUrl(req)),
    );
    res.json(product);
  },

  async delete(req: Request, res: Response) {
    await productsService.delete(idParam(req));
    res.status(204).end();
  },
};
