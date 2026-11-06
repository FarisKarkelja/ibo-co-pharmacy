import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Category, Paginated, Product, ProductQuery } from '@ibo/shared';
import { api, qs } from '@/lib/api';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: () => api.get<Category[]>('/categories'), staleTime: 5 * 60_000 });
}

export function useProducts(params: ProductQuery) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => api.get<Paginated<Product>>(`/products${qs(params as Record<string, string | number | boolean | undefined>)}`),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get<Product>(`/products/${id}`),
    enabled: Number.isInteger(id) && id > 0,
  });
}

// ---------- Admin mutations (multipart, so images can be uploaded) ----------

function useCatalogInvalidation() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['products'] });
    qc.invalidateQueries({ queryKey: ['product'] });
    qc.invalidateQueries({ queryKey: ['categories'] });
    qc.invalidateQueries({ queryKey: ['stats'] });
  };
}

export function useSaveProduct() {
  const invalidate = useCatalogInvalidation();
  return useMutation({
    mutationFn: ({ id, form }: { id?: number; form: FormData }) =>
      id ? api.patch<Product>(`/products/${id}`, form) : api.post<Product>('/products', form),
    onSuccess: invalidate,
  });
}

export function useDeleteProduct() {
  const invalidate = useCatalogInvalidation();
  return useMutation({ mutationFn: (id: number) => api.delete(`/products/${id}`), onSuccess: invalidate });
}

export function useSaveCategory() {
  const invalidate = useCatalogInvalidation();
  return useMutation({
    mutationFn: ({ id, form }: { id?: number; form: FormData }) =>
      id ? api.patch<Category>(`/categories/${id}`, form) : api.post<Category>('/categories', form),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useCatalogInvalidation();
  return useMutation({ mutationFn: (id: number) => api.delete(`/categories/${id}`), onSuccess: invalidate });
}
