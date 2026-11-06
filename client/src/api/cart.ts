import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CartSummary, CheckoutInput, OrderDetails } from '@ibo/shared';
import { api } from '@/lib/api';
import { useMe } from './auth';

export const cartKey = ['cart'] as const;

export function useCart() {
  const { data: user } = useMe();
  return useQuery({ queryKey: cartKey, queryFn: () => api.get<CartSummary>('/cart'), enabled: !!user });
}

/** Every cart mutation returns the fresh cart, which replaces the cached one. */
function useCartMutation<V>(fn: (vars: V) => Promise<CartSummary>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: (cart) => qc.setQueryData(cartKey, cart) });
}

export const useAddToCart = () =>
  useCartMutation((v: { productId: number; quantity: number }) => api.post<CartSummary>('/cart/items', v));

export const useUpdateCartItem = () =>
  useCartMutation((v: { productId: number; quantity: number }) =>
    api.patch<CartSummary>(`/cart/items/${v.productId}`, { quantity: v.quantity }),
  );

export const useRemoveCartItem = () =>
  useCartMutation((productId: number) => api.delete<CartSummary>(`/cart/items/${productId}`));

export const useClearCart = () => useCartMutation(() => api.delete<CartSummary>('/cart'));

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CheckoutInput) => api.post<OrderDetails>('/orders/checkout', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cartKey });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
