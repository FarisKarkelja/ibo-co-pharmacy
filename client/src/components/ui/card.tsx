import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl bg-white shadow-card', className)} {...props} />;
}

export function Badge({
  className,
  variant = 'neutral',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'brand' | 'neutral' | 'success' | 'warning' | 'dark' | 'outline' }) {
  const styles = {
    brand: 'bg-brand text-white',
    neutral: 'bg-surface text-ink',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15',
    warning: 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20',
    dark: 'bg-ink text-white',
    outline: 'bg-white text-brand ring-1 ring-brand/30',
  }[variant];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide [&_svg]:size-3',
        styles,
        className,
      )}
      {...props}
    />
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-xl bg-black/[0.06]', className)} {...props} />;
}

export function SectionHeading({
  title,
  subtitle,
  align = 'center',
  className,
}: {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <div className={cn(align === 'center' ? 'text-center' : 'text-left', className)}>
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <span className={align === 'center' ? 'heading-bar' : 'heading-bar-left'} />
      {subtitle && <p className="mt-4 text-sm text-muted">{subtitle}</p>}
    </div>
  );
}
