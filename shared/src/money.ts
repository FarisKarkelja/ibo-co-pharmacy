import { TAX_RATE } from './constants';

// Money is calculated in whole cents to avoid floating point drift
// (0.1 + 0.2 !== 0.3), then converted back to KM for display.

export const toCents = (amount: number) => Math.round(amount * 100);
export const fromCents = (cents: number) => Math.round(cents) / 100;

export function calculateTotals(lines: { unitPrice: number; quantity: number }[]) {
  const subtotalCents = lines.reduce((sum, l) => sum + toCents(l.unitPrice) * l.quantity, 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  return {
    subtotal: fromCents(subtotalCents),
    tax: fromCents(taxCents),
    total: fromCents(subtotalCents + taxCents),
  };
}

/** "1.234,50 KM" - formatted by hand, because browsers ship different locale data for bs-BA. */
export function formatPrice(amount: number) {
  const [int, dec] = Math.abs(amount).toFixed(2).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${amount < 0 ? '-' : ''}${grouped},${dec} KM`;
}
