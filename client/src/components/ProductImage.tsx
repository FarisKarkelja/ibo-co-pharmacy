import { Pill } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/** Product photo, or a clean branded placeholder when there is no image. */
export function ProductImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={cn('@container grid place-items-center bg-gradient-to-br from-brand-50 to-white', className)} role="img" aria-label={alt}>
        <div className="flex flex-col items-center gap-2 text-brand/60">
          <Pill className="size-5 @[7rem]:size-10" strokeWidth={1.5} />
          {/* The label only shows when the placeholder is big enough to read it */}
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] @[7rem]:block">IBO & CO</span>
        </div>
      </div>
    );
  }
  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={cn('object-contain', className)} />
  );
}
