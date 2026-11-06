import type { Request, Response } from 'express';
import { categorySchema } from '@ibo/shared';
import { idParam } from '../../lib/http';
import { parse } from '../../lib/validate';
import { publicUrlFor, removeUpload } from '../../middleware/upload';
import { categoriesService } from './categories.service';

const uploadedUrl = (req: Request) => (req.file ? publicUrlFor('categories', req.file.filename) : undefined);

/** If validation or saving fails after an upload, the orphaned file is removed. */
async function withUploadCleanup<T>(req: Request, fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (err) {
    removeUpload(uploadedUrl(req));
    throw err;
  }
}

export const categoriesController = {
  async list(_req: Request, res: Response) {
    res.json(await categoriesService.list());
  },

  async getById(req: Request, res: Response) {
    res.json(await categoriesService.getById(idParam(req)));
  },

  async create(req: Request, res: Response) {
    const category = await withUploadCleanup(req, () =>
      categoriesService.create(parse(categorySchema, req.body), uploadedUrl(req) ?? null),
    );
    res.status(201).json(category);
  },

  async update(req: Request, res: Response) {
    const category = await withUploadCleanup(req, () =>
      categoriesService.update(idParam(req), parse(categorySchema.partial(), req.body), uploadedUrl(req)),
    );
    res.json(category);
  },

  async delete(req: Request, res: Response) {
    await categoriesService.delete(idParam(req));
    res.status(204).end();
  },
};
