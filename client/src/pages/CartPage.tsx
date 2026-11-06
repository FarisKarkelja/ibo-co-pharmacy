import { PICKUP_LOCATIONS, type OrderDetails, type PickupLocation } from '@ibo/shared';
import { CircleCheck, FileText, MapPin, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useCart, useCheckout, useClearCart, useRemoveCartItem, useUpdateCartItem } from '@/api/cart';
import { PageHeader } from '@/components/PageHeader';
import { ProductImage } from '@/components/ProductImage';
import { QuantityStepper } from '@/components/QuantityStepper';
import { Button } from '@/components/ui/button';
import { Card, Skeleton } from '@/components/ui/card';
import { ConfirmDialog, Dialog, DialogContent } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/misc';
import { errorMessage } from '@/lib/api';
import { cn, formatPrice, plural } from '@/lib/utils';

const LOCATION_HOURS: Record<PickupLocation, string> = {
  'Teheranski Trg 7': 'Pon - Pet 08:00 - 20:30, Sub 08:00 - 15:30, Ned 09:00 - 13:00',
  'Patriotske Lige 35': 'Pon - Pet 08:00 - 19:00, Sub 08:00 - 15:30, Ned zatvoreno',
};

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const clear = useClearCart();
  const checkout = useCheckout();
  const [location, setLocation] = useState<PickupLocation | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [placed, setPlaced] = useState<OrderDetails | null>(null);

  const onError = (err: unknown) => toast.error(errorMessage(err));
  const hasRx = cart?.items.some((i) => i.isPrescriptionRequired);

  const placeOrder = () => {
    if (!location) {
      toast.error('Odaberite lokaciju preuzimanja.');
      return;
    }
    checkout.mutate({ pickupLocation: location }, { onSuccess: setPlaced, onError });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Vaša korpa"
        crumbs={[{ label: 'Korpa' }]}
        description={cart && cart.itemCount > 0 ? plural(cart.itemCount, 'artikal', 'artikla', 'artikala') : undefined}
        actions={
          cart && cart.items.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)}>
              <Trash2 /> Isprazni korpu
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShoppingCart}
            title="Vaša korpa je prazna"
            description="Pregledajte naš katalog i dodajte proizvode koje želite preuzeti u apoteci."
            action={
              <Button asChild>
                <Link to="/shop">Nastavi kupovinu</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="divide-y divide-line">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex gap-4 p-4 sm:p-5">
                <Link to={`/products/${item.productId}`} className="shrink-0 rounded-xl border border-line bg-white p-2">
                  <ProductImage src={item.imageUrl} alt={item.name} className="size-20 sm:size-24" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <Link to={`/products/${item.productId}`} className="line-clamp-2 font-medium hover:text-brand">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted tabular-nums">{formatPrice(item.unitPrice)} / kom</p>
                    {item.isPrescriptionRequired && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand">
                        <FileText className="size-3.5" /> Potreban recept pri preuzimanju
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <QuantityStepper
                      size="sm"
                      value={item.quantity}
                      disabled={update.isPending}
                      onChange={(quantity) => update.mutate({ productId: item.productId, quantity }, { onError })}
                    />
                    <p className="w-24 text-right font-semibold tabular-nums">{formatPrice(item.lineTotal)}</p>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Ukloni ${item.name}`}
                      onClick={() => remove.mutate(item.productId, { onError })}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div className="p-4 sm:p-5">
              <Button variant="link" asChild>
                <Link to="/shop">← Nastavi kupovinu</Link>
              </Button>
            </div>
          </Card>

          <Card className="space-y-6 p-6 lg:sticky lg:top-6">
            <h2 className="text-lg font-semibold">Pregled narudžbe</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Cijena bez PDV-a</dt>
                <dd className="tabular-nums">{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">PDV (17%)</dt>
                <dd className="tabular-nums">{formatPrice(cart.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
                <dt>Ukupno</dt>
                <dd className="tabular-nums">{formatPrice(cart.total)}</dd>
              </div>
            </dl>

            <fieldset>
              <legend className="mb-3 text-sm font-medium">Odaberite lokaciju preuzimanja</legend>
              <div className="space-y-2">
                {PICKUP_LOCATIONS.map((l) => (
                  <label
                    key={l}
                    className={cn(
                      'flex cursor-pointer gap-3 rounded-xl border p-3 transition',
                      location === l ? 'border-brand bg-brand-50' : 'border-line hover:border-ink/30',
                    )}
                  >
                    <input type="radio" name="location" value={l} checked={location === l} onChange={() => setLocation(l)} className="mt-1 accent-brand" />
                    <span>
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <MapPin className="size-4 text-brand" /> {l}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">{LOCATION_HOURS[l]}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {hasRx && (
              <p className="flex gap-2 rounded-xl bg-surface p-3 text-xs text-ink/75">
                <FileText className="size-4 shrink-0 text-brand" />
                Korpa sadrži lijekove na recept. Ponesite važeći recept pri preuzimanju.
              </p>
            )}

            <Button className="w-full" size="lg" onClick={placeOrder} loading={checkout.isPending} disabled={!location}>
              Završite narudžbu
            </Button>
            <p className="text-center text-xs text-muted">Plaćanje se vrši pri preuzimanju u apoteci.</p>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Isprazniti korpu?"
        description="Svi proizvodi će biti uklonjeni iz korpe."
        confirmLabel="Isprazni"
        loading={clear.isPending}
        onConfirm={() => clear.mutate(undefined, { onSuccess: () => setConfirmClear(false), onError })}
      />

      <Dialog open={!!placed} onOpenChange={(o) => !o && setPlaced(null)}>
        <DialogContent title="Narudžba je zaprimljena" hideClose>
          {placed && (
            <div className="text-center">
              <CircleCheck className="mx-auto size-16 text-emerald-600" strokeWidth={1.5} />
              <p className="mt-4 text-sm text-ink/75">
                Narudžba <strong>#{placed.id}</strong> u iznosu od <strong>{formatPrice(placed.total)}</strong> će biti spremna
                za preuzimanje u apoteci <strong>{placed.pickupLocation}</strong>.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button variant="secondary" asChild>
                  <Link to="/shop">Nastavi kupovinu</Link>
                </Button>
                <Button asChild>
                  <Link to="/profile?tab=orders">Moje narudžbe</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
