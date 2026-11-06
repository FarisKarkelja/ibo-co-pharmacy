import type { ReviewInput, ReviewLocation, ReviewSummary, Role } from '@ibo/shared';
import { forbidden, notFound } from '../../lib/errors';
import { reviewsRepository } from './reviews.repository';

export const reviewsService = {
  list: (limit: number, location?: ReviewLocation) => reviewsRepository.list(limit, location),

  async summary(): Promise<ReviewSummary> {
    const { average, count, dist } = await reviewsRepository.summary();
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const d of dist) distribution[d.rating as 1 | 2 | 3 | 4 | 5] = d.count;
    return { average: Math.round(average * 10) / 10, count, distribution };
  },

  create: (userId: number, input: ReviewInput) => reviewsRepository.create({ ...input, userId }),

  /** Authors can edit and delete their own reviews; admins can moderate any review. */
  async ensureCanModify(id: number, user: { id: number; role: Role }) {
    const review = await reviewsRepository.findById(id);
    if (!review) throw notFound('Recenzija ne postoji.');
    if (review.userId !== user.id && user.role !== 'Admin') throw forbidden('Možete mijenjati samo svoje recenzije.');
    return review;
  },

  async update(id: number, user: { id: number; role: Role }, input: { comment: string; rating?: number }) {
    await this.ensureCanModify(id, user);
    return reviewsRepository.update(id, input);
  },

  async delete(id: number, user: { id: number; role: Role }) {
    await this.ensureCanModify(id, user);
    await reviewsRepository.delete(id);
  },
};
