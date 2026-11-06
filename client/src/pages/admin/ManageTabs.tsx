import {
  type ContactMessage,
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  type Order,
  type OrderStatus,
  type Review,
  REVIEW_LOCATION_LABELS,
  ROLE_LABELS,
} from '@ibo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Mail, MailOpen, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDeleteMessage, useMarkMessage, useMessages } from '@/api/admin';
import { useMe } from '@/api/auth';
import { useDeleteOrder, useOrders, useUpdateOrderStatus } from '@/api/orders';
import { useDeleteReview, useReviews } from '@/api/reviews';
import { type AdminUser, useChangeRole, useDeleteUser, useUsers } from '@/api/users';
import { DataTable } from '@/components/DataTable';
import { OrderDetailsDialog } from '@/components/OrderBits';
import { Button } from '@/components/ui/button';
import { Badge, Card, Skeleton } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/dialog';
import { NativeSelect } from '@/components/ui/input';
import { EmptyState, Stars } from '@/components/ui/misc';
import { errorMessage } from '@/lib/api';
import { cn, formatDate, formatDateTime, formatPrice } from '@/lib/utils';

const onError = (err: unknown) => toast.error(errorMessage(err));

const statusSelectClass: Record<OrderStatus, string> = {
  Active: 'bg-amber-50 text-amber-800 border-amber-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-surface text-muted',
};

// ---------------- Orders ----------------

export function OrdersTab() {
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const { data, isLoading } = useOrders(status || undefined);
  const updateStatus = useUpdateOrderStatus();
  const del = useDeleteOrder();
  const [viewId, setViewId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const columns: ColumnDef<Order>[] = [
    { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-medium">#{row.original.id}</span> },
    {
      accessorKey: 'customerName',
      header: 'Kupac',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.customerName}</p>
          <p className="text-xs text-muted">{row.original.customerEmail}</p>
        </div>
      ),
    },
    { accessorKey: 'pickupLocation', header: 'Preuzimanje' },
    { accessorKey: 'total', header: 'Ukupno', cell: ({ row }) => <span className="tabular-nums">{formatPrice(row.original.total)}</span> },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <NativeSelect
          value={row.original.status}
          aria-label={`Status narudžbe #${row.original.id}`}
          className={cn('h-8 w-32 rounded-full px-3 text-xs font-semibold', statusSelectClass[row.original.status])}
          onChange={(e) =>
            updateStatus.mutate(
              { id: row.original.id, status: e.target.value as OrderStatus },
              { onSuccess: () => toast.success(`Narudžba #${row.original.id}: ${ORDER_STATUS_LABELS[e.target.value as OrderStatus]}`), onError },
            )
          }
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </NativeSelect>
      ),
    },
    { accessorKey: 'createdAt', header: 'Kreirano', cell: ({ row }) => <span className="whitespace-nowrap text-muted">{formatDateTime(row.original.createdAt)}</span> },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Detalji" onClick={() => setViewId(row.original.id)}>
            <Eye />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Obriši" onClick={() => setDeleteId(row.original.id)}>
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
        data={data}
        loading={isLoading}
        searchPlaceholder="Pretraga narudžbi..."
        emptyTitle="Nema narudžbi"
        toolbar={
          <NativeSelect value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | '')} className="h-10 w-44" aria-label="Filter po statusu">
            <option value="">Svi statusi</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </NativeSelect>
        }
      />
      <OrderDetailsDialog orderId={viewId} scope="admin" onClose={() => setViewId(null)} />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Obriši narudžbu"
        description="Da li ste sigurni da želite obrisati ovu narudžbu? Ova akcija se ne može poništiti."
        loading={del.isPending}
        onConfirm={() => del.mutate(deleteId!, { onSuccess: () => { toast.success('Narudžba je obrisana.'); setDeleteId(null); }, onError })}
      />
    </>
  );
}

// ---------------- Users ----------------

export function UsersTab() {
  const { data: me } = useMe();
  const { data, isLoading } = useUsers();
  const changeRole = useChangeRole();
  const del = useDeleteUser();
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  const columns: ColumnDef<AdminUser>[] = [
    { accessorKey: 'id', header: 'ID' },
    {
      accessorKey: 'fullName',
      header: 'Ime i prezime',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          {row.original.fullName}
          {row.original.id === me?.id && <Badge variant="outline">Vi</Badge>}
        </div>
      ),
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Telefon' },
    { accessorKey: 'orderCount', header: 'Narudžbe', cell: ({ row }) => <span className="tabular-nums">{row.original.orderCount}</span> },
    {
      accessorKey: 'role',
      header: 'Uloga',
      cell: ({ row }) =>
        row.original.id === me?.id ? (
          <Badge variant="brand">
            <ShieldCheck /> {ROLE_LABELS[row.original.role]}
          </Badge>
        ) : (
          <NativeSelect
            value={row.original.role}
            className="h-8 w-36 rounded-full px-3 text-xs font-medium"
            aria-label={`Uloga za ${row.original.fullName}`}
            onChange={(e) =>
              changeRole.mutate(
                { id: row.original.id, role: e.target.value as AdminUser['role'] },
                { onSuccess: () => toast.success('Uloga je promijenjena.'), onError },
              )
            }
          >
            <option value="User">{ROLE_LABELS.User}</option>
            <option value="Admin">{ROLE_LABELS.Admin}</option>
          </NativeSelect>
        ),
    },
    { accessorKey: 'createdAt', header: 'Kreiran', cell: ({ row }) => <span className="text-muted">{formatDate(row.original.createdAt)}</span> },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.id !== me?.id && (
          <div className="flex justify-end">
            <Button variant="ghost" size="icon-sm" aria-label="Obriši korisnika" onClick={() => setDeleting(row.original)}>
              <Trash2 />
            </Button>
          </div>
        ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={data} loading={isLoading} searchPlaceholder="Pretraga korisnika..." emptyTitle="Nema korisnika" />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Obriši korisnika"
        description={`Da li ste sigurni da želite obrisati korisnika ${deleting?.fullName}? Obrisat će se i njegove narudžbe, korpa i recenzije.`}
        loading={del.isPending}
        onConfirm={() => del.mutate(deleting!.id, { onSuccess: () => { toast.success('Korisnik je obrisan.'); setDeleting(null); }, onError })}
      />
    </>
  );
}

// ---------------- Reviews moderation ----------------

export function ReviewsTab() {
  const { data, isLoading } = useReviews(100);
  const del = useDeleteReview();
  const [deleting, setDeleting] = useState<Review | null>(null);

  const columns: ColumnDef<Review>[] = [
    { accessorKey: 'authorName', header: 'Korisnik', cell: ({ row }) => <span className="font-medium">{row.original.authorName}</span> },
    { accessorKey: 'rating', header: 'Ocjena', cell: ({ row }) => <Stars value={row.original.rating} /> },
    { accessorKey: 'comment', header: 'Komentar', cell: ({ row }) => <p className="max-w-md text-ink/80">{row.original.comment}</p> },
    { accessorKey: 'location', header: 'Lokacija', cell: ({ row }) => REVIEW_LOCATION_LABELS[row.original.location] },
    { accessorKey: 'createdAt', header: 'Datum', cell: ({ row }) => <span className="text-muted">{formatDate(row.original.createdAt)}</span> },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon-sm" aria-label="Obriši recenziju" onClick={() => setDeleting(row.original)}>
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={data} loading={isLoading} searchPlaceholder="Pretraga recenzija..." emptyTitle="Nema recenzija" />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Obriši recenziju"
        description="Recenzija će biti trajno uklonjena sa stranice."
        loading={del.isPending}
        onConfirm={() => del.mutate(deleting!.id, { onSuccess: () => { toast.success('Recenzija je obrisana.'); setDeleting(null); }, onError })}
      />
    </>
  );
}

// ---------------- Contact messages ----------------

export function MessagesTab() {
  const { data, isLoading } = useMessages();
  const mark = useMarkMessage();
  const del = useDeleteMessage();
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);

  if (isLoading) return <Skeleton className="h-64" />;
  if (!data?.length) {
    return (
      <Card>
        <EmptyState icon={Mail} title="Nema poruka" description="Poruke poslane preko kontakt forme pojavit će se ovdje." />
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {data.map((m) => (
          <Card key={m.id} className={cn('p-5', !m.isRead && 'ring-2 ring-brand/20')}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  {m.fullName}
                  {!m.isRead && <Badge variant="brand">Novo</Badge>}
                </p>
                <a href={`mailto:${m.email}`} className="text-sm text-brand hover:underline">
                  {m.email}
                </a>
              </div>
              <div className="flex items-center gap-1">
                <span className="mr-2 text-xs text-muted">{formatDateTime(m.createdAt)}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={m.isRead ? 'Označi kao nepročitano' : 'Označi kao pročitano'}
                  onClick={() => mark.mutate({ id: m.id, isRead: !m.isRead }, { onError })}
                >
                  {m.isRead ? <Mail /> : <MailOpen />}
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="Obriši poruku" onClick={() => setDeleting(m)}>
                  <Trash2 />
                </Button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">{m.message}</p>
          </Card>
        ))}
      </div>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Obriši poruku"
        description="Poruka će biti trajno obrisana."
        loading={del.isPending}
        onConfirm={() => del.mutate(deleting!.id, { onSuccess: () => { toast.success('Poruka je obrisana.'); setDeleting(null); }, onError })}
      />
    </>
  );
}
