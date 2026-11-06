import { LoaderCircle } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-label="Učitavanje">
      <LoaderCircle className="size-8 animate-spin text-brand" />
    </div>
  );
}
