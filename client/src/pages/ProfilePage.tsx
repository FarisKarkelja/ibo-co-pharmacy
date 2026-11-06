import { zodResolver } from '@hookform/resolvers/zod';
import {
  changePasswordSchema,
  type ChangePasswordInput,
  ROLE_LABELS,
  updateProfileSchema,
  type UpdateProfileInput,
} from '@ibo/shared';
import { Eye, KeyRound, Package, Settings, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { useMe } from '@/api/auth';
import { useCancelOrder, useMyOrders } from '@/api/orders';
import { useChangePassword, useDeleteAccount, useUpdateProfile } from '@/api/users';
import { OrderDetailsDialog, OrderStatusBadge } from '@/components/OrderBits';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, Skeleton } from '@/components/ui/card';
import { ConfirmDialog, Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/input';
import { EmptyState, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/misc';
import { errorMessage } from '@/lib/api';
import { handleFormError } from '@/lib/form';
import { formatDate, formatDateTime, formatPrice, initials, plural } from '@/lib/utils';

function PersonalInfo() {
  const { data: user } = useMe();
  const update = useUpdateProfile();
  const { register, handleSubmit, formState, setError } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: { fullName: user?.fullName ?? '', phone: user?.phone ?? '' },
  });

  const onSubmit = handleSubmit((values) =>
    update.mutate(values, {
      onSuccess: () => toast.success('Podaci su sačuvani.'),
      onError: (err) => handleFormError(err, setError),
    }),
  );

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="text-lg font-semibold">Lični podaci</h2>
      <form onSubmit={onSubmit} className="mt-6 grid gap-5 sm:grid-cols-2" noValidate>
        <Field label="Ime i prezime" error={formState.errors.fullName?.message}>
          <Input autoComplete="name" {...register('fullName')} />
        </Field>
        <Field label="Telefon" error={formState.errors.phone?.message}>
          <Input type="tel" inputMode="numeric" autoComplete="tel" {...register('phone')} />
        </Field>
        <Field label="Email" hint="Email adresa se ne može mijenjati.">
          <Input value={user?.email ?? ''} disabled readOnly />
        </Field>
        <Field label="Član od">
          <Input value={user ? formatDate(user.createdAt) : ''} disabled readOnly />
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" loading={update.isPending} disabled={!formState.isDirty}>
            Sačuvaj promjene
          </Button>
        </div>
      </form>
    </Card>
  );
}

function MyOrders() {
  const { data: orders, isLoading } = useMyOrders();
  const cancel = useCancelOrder();
  const [viewId, setViewId] = useState<number | null>(null);
  const [cancelId, setCancelId] = useState<number | null>(null);

  if (isLoading) return <Skeleton className="h-64" />;
  if (!orders?.length) {
    return (
      <Card>
        <EmptyState
          icon={Package}
          title="Još nemate narudžbi"
          description="Kada naručite proizvode, ovdje ćete pratiti njihov status."
          action={
            <Button asChild>
              <Link to="/shop">Posjetite shop</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {orders.map((o) => (
          <Card key={o.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-semibold">Narudžba #{o.id}</p>
                <OrderStatusBadge status={o.status} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {formatDateTime(o.createdAt)} · {o.pickupLocation} · {plural(o.itemCount, 'artikal', 'artikla', 'artikala')}
              </p>
            </div>
            <p className="text-lg font-semibold tabular-nums">{formatPrice(o.total)}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setViewId(o.id)}>
                <Eye /> Detalji
              </Button>
              {o.status === 'Active' && (
                <Button variant="ghost" size="sm" onClick={() => setCancelId(o.id)}>
                  Otkaži
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
      <OrderDetailsDialog orderId={viewId} scope="mine" onClose={() => setViewId(null)} />
      <ConfirmDialog
        open={cancelId !== null}
        onOpenChange={(o) => !o && setCancelId(null)}
        title={`Otkazati narudžbu #${cancelId}?`}
        description="Apoteka neće pripremati proizvode iz ove narudžbe."
        confirmLabel="Otkaži narudžbu"
        loading={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(cancelId!, {
            onSuccess: () => {
              toast.success('Narudžba je otkazana.');
              setCancelId(null);
            },
            onError: (err) => toast.error(errorMessage(err)),
          })
        }
      />
    </>
  );
}

function SettingsTab() {
  const change = useChangePassword();
  const del = useDeleteAccount();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const { register, handleSubmit, formState, setError, reset } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const onSubmit = handleSubmit((values) =>
    change.mutate(values, {
      onSuccess: (res) => {
        toast.success(res.message);
        reset();
      },
      onError: (err) => handleFormError(err, setError),
    }),
  );

  const deleteAccount = () =>
    del.mutate(confirmPassword, {
      onSuccess: () => {
        toast.success('Vaš nalog je obrisan.');
        navigate('/');
      },
      onError: (err) => setDeleteError(errorMessage(err)),
    });

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <KeyRound className="size-5 text-brand" /> Promjena lozinke
        </h2>
        <form onSubmit={onSubmit} className="mt-6 grid max-w-xl gap-5" noValidate>
          <Field label="Trenutna lozinka" error={formState.errors.currentPassword?.message}>
            <Input type="password" autoComplete="current-password" {...register('currentPassword')} />
          </Field>
          <Field label="Nova lozinka" error={formState.errors.newPassword?.message} hint="Najmanje 8 znakova, veliko i malo slovo, broj i specijalni znak.">
            <Input type="password" autoComplete="new-password" {...register('newPassword')} />
          </Field>
          <div>
            <Button type="submit" loading={change.isPending}>
              Promijeni lozinku
            </Button>
          </div>
        </form>
      </Card>

      <Card className="border border-brand/20 p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Trash2 className="size-5 text-brand" /> Brisanje računa
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Brisanjem računa trajno se uklanjaju vaši lični podaci, korpa, narudžbe i recenzije. Ova akcija se ne može poništiti.
        </p>
        <Button variant="outline" className="mt-5" onClick={() => setDeleteOpen(true)}>
          Obriši moj račun
        </Button>
      </Card>

      <Dialog
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          setConfirmPassword('');
          setDeleteError('');
        }}
      >
        <DialogContent title="Obrisati račun?" description="Unesite lozinku kako biste potvrdili brisanje.">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              deleteAccount();
            }}
            className="space-y-5"
          >
            <Field label="Lozinka" error={deleteError}>
              <Input type="password" autoComplete="current-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </Field>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)}>
                Odustani
              </Button>
              <Button type="submit" loading={del.isPending} disabled={!confirmPassword}>
                Trajno obriši
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const TABS = ['info', 'orders', 'settings'] as const;

export default function ProfilePage() {
  const { data: user } = useMe();
  const [params, setParams] = useSearchParams();
  const tab = (TABS as readonly string[]).includes(params.get('tab') ?? '') ? params.get('tab')! : 'info';

  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Moj profil" crumbs={[{ label: 'Profil' }]} />
      <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="p-6 text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-brand text-2xl font-semibold text-white shadow-brand">
            {initials(user.fullName)}
          </span>
          <p className="mt-4 font-semibold">{user.fullName}</p>
          <p className="truncate text-sm text-muted">{user.email}</p>
          <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs font-medium">
            {user.role === 'Admin' && <ShieldCheck className="size-3.5 text-brand" />}
            {ROLE_LABELS[user.role]}
          </p>
          {user.role === 'Admin' && (
            <Button asChild variant="outline" size="sm" className="mt-5 w-full">
              <Link to="/admin">Admin panel</Link>
            </Button>
          )}
        </Card>

        <Tabs value={tab} onValueChange={(v) => setParams(v === 'info' ? {} : { tab: v }, { replace: true })}>
          <TabsList className="mb-6 w-fit max-w-full">
            <TabsTrigger value="info">
              <UserRound /> Lični podaci
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package /> Moje narudžbe
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings /> Postavke
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <PersonalInfo />
          </TabsContent>
          <TabsContent value="orders">
            <MyOrders />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
