import { BarChart3, FolderTree, Mail, Package, ShoppingBag, Star, Users } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { useStatsOverview } from '@/api/admin';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/misc';
import { CategoriesTab, ProductsTab } from './CatalogTabs';
import { MessagesTab, OrdersTab, ReviewsTab, UsersTab } from './ManageTabs';
import { OverviewTab } from './OverviewTab';

const TABS = [
  { value: 'overview', label: 'Pregled', icon: BarChart3, Component: OverviewTab },
  { value: 'orders', label: 'Narudžbe', icon: ShoppingBag, Component: OrdersTab },
  { value: 'products', label: 'Proizvodi', icon: Package, Component: ProductsTab },
  { value: 'categories', label: 'Kategorije', icon: FolderTree, Component: CategoriesTab },
  { value: 'users', label: 'Korisnici', icon: Users, Component: UsersTab },
  { value: 'reviews', label: 'Recenzije', icon: Star, Component: ReviewsTab },
  { value: 'messages', label: 'Poruke', icon: Mail, Component: MessagesTab },
] as const;

export default function AdminPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.value === params.get('tab')) ? params.get('tab')! : 'overview';
  const { data: stats } = useStatsOverview();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Admin panel"
        description="Upravljanje narudžbama, katalogom, korisnicima i recenzijama."
        crumbs={[{ label: 'Admin panel' }]}
        actions={
          <Button variant="secondary" size="sm" asChild>
            <a href="/api/docs" target="_blank" rel="noreferrer">
              API dokumentacija
            </a>
          </Button>
        }
      />
      <Tabs value={tab} onValueChange={(v) => setParams(v === 'overview' ? {} : { tab: v }, { replace: true })}>
        <TabsList className="mb-6 w-fit max-w-full">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              <t.icon /> {t.label}
              {t.value === 'messages' && !!stats?.unreadMessages && (
                <span className="grid min-w-5 place-items-center rounded-full bg-ink px-1.5 text-[10px] font-semibold leading-5 text-white">
                  {stats.unreadMessages}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <t.Component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
