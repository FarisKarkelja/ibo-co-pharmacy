import { PRODUCT_SORTS, type ProductSort } from '@ibo/shared';
import { ArrowRight, FileText, PackageSearch, Search, ShieldCheck, Store, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { useCategories, useProduct, useProducts } from '@/api/catalog';
import { AddToCartButton } from '@/components/AddToCartButton';
import { PageHeader } from '@/components/PageHeader';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { ProductImage } from '@/components/ProductImage';
import { QuantityStepper } from '@/components/QuantityStepper';
import { Button } from '@/components/ui/button';
import { Badge, Card, SectionHeading, Skeleton } from '@/components/ui/card';
import { Input, NativeSelect } from '@/components/ui/input';
import { EmptyState, Switch } from '@/components/ui/misc';
import { useDebounce } from '@/hooks/use-debounce';
import { cn, formatPrice, plural } from '@/lib/utils';

// ---------------- Shop: categories ----------------

export function ShopPage() {
  const { data: categories, isLoading } = useCategories();
  const [search, setSearch] = useState('');

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Shop"
        description="Odaberite kategoriju ili pretražite cijeli katalog. Narudžbe preuzimate u jednoj od naših apoteka."
        crumbs={[{ label: 'Shop' }]}
      />
      <form action="/products" className="relative mb-8 max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pretražite proizvode, npr. vitamin C"
          className="h-12 rounded-full pl-11 pr-28"
          aria-label="Pretraga proizvoda"
        />
        <Button type="submit" size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2">
          Traži
        </Button>
      </form>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />)
          : categories?.map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.id}`}
                className="group relative isolate aspect-[4/3] overflow-hidden rounded-2xl bg-ink shadow-card"
              >
                {c.imageUrl && (
                  <img src={c.imageUrl} alt="" loading="lazy" className="absolute inset-0 -z-10 size-full object-cover transition duration-700 group-hover:scale-110" />
                )}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition group-hover:from-brand/90" />
                <div className="flex h-full flex-col justify-end p-6 text-white">
                  <h2 className="text-xl font-semibold">{c.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-white/80">{c.description}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
                    {plural(c.productCount, 'proizvod', 'proizvoda', 'proizvoda')}
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>
            ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Button variant="outline" asChild>
          <Link to="/products">
            Pogledajte sve proizvode <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ---------------- Product list with filters ----------------

const SORT_LABELS: Record<ProductSort, string> = {
  newest: 'Najnovije',
  'name-asc': 'Naziv A-Ž',
  'name-desc': 'Naziv Ž-A',
  'price-asc': 'Cijena: niža prema višoj',
  'price-desc': 'Cijena: viša prema nižoj',
};

export function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const categoryId = Number(params.get('category')) || undefined;
  const sort = (PRODUCT_SORTS as readonly string[]).includes(params.get('sort') ?? '') ? (params.get('sort') as ProductSort) : 'newest';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const prescription = params.get('rx') === '0' ? false : undefined;

  const [searchInput, setSearchInput] = useState(params.get('search') ?? '');
  const search = useDebounce(searchInput.trim(), 350);

  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!('page' in changes)) next.delete('page');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if (search !== (params.get('search') ?? '')) update({ search: search || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const { data: categories } = useCategories();
  const { data, isLoading, isFetching } = useProducts({ categoryId, search: search || undefined, sort, page, pageSize: 12, prescription });
  const category = categories?.find((c) => c.id === categoryId);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={category?.name ?? 'Svi proizvodi'}
        description={category?.description ?? 'Kompletan katalog apoteke IBO & CO.'}
        crumbs={[{ label: 'Shop', to: '/shop' }, { label: category?.name ?? 'Svi proizvodi' }]}
      />

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Kategorije">
        <button
          type="button"
          onClick={() => update({ category: undefined })}
          className={cn('rounded-full px-4 py-2 text-sm font-medium transition', !categoryId ? 'bg-brand text-white' : 'bg-white text-ink shadow-card hover:text-brand')}
        >
          Sve
        </button>
        {categories?.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => update({ category: String(c.id) })}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition',
              categoryId === c.id ? 'bg-brand text-white' : 'bg-white text-ink shadow-card hover:text-brand',
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <Card className="mb-6 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Pretraga po nazivu..."
            className="border-transparent bg-surface pl-11"
            aria-label="Pretraga po nazivu"
          />
          {searchInput && (
            <button type="button" onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-ink" aria-label="Obriši pretragu">
              <X className="size-4" />
            </button>
          )}
        </div>
        <label className="flex items-center gap-3 px-2 text-sm">
          <Switch checked={prescription === false} onCheckedChange={(v) => update({ rx: v ? '0' : undefined })} />
          Samo bez recepta
        </label>
        <NativeSelect value={sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? undefined : e.target.value })} className="border-transparent bg-surface md:w-64" aria-label="Sortiranje">
          {PRODUCT_SORTS.map((s) => (
            <option key={s} value={s}>
              {SORT_LABELS[s]}
            </option>
          ))}
        </NativeSelect>
      </Card>

      <p className="mb-4 text-sm text-muted" aria-live="polite">
        {data ? plural(data.total, 'proizvod', 'proizvoda', 'proizvoda') : ' '}
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className={cn('grid grid-cols-2 gap-4 transition-opacity sm:gap-5 lg:grid-cols-3 xl:grid-cols-4', isFetching && 'opacity-60')}>
          {data.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={PackageSearch}
            title="Nema proizvoda"
            description="Nismo pronašli proizvode za odabrane filtere. Pokušajte s drugim pojmom ili kategorijom."
            action={
              <Button variant="outline" onClick={() => { setSearchInput(''); setParams({}, { replace: true }); }}>
                Poništi filtere
              </Button>
            }
          />
        </Card>
      )}

      {data && data.totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Stranice">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              aria-current={p === page ? 'page' : undefined}
              onClick={() => {
                update({ page: p === 1 ? undefined : String(p) });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={cn('size-10 rounded-full text-sm font-medium transition', p === page ? 'bg-brand text-white' : 'bg-white shadow-card hover:text-brand')}
            >
              {p}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

// ---------------- Product details ----------------

export function ProductDetailsPage() {
  const id = Number(useParams().id);
  const { data: product, isLoading, error } = useProduct(id);
  const [quantity, setQuantity] = useState(1);
  const { data: related } = useProducts({ categoryId: product?.categoryId, pageSize: 5 });

  if (isLoading) {
    return (
      <div className="grid gap-10 pt-12 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-24" />
          <Skeleton className="h-12 w-48" />
        </div>
      </div>
    );
  }
  if (error || !product) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="Proizvod nije pronađen"
        description="Proizvod je možda uklonjen iz kataloga."
        action={
          <Button asChild>
            <Link to="/shop">Nazad u shop</Link>
          </Button>
        }
      />
    );
  }

  const others = related?.items.filter((p) => p.id !== product.id).slice(0, 4) ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={product.name}
        crumbs={[
          { label: 'Shop', to: '/shop' },
          { label: product.categoryName, to: `/products?category=${product.categoryId}` },
          { label: product.name },
        ]}
      />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Card className="relative p-8">
          <ProductImage src={product.imageUrl} alt={product.name} className="mx-auto aspect-square w-full max-w-md" />
          <div className="absolute left-5 top-5 flex flex-col gap-2">
            {product.isFeatured && <Badge variant="brand">Preporučeno</Badge>}
          </div>
        </Card>
        <div className="flex flex-col">
          <Link to={`/products?category=${product.categoryId}`} className="text-xs font-semibold uppercase tracking-wider text-brand hover:underline">
            {product.categoryName}
          </Link>
          <p className="mt-4 text-3xl font-semibold tabular-nums">{formatPrice(product.price)}</p>
          <p className="mt-1 text-xs text-muted">Cijena bez PDV-a (17%). Plaćanje pri preuzimanju u apoteci.</p>
          <p className="mt-6 text-sm leading-7 text-ink/75">{product.description}</p>

          {product.isPrescriptionRequired && (
            <div className="mt-6 flex gap-3 rounded-2xl border border-ink/10 bg-white p-4 text-sm">
              <FileText className="mt-0.5 size-5 shrink-0 text-brand" />
              <div>
                <p className="font-semibold">Lijek se izdaje na recept</p>
                <p className="mt-0.5 text-muted">Možete ga rezervisati online, a pri preuzimanju je potrebno donijeti važeći recept.</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <AddToCartButton productId={product.id} productName={product.name} quantity={quantity} size="lg" />
          </div>

          <ul className="mt-8 grid gap-3 border-t border-line pt-6 text-sm text-ink/75 sm:grid-cols-2">
            <li className="flex items-center gap-2"><Store className="size-4 text-brand" /> Preuzimanje u 2 apoteke u Sarajevu</li>
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-brand" /> Certificirani i provjereni proizvodi</li>
          </ul>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-20">
          <SectionHeading title="Iz iste kategorije" align="left" />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {others.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
