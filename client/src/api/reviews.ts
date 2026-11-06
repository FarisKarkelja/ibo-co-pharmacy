import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Review, ReviewInput, ReviewSummary } from '@ibo/shared';
import { api, qs } from '@/lib/api';

export function useReviews(limit = 50) {
  return useQuery({ queryKey: ['reviews', limit], queryFn: () => api.get<Review[]>(`/reviews${qs({ limit })}`) });
}

export function useReviewSummary() {
  return useQuery({ queryKey: ['reviews', 'summary'], queryFn: () => api.get<ReviewSummary>('/reviews/summary') });
}

function useReviewInvalidation() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['reviews'] });
    qc.invalidateQueries({ queryKey: ['stats'] });
  };
}

export function useCreateReview() {
  const onSuccess = useReviewInvalidation();
  return useMutation({ mutationFn: (input: ReviewInput) => api.post<Review>('/reviews', input), onSuccess });
}

export function useUpdateReview() {
  const onSuccess = useReviewInvalidation();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number; comment: string; rating: number }) => api.patch<Review>(`/reviews/${id}`, input),
    onSuccess,
  });
}

export function useDeleteReview() {
  const onSuccess = useReviewInvalidation();
  return useMutation({ mutationFn: (id: number) => api.delete(`/reviews/${id}`), onSuccess });
}
