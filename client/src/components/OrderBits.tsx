import { ORDER_STATUS_LABELS, type OrderStatus } from '@ibo/shared';
import { MapPin, Phone, UserRound } from 'lucide-react';
import { useOrderDetails } from '@/api/orders';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { Badge, Skeleton } from './ui/card';
import { Dialog, DialogContent } from './ui/dialog';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variant = status === 'Active' ? 'warning' : status === 'Completed' ? 'success' : 'neutral';
  return <Badge variant={variant}>{ORDER_STATUS_LABELS[status]}</Badge>;
}

/** Order details used by both the customer profile and the admin panel. */
export function OrderDetailsDialog({
  orderId,
  scope,
  onClose,
}: {
  orderId: number | null;
  scope: 'mine' | 'admin';
  onClose: () => void;
}) {
  const { data: order, isLoading } = useOrderDetails(orderId, scope);
  return (
    <Dialog open={orderId !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={`Narudžba #${orderId ?? ''}`} description={order ? formatDateTime(order.createdAt) : undefined} className="max-w-2xl">
        {isLoading || !order ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-40" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3 rounded-xl bg-surface p-4 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-brand" /> Preuzimanje: <strong>{order.pickupLocation}</strong>
              </div>
              <div className="flex items-center gap-2 sm:justify-end">
                Status: <OrderStatusBadge status={order.status} />
              </div>
              {scope === 'admin' && (
                <>
                  <div className="flex items-center gap-2">
                    <UserRound className="size-4 text-brand" /> {order.customerName} ({order.customerEmail})
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <Phone className="size-4 text-brand" /> {order.customerPhone}
                  </div>
                </>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 font-medium">Proizvod</th>
                    <th className="py-2 text-center font-medium">Količina</th>
                    <th className="py-2 text-right font-medium">Cijena</th>
                    <th className="py-2 text-right font-medium">Ukupno</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((i) => (
                    <tr key={i.id} className="border-b border-line/60">
                      <td className="py-3 pr-4">{i.productName}</td>
                      <td className="py-3 text-center tabular-nums">{i.quantity}</td>
                      <td className="py-3 text-right tabular-nums">{formatPrice(i.unitPrice)}</td>
                      <td className="py-3 text-right font-medium tabular-nums">{formatPrice(i.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="ml-auto max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Cijena bez PDV-a</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">PDV (17%)</dt><dd className="tabular-nums">{formatPrice(order.tax)}</dd></div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Ukupno</dt><dd className="tabular-nums">{formatPrice(order.total)}</dd></div>
            </dl>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
