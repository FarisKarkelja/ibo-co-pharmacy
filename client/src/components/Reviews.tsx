import { zodResolver } from '@hookform/resolvers/zod';
import { REVIEW_LOCATION_LABELS, REVIEW_LOCATIONS, type Review, reviewSchema, type ReviewInput } from '@ibo/shared';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, MapPin, MessageSquareQuote, Quote } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useCreateReview, useUpdateReview } from '@/api/reviews';
import { handleFormError } from '@/lib/form';
import { cn, formatDate, initials } from '@/lib/utils';
import { Button } from './ui/button';
import { Card, Skeleton } from './ui/card';
import { Dialog, DialogContent } from './ui/dialog';
import { Field, NativeSelect, Textarea } from './ui/input';
import { EmptyState, StarInput, Stars } from './ui/misc';

export function ReviewCard({ review, actions, className }: { review: Review; actions?: React.ReactNode; className?: string }) {
  return (
    <Card className={cn('relative flex h-full flex-col p-6', className)}>
      <Quote className="absolute right-5 top-5 size-8 fill-brand/10 text-transparent" />
      <Stars value={review.rating} />
      <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/80">"{review.comment}"</p>
      <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand">
          {initials(review.authorName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{review.authorName}</p>
          <p className="flex items-center gap-1 text-xs text-muted">
            <MapPin className="size-3" /> {REVIEW_LOCATION_LABELS[review.location]} · {formatDate(review.createdAt)}
          </p>
        </div>
        {actions}
      </div>
    </Card>
  );
}

export function ReviewsCarousel({ reviews, loading }: { reviews?: Review[]; loading?: boolean }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 5000, stopOnInteraction: true })]);
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelected(embla.selectedScrollSnap());
    setSnaps(embla.scrollSnapList());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on('select', onSelect).on('reInit', onSelect);
  }, [embla, onSelect]);

  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    );
  }
  if (!reviews?.length) {
    return <EmptyState icon={MessageSquareQuote} title="Još nema recenzija" description="Budite prvi koji će podijeliti svoje iskustvo." />;
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-5 flex">
          {reviews.map((r) => (
            <div key={r.id} className="min-w-0 shrink-0 grow-0 basis-full pl-5 pb-2 md:basis-1/2 xl:basis-1/3">
              <ReviewCard review={r} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-4">
        <Button variant="secondary" size="icon-sm" aria-label="Prethodna" onClick={() => embla?.scrollPrev()}>
          <ChevronLeft />
        </Button>
        <div className="flex gap-1.5">
          {snaps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Recenzija ${i + 1}`}
              onClick={() => embla?.scrollTo(i)}
              className={cn('h-2 rounded-full transition-all', i === selected ? 'w-6 bg-brand' : 'w-2 bg-black/15')}
            />
          ))}
        </div>
        <Button variant="secondary" size="icon-sm" aria-label="Sljedeća" onClick={() => embla?.scrollNext()}>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

/** Create a new review, or edit an existing one when `review` is passed. */
export function ReviewFormDialog({ open, onOpenChange, review }: { open: boolean; onOpenChange: (o: boolean) => void; review?: Review }) {
  const create = useCreateReview();
  const update = useUpdateReview();
  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    values: review
      ? { location: review.location, rating: review.rating, comment: review.comment }
      : { location: 'Both', rating: 0, comment: '' },
  });
  const { register, control, handleSubmit, formState, setError, reset } = form;

  const onSubmit = handleSubmit((values) => {
    const done = {
      onSuccess: () => {
        toast.success(review ? 'Recenzija je ažurirana.' : 'Hvala na recenziji!');
        onOpenChange(false);
        reset();
      },
      onError: (err: unknown) => handleFormError(err, setError),
    };
    if (review) update.mutate({ id: review.id, comment: values.comment, rating: values.rating }, done);
    else create.mutate(values, done);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={review ? 'Uredi recenziju' : 'Podijelite svoje mišljenje'} description="Kakvo je Vaše iskustvo s apotekom IBO & CO?">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div>
            <p className="mb-2 text-sm font-medium">Ocjena</p>
            <Controller control={control} name="rating" render={({ field }) => <StarInput value={field.value} onChange={field.onChange} />} />
            {formState.errors.rating && <p className="mt-1.5 text-xs font-medium text-brand">Odaberite ocjenu od 1 do 5.</p>}
          </div>
          <Field label="Lokacija" error={formState.errors.location?.message}>
            <NativeSelect {...register('location')} disabled={!!review}>
              {REVIEW_LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {REVIEW_LOCATION_LABELS[l]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Komentar" error={formState.errors.comment?.message}>
            <Textarea {...register('comment')} placeholder="Napišite nekoliko riječi o usluzi, osoblju ili proizvodima..." maxLength={1000} />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Odustani
            </Button>
            <Button type="submit" loading={create.isPending || update.isPending}>
              {review ? 'Sačuvaj promjene' : 'Pošalji'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
