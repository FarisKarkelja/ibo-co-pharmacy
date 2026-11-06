import type { Role } from '@ibo/shared';
import { ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { useMe } from '@/api/auth';
import { Button } from './ui/button';
import { EmptyState } from './ui/misc';
import { PageLoader } from './PageLoader';

/** Guards a page: guests go to login (and come back after), wrong roles see a friendly message. */
export function RequireAuth({ children, role }: { children: ReactNode; role?: Role }) {
  const { data: user, isLoading } = useMe();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (role && user.role !== role) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Nemate pristup ovoj stranici"
        description="Ova stranica je dostupna samo administratorima apoteke."
        action={
          <Button asChild>
            <Link to="/">Nazad na početnu</Link>
          </Button>
        }
      />
    );
  }
  return <>{children}</>;
}

/** Login and register pages redirect away when already signed in. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useMe();
  const location = useLocation();
  if (isLoading) return <PageLoader />;
  if (user) {
    const redirect = new URLSearchParams(location.search).get('redirect');
    return <Navigate to={redirect?.startsWith('/') ? redirect : user.role === 'Admin' ? '/admin' : '/profile'} replace />;
  }
  return <>{children}</>;
}
