import { zodResolver } from '@hookform/resolvers/zod';
import { type Category, categorySchema, type Product, productSchema } from '@ibo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { FileText, ImagePlus, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { useCategories, useDeleteCategory, useDeleteProduct, useProducts, useSaveCategory, useSaveProduct } from '@/api/catalog';
import { DataTable } from '@/components/DataTable';
import { ProductImage } from '@/components/ProductImage';
import { Button } from '@/components/ui/button';
import { Badge, Card, Skeleton } from '@/components/ui/card';
import { ConfirmDialog, Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input, NativeSelect, Textarea } from '@/components/ui/input';
import { Switch } from '@/components/ui/misc';
import { errorMessage } from '@/lib/api';
import { handleFormError } from '@/lib/form';
import { formatPrice, plural } from '@/lib/utils';

const onError = (err: unknown) => toast.error(errorMessage(err));

/** Image picker with preview; the file is sent as multipart form data. */
function ImagePicker({ current, file, onChange }: { current: string | null; file: File | null; onChange: (f: File | null) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="flex items-center gap-4">
      <div className="size-24 shrink-0 overflow-hidden rounded-xl border border-line bg-white p-1">
        <ProductImage src={preview ?? current} alt="Pregled slike" className="size-full" />
      </div>
      <div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium transition hover:border-brand hover:text-brand">
          <ImagePlus className="size-4" /> {current || file ? 'Promijeni sliku' : 'Dodaj sliku'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > 3 * 1024 * 1024) {
                toast.error('Slika može imati najviše 3 MB.');
                return;
              }
              onChange(f);
            }}
          />
        </label>
        <p className="mt-1.5 text-xs text-muted">JPG, PNG ili WEBP, najviše 3 MB.</p>
      </div>
    </div>
  );
}

function toFormData(values: Record<string, unknown>, image: File | null) {
  const form = new FormData();
  for (const [k, v] of Object.entries(values)) {
    if (v !== undefined && v !== null) form.append(k, String(v));
  }
  if (image) form.append('image', image);
  return form;
}

// ---------------- Products ----------------

type ProductForm = z.input<typeof productSchema>;

function ProductDialog({ open, onOpenChange, product }: { open: boolean; onOpenChange: (o: boolean) => void; product?: Product }) {
  const { data: categories } = useCategories();
  const save = useSaveProduct();
  const [image, setImage] = useState<File | null>(null);
  const { register, handleSubmit, control, formState, setError, reset } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    values: product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId,
          isPrescriptionRequired: product.isPrescriptionRequired,
          isFeatured: product.isFeatured,
        }
      : { name: '', description: '', price: '' as unknown as number, categoryId: '' as unknown as number, isPrescriptionRequired: false, isFeatured: false },
  });

  useEffect(() => {
    if (!open) {
      setImage(null);
      reset();
    }
  }, [open, reset]);

  const onSubmit = handleSubmit((values) =>
    save.mutate(
      { id: product?.id, form: toFormData(values, image) },
      {
        onSuccess: () => {
          toast.success(product ? 'Proizvod je ažuriran.' : 'Proizvod je dodan.');
          onOpenChange(false);
        },
        onError: (err) => handleFormError(err, setError),
      },
    ),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={product ? 'Uredi proizvod' : 'Novi proizvod'} className="max-w-2xl">
        <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <ImagePicker current={product?.imageUrl ?? null} file={image} onChange={setImage} />
          </div>
          <Field label="Naziv" error={formState.errors.name?.message} className="sm:col-span-2">
            <Input {...register('name')} />
          </Field>
          <Field label="Opis" error={formState.errors.description?.message} className="sm:col-span-2">
            <Textarea {...register('description')} rows={3} maxLength={500} />
          </Field>
          <Field label="Cijena (KM, bez PDV-a)" error={formState.errors.price?.message}>
            <Input type="number" step="0.01" min="0" inputMode="decimal" {...register('price')} />
          </Field>
          <Field label="Kategorija" error={formState.errors.categoryId?.message}>
            <NativeSelect {...register('categoryId')}>
              <option value="">Odaberite...</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-line p-4 text-sm">
            <span>
              <span className="font-medium">Na recept</span>
              <span className="block text-xs text-muted">Kupac donosi recept pri preuzimanju</span>
            </span>
            <Controller control={control} name="isPrescriptionRequired" render={({ field }) => <Switch checked={!!field.value} onCheckedChange={field.onChange} />} />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-line p-4 text-sm">
            <span>
              <span className="font-medium">Istaknut proizvod</span>
              <span className="block text-xs text-muted">Prikazuje se na početnoj stranici</span>
            </span>
            <Controller control={control} name="isFeatured" render={({ field }) => <Switch checked={!!field.value} onCheckedChange={field.onChange} />} />
          </label>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Odustani
            </Button>
            <Button type="submit" loading={save.isPending}>
              {product ? 'Sačuvaj promjene' : 'Dodaj proizvod'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProductsTab() {
  const { data, isLoading } = useProducts({ pageSize: 100, sort: 'name-asc' });
  const del = useDeleteProduct();
  const [editing, setEditing] = useState<Product | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Proizvod',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="size-11 shrink-0 rounded-lg border border-line bg-white p-0.5">
            <ProductImage src={row.original.imageUrl} alt="" className="size-full" />
          </div>
          <div className="min-w-0">
            <p className="max-w-xs truncate font-medium">{row.original.name}</p>
            <div className="mt-0.5 flex gap-1">
              {row.original.isFeatured && (
                <Badge variant="brand">
                  <Star /> Istaknut
                </Badge>
              )}
              {row.original.isPrescriptionRequired && (
                <Badge variant="dark">
                  <FileText /> Recept
                </Badge>
              )}
            </div>
          </div>
        </div>
      ),
    },
    { accessorKey: 'categoryName', header: 'Kategorija' },
    { accessorKey: 'price', header: 'Cijena', cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{formatPrice(row.original.price)}</span> },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Uredi" onClick={() => { setEditing(row.original); setFormOpen(true); }}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Obriši" onClick={() => setDeleting(row.original)}>
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.items}
        loading={isLoading}
        searchPlaceholder="Pretraga proizvoda..."
        emptyTitle="Nema proizvoda"
        toolbar={
          <Button size="sm" onClick={() => { setEditing(undefined); setFormOpen(true); }}>
            <Plus /> Novi proizvod
          </Button>
        }
      />
      <ProductDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Obriši proizvod"
        description={`Da li ste sigurni da želite obrisati "${deleting?.name}"? Postojeće narudžbe zadržavaju naziv i cijenu proizvoda.`}
        loading={del.isPending}
        onConfirm={() => del.mutate(deleting!.id, { onSuccess: () => { toast.success('Proizvod je obrisan.'); setDeleting(null); }, onError })}
      />
    </>
  );
}

// ---------------- Categories ----------------

type CategoryForm = z.input<typeof categorySchema>;

function CategoryDialog({ open, onOpenChange, category }: { open: boolean; onOpenChange: (o: boolean) => void; category?: Category }) {
  const save = useSaveCategory();
  const [image, setImage] = useState<File | null>(null);
  const { register, handleSubmit, formState, setError, reset } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    values: { name: category?.name ?? '', description: category?.description ?? '' },
  });

  useEffect(() => {
    if (!open) {
      setImage(null);
      reset();
    }
  }, [open, reset]);

  const onSubmit = handleSubmit((values) =>
    save.mutate(
      { id: category?.id, form: toFormData(values, image) },
      {
        onSuccess: () => {
          toast.success(category ? 'Kategorija je ažurirana.' : 'Kategorija je dodana.');
          onOpenChange(false);
        },
        onError: (err) => handleFormError(err, setError),
      },
    ),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={category ? 'Uredi kategoriju' : 'Nova kategorija'}>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <ImagePicker current={category?.imageUrl ?? null} file={image} onChange={setImage} />
          <Field label="Naziv kategorije" error={formState.errors.name?.message}>
            <Input {...register('name')} />
          </Field>
          <Field label="Opis" error={formState.errors.description?.message}>
            <Textarea {...register('description')} rows={3} maxLength={500} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Odustani
            </Button>
            <Button type="submit" loading={save.isPending}>
              {category ? 'Sačuvaj promjene' : 'Dodaj kategoriju'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CategoriesTab() {
  const { data, isLoading } = useCategories();
  const del = useDeleteCategory();
  const [editing, setEditing] = useState<Category | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => { setEditing(undefined); setFormOpen(true); }}>
          <Plus /> Nova kategorija
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-56" />)
          : data?.map((c) => (
              <Card key={c.id} className="overflow-hidden">
                <div className="relative aspect-[16/9] bg-surface">
                  {c.imageUrl ? <img src={c.imageUrl} alt="" className="size-full object-cover" loading="lazy" /> : <ProductImage src={null} alt="" className="size-full" />}
                  <Badge variant="dark" className="absolute left-3 top-3">
                    {plural(c.productCount, 'proizvod', 'proizvoda', 'proizvoda')}
                  </Badge>
                </div>
                <div className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{c.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted">{c.description}</p>
                  </div>
                  <Button variant="ghost" size="icon-sm" aria-label={`Uredi ${c.name}`} onClick={() => { setEditing(c); setFormOpen(true); }}>
                    <Pencil />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label={`Obriši ${c.name}`} onClick={() => setDeleting(c)}>
                    <Trash2 />
                  </Button>
                </div>
              </Card>
            ))}
      </div>
      <CategoryDialog open={formOpen} onOpenChange={setFormOpen} category={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Obriši kategoriju"
        description={
          deleting?.productCount
            ? `Kategorija "${deleting.name}" sadrži ${plural(deleting.productCount, 'proizvod', 'proizvoda', 'proizvoda')}. Premjestite ili obrišite proizvode prije brisanja kategorije.`
            : `Da li ste sigurni da želite obrisati kategoriju "${deleting?.name}"?`
        }
        loading={del.isPending}
        onConfirm={() => del.mutate(deleting!.id, { onSuccess: () => { toast.success('Kategorija je obrisana.'); setDeleting(null); }, onError })}
      />
    </>
  );
}
