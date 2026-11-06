import type { CategoryInput } from '@ibo/shared';
import { conflict, notFound } from '../../lib/errors';
import { removeUpload } from '../../middleware/upload';
import { categoriesRepository } from './categories.repository';

export const categoriesService = {
  list: () => categoriesRepository.list(),

  async getById(id: number) {
    const category = await categoriesRepository.findById(id);
    if (!category) throw notFound('Kategorija ne postoji.');
    return category;
  },

  create: (input: CategoryInput, imageUrl: string | null) =>
    categoriesRepository.create({ name: input.name, description: input.description ?? '', imageUrl }),

  async update(id: number, input: Partial<CategoryInput>, imageUrl?: string) {
    const existing = await this.getById(id);
    const updated = await categoriesRepository.update(id, { ...input, ...(imageUrl ? { imageUrl } : {}) });
    if (imageUrl) removeUpload(existing.imageUrl);
    return updated!;
  },

  async delete(id: number) {
    const existing = await this.getById(id);
    const products = await categoriesRepository.countProducts(id);
    if (products > 0) {
      throw conflict(`Kategorija sadrži ${products} proizvod(a). Premjestite ili obrišite proizvode prije brisanja kategorije.`);
    }
    await categoriesRepository.delete(id);
    removeUpload(existing.imageUrl);
  },
};
