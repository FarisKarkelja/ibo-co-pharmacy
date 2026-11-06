import type { Review } from '@ibo/shared';
import { MessageSquareQuote, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useMe } from '@/api/auth';
import { useDeleteReview, useReviewSummary, useReviews } from '@/api/reviews';
import { PageHeader } from '@/components/PageHeader';
import { ReviewCard, ReviewFormDialog } from '@/components/Reviews';
import { Button } from '@/components/ui/button';
import { Card, Skeleton } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/dialog';
import { EmptyState, Stars } from '@/components/ui/misc';
import { errorMessage } from '@/lib/api';

export default function ReviewsPage() {
  const { data: user } = useMe();
  const { data: reviews, isLoading } = useReviews(100);
  const { data: summary } = useReviewSummary();
  const del = useDeleteReview();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Review | undefined>();
  const [deleting, setDeleting] = useState<Review | null>(null);

  const canModify = (r: Review) => !!user && (r.userId === user.id || user.role === 'Admin');

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Mišljenja korisnika"
        description="Iskustva naših kupaca s obje apoteke IBO & CO."
        crumbs={[{ label: 'Recenzije' }]}
        actions={
          user ? (
            <Button
              onClick={() => {
                setEditing(undefined);
                setFormOpen(true);
              }}
            >
              Podijelite svoje mišljenje
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login?redirect=/reviews">Prijavite se za recenziju</Link>
            </Button>
          )
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        <Card className="p-6 lg:sticky lg:top-6">
          <p className="text-sm text-muted">Prosječna ocjena</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-5xl font-semibold">{summary ? summary.average.toFixed(1) : '-'}</span>
            <span className="pb-2 text-sm text-muted">/ 5</span>
          </div>
          <Stars value={summary?.average ?? 0} size="md" className="mt-2" />
          <p className="mt-2 text-xs text-muted">Na osnovu {summary?.count ?? 0} recenzija</p>
          <div className="mt-6 space-y-2">
            {([5, 4, 3, 2, 1] as const).map((n) => {
              const count = summary?.distribution[n] ?? 0;
              const pct = summary?.count ? (count / summary.count) * 100 : 0;
              return (
                <div key={n} className="flex items-center gap-3 text-xs">
                  <span className="w-3 font-medium">{n}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-muted tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-52" />
            ))}
          </div>
        ) : !reviews?.length ? (
          <Card>
            <EmptyState icon={MessageSquareQuote} title="Još nema recenzija" description="Budite prvi koji će podijeliti svoje iskustvo." />
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {reviews.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                actions={
                  canModify(r) ? (
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Uredi recenziju"
                        onClick={() => {
                          setEditing(r);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Obriši recenziju" onClick={() => setDeleting(r)}>
                        <Trash2 />
                      </Button>
                    </div>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

      <ReviewFormDialog open={formOpen} onOpenChange={setFormOpen} review={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Obrisati recenziju?"
        description="Recenzija će biti trajno uklonjena."
        loading={del.isPending}
        onConfirm={() =>
          del.mutate(deleting!.id, {
            onSuccess: () => {
              toast.success('Recenzija je obrisana.');
              setDeleting(null);
            },
            onError: (err) => toast.error(errorMessage(err)),
          })
        }
      />
    </div>
  );
}
