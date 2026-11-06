import { Suspense, useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { PageLoader } from '../PageLoader';
import { Footer } from './Footer';
import { MobileHeader, Sidebar } from './Sidebar';

export function Layout() {
  const [collapsed] = useLocalStorage('sidebar-collapsed', false);
  const { pathname } = useLocation();

  // Move keyboard/screen reader focus to the new page after navigation
  useEffect(() => {
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Preskoči na sadržaj
      </a>
      <Sidebar />
      <MobileHeader />
      <div className={cn('transition-[padding] duration-300', collapsed ? 'lg:pl-[108px]' : 'lg:pl-[272px]')}>
        <main id="main" tabIndex={-1} className="mx-auto max-w-[1240px] px-4 pt-4 outline-none sm:px-6 lg:pr-6 lg:pt-4">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <Footer />
        </div>
      </div>
      <ScrollRestoration />
    </div>
  );
}
