import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Order, OrderDetails, OrderStatus } from '@ibo/shared';
import { api, qs } from '@/lib/api';

export function useMyOrders() {
  return useQuery({ queryKey: ['orders', 'mine'], queryFn: () => api.get<Order[]>('/orders/me') });
}

/** Admins read any order through /orders/:id, customers only their own through /orders/me/:id. */
export function useOrderDetails(id: number | null, scope: 'mine' | 'admin') {
  return useQuery({
    queryKey: ['orders', scope, 'details', id],
    queryFn: () => api.get<OrderDetails>(scope === 'mine' ? `/orders/me/${id}` : `/orders/${id}`),
    enabled: id !== null,
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post<OrderDetails>(`/orders/me/${id}/cancel`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useOrders(status?: OrderStatus) {
  return useQuery({ queryKey: ['orders', 'all', status], queryFn: () => api.get<Order[]>(`/orders${qs({ status })}`) });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      api.patch<OrderDetails>(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/orders/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
