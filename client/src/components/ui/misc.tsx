import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { ChevronDown, Star } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

// ---------- Tabs ----------
export const Tabs = TabsPrimitive.Root;
export const TabsContent = TabsPrimitive.Content;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-card [scrollbar-width:none]', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:text-ink data-[state=active]:bg-brand data-[state=active]:text-white [&_svg]:size-4',
        className,
      )}
      {...props}
    />
  );
}

// ---------- Accordion ----------
export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({ question, children, value }: { question: string; children: React.ReactNode; value: string }) {
  return (
    <AccordionPrimitive.Item value={value} className="border-b border-line last:border-0">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium transition hover:text-brand">
          {question}
          <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-data-[state=open]:rotate-180 group-data-[state=open]:text-brand" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="pb-4 text-sm leading-relaxed text-muted">{children}</AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}

// ---------- Switch ----------
export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-black/15 transition data-[state=checked]:bg-brand',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
    </SwitchPrimitive.Root>
  );
}

// ---------- Tooltip ----------
export const TooltipProvider = TooltipPrimitive.Provider;

export function Tooltip({ content, children, side = 'right', disabled }: { content: string; children: React.ReactNode; side?: 'right' | 'top' | 'bottom' | 'left'; disabled?: boolean }) {
  if (disabled) return <>{children}</>;
  return (
    <TooltipPrimitive.Root delayDuration={100}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={10}
          className="z-50 rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white shadow-lg"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

// ---------- Stars ----------
export function Stars({ value, size = 'sm', className }: { value: number; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const px = { sm: 'size-3.5', md: 'size-4', lg: 'size-6' }[size];
  return (
    <span className={cn('inline-flex gap-0.5', className)} aria-label={`Ocjena ${value} od 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn(px, i <= Math.round(value) ? 'fill-brand text-brand' : 'fill-black/10 text-transparent')} />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = React.useState(0);
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Ocjena" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} od 5`}
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(i)}
          className="rounded p-0.5 transition hover:scale-110"
        >
          <Star className={cn('size-7', i <= (hover || value) ? 'fill-brand text-brand' : 'fill-black/10 text-transparent')} />
        </button>
      ))}
    </div>
  );
}

// ---------- Empty and error states ----------
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-brand-50 text-brand">
        <Icon className="size-7" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Red circle with a white icon, the v1 "service" icon style. */
export function IconBadge({ icon: Icon, className }: { icon: React.ComponentType<{ className?: string }>; className?: string }) {
  return (
    <span className={cn('grid size-14 shrink-0 place-items-center rounded-full bg-brand text-white shadow-brand', className)}>
      <Icon className="size-6" />
    </span>
  );
}
