import { productQuerySchema, type Paginated, type Product, productSchema, productUpdateSchema } from '@ibo/shared';
import type { z } from 'zod';
import { badRequest, notFound } from '../../lib/errors';
import { removeUpload } from '../../middleware/upload';
import { categoriesRepository } from '../categories/categories.repository';
import { productsRepository } from './products.repository';

type Query = z.output<typeof productQuerySchema>;

export const productsService = {
  async list(q: Query): Promise<Paginated<Product>> {
    const { items, total } = await productsRepository.list(
      { categoryId: q.categoryId, search: q.search || undefined, featured: q.featured, prescription: q.prescription },
      q.sort,
      q.page,
      q.pageSize,
    );
    return { items, total, page: q.page, pageSize: q.pageSize, totalPages: Math.max(1, Math.ceil(total / q.pageSize)) };
  },

  async getById(id: number) {
    const product = await productsRepository.findById(id);
    if (!product) throw notFound('Proizvod ne postoji.');
    return product;
  },

  async create(input: z.output<typeof productSchema>, imageUrl: string | null) {
    await this.ensureCategory(input.categoryId);
    return productsRepository.create({ ...input, imageUrl });
  },

  async update(id: number, input: z.output<typeof productUpdateSchema>, imageUrl?: string) {
    const existing = await this.getById(id);
    if (input.categoryId) await this.ensureCategory(input.categoryId);
    const updated = await productsRepository.update(id, { ...input, ...(imageUrl ? { imageUrl } : {}) });
    if (imageUrl) removeUpload(existing.imageUrl);
    return updated!;
  },

  async delete(id: number) {
    const existing = await this.getById(id);
    await productsRepository.delete(id);
    removeUpload(existing.imageUrl);
  },

  async ensureCategory(categoryId: number) {
    if (!(await categoriesRepository.findById(categoryId))) {
      throw badRequest('Odabrana kategorija ne postoji.', { categoryId: ['Odabrana kategorija ne postoji.'] });
    }
  },
};
