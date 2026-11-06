import { MAX_CART_QUANTITY } from '@ibo/shared';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuantityStepper({
  value,
  onChange,
  disabled,
  size = 'md',
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}) {
  const btn = cn(
    'grid place-items-center rounded-full text-ink transition hover:bg-surface disabled:opacity-40',
    size === 'sm' ? 'size-8' : 'size-10',
  );
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white p-0.5">
      <button type="button" className={btn} aria-label="Smanji količinu" disabled={disabled || value <= 1} onClick={() => onChange(value - 1)}>
        <Minus className="size-4" />
      </button>
      <span className={cn('min-w-8 text-center font-semibold tabular-nums', size === 'sm' ? 'text-sm' : 'text-base')} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={btn}
        aria-label="Povećaj količinu"
        disabled={disabled || value >= MAX_CART_QUANTITY}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
