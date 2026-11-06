import { QueryClientProvider } from '@tanstack/react-query';
import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { GuestOnly, RequireAuth } from '@/components/RequireAuth';
import { TooltipProvider } from '@/components/ui/misc';
import { queryClient } from '@/lib/query-client';
import { LoginPage, RegisterPage } from '@/pages/AuthPages';
import HomePage from '@/pages/HomePage';
import { AboutPage, ContactPage, LocationsPage, PrivacyPage } from '@/pages/InfoPages';
import NotFoundPage from '@/pages/NotFoundPage';
import { ProductDetailsPage, ProductsPage, ShopPage } from '@/pages/ShopPages';

// Pages behind login are loaded on demand, so visitors of the public
// pages never download the admin panel or the charting library.
const CartPage = lazy(() => import('@/pages/CartPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const ReviewsPage = lazy(() => import('@/pages/ReviewsPage'));
const AdminPage = lazy(() => import('@/pages/admin/AdminPage'));

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'locations', element: <LocationsPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'privacy-policy', element: <PrivacyPage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailsPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'login', element: <GuestOnly><LoginPage /></GuestOnly> },
      { path: 'register', element: <GuestOnly><RegisterPage /></GuestOnly> },
      { path: 'cart', element: <RequireAuth><CartPage /></RequireAuth> },
      { path: 'profile', element: <RequireAuth><ProfilePage /></RequireAuth> },
      { path: 'admin', element: <RequireAuth role="Admin"><AdminPage /></RequireAuth> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ style: { fontFamily: 'Poppins, sans-serif', borderRadius: 14 } }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
