import type { Product } from '@ibo/shared';
import { FileText } from 'lucide-react';
import { Link } from 'react-router';
import { formatPrice } from '@/lib/utils';
import { AddToCartButton } from './AddToCartButton';
import { ProductImage } from './ProductImage';
import { Badge, Card, Skeleton } from './ui/card';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0_0_0/0.1)]">
      <Link to={`/products/${product.id}`} className="relative block bg-white p-4" aria-label={product.name}>
        <ProductImage src={product.imageUrl} alt={product.name} className="aspect-square w-full transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.isFeatured && <Badge variant="brand">Preporučeno</Badge>}
          {product.isPrescriptionRequired && (
            <Badge variant="dark">
              <FileText /> Na recept
            </Badge>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col border-t border-line p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{product.categoryName}</p>
        <Link to={`/products/${product.id}`} className="mt-1 line-clamp-2 font-semibold leading-snug transition hover:text-brand">
          {product.name}
        </Link>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-lg font-semibold tabular-nums">{formatPrice(product.price)}</span>
          <AddToCartButton productId={product.id} productName={product.name} size="icon" label="" aria-label={`Dodaj ${product.name} u korpu`} />
        </div>
      </div>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="m-4 aspect-square rounded-xl" />
      <div className="space-y-2 border-t border-line p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <div className="flex justify-between pt-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="size-10 rounded-full" />
        </div>
      </div>
    </Card>
  );
}
