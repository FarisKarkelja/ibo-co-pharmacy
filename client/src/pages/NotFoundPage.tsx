import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="grid min-h-[70vh] animate-fade-in place-items-center text-center">
      <div>
        <p className="text-8xl font-bold tracking-tighter text-brand sm:text-9xl">404</p>
        <h1 className="mt-4 text-2xl font-semibold">Stranica nije pronađena</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Stranica koju tražite je premještena, uklonjena ili možda nikada nije postojala.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link to="/">Nazad na početnu</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/shop">Shop</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
