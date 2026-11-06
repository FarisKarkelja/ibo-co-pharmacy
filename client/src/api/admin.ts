import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CategoryRevenue, ContactInput, ContactMessage, DailyOrders, OrdersByStatus, StatsOverview } from '@ibo/shared';
import { api } from '@/lib/api';

export const useStatsOverview = () =>
  useQuery({ queryKey: ['stats', 'overview'], queryFn: () => api.get<StatsOverview>('/stats/overview') });
export const useRevenueByCategory = () =>
  useQuery({ queryKey: ['stats', 'revenue'], queryFn: () => api.get<CategoryRevenue[]>('/stats/revenue-by-category') });
export const useOrdersByStatus = () =>
  useQuery({ queryKey: ['stats', 'status'], queryFn: () => api.get<OrdersByStatus[]>('/stats/orders-by-status') });
export const useDailyOrders = (days: number) =>
  useQuery({ queryKey: ['stats', 'daily', days], queryFn: () => api.get<DailyOrders[]>(`/stats/daily-orders?days=${days}`) });

export const useSendContact = () =>
  useMutation({ mutationFn: (input: ContactInput) => api.post<{ message: string }>('/contact', input) });

export const useMessages = () => useQuery({ queryKey: ['messages'], queryFn: () => api.get<ContactMessage[]>('/contact') });

function useMessageInvalidation() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['messages'] });
    qc.invalidateQueries({ queryKey: ['stats', 'overview'] });
  };
}

export function useMarkMessage() {
  const onSuccess = useMessageInvalidation();
  return useMutation({
    mutationFn: ({ id, isRead }: { id: number; isRead: boolean }) => api.patch<ContactMessage>(`/contact/${id}/read`, { isRead }),
    onSuccess,
  });
}

export function useDeleteMessage() {
  const onSuccess = useMessageInvalidation();
  return useMutation({ mutationFn: (id: number) => api.delete(`/contact/${id}`), onSuccess });
}
