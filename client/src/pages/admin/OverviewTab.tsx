import { ORDER_STATUS_LABELS } from '@ibo/shared';
import { Banknote, Clock, MessageSquare, Package, ShoppingBag, Star, Users } from 'lucide-react';
import { useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useDailyOrders, useOrdersByStatus, useRevenueByCategory, useStatsOverview } from '@/api/admin';
import { Card, Skeleton } from '@/components/ui/card';
import { cn, formatPrice } from '@/lib/utils';

// Dashboard (Highcharts in v1, Recharts now). Colors stay in the brand family.

const BRAND = '#df0023';
const STATUS_COLORS = { Active: '#f59e0b', Completed: '#df0023', Cancelled: '#c4c4c4' } as const;
const tooltipStyle = { borderRadius: 12, border: '1px solid #e7e7e7', boxShadow: '0 8px 24px rgb(0 0 0 / 0.08)', fontSize: 12 };

function StatCard({ icon: Icon, label, value, hint, accent }: { icon: typeof Package; label: string; value: string | number; hint?: string; accent?: boolean }) {
  return (
    <Card className={cn('flex items-start gap-4 p-5', accent && 'bg-brand text-white')}>
      <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', accent ? 'bg-white/15' : 'bg-brand-50 text-brand')}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className={cn('text-xs font-medium', accent ? 'text-white/80' : 'text-muted')}>{label}</p>
        <p className="mt-1 truncate text-2xl font-semibold tabular-nums">{value}</p>
        {hint && <p className={cn('mt-0.5 text-xs', accent ? 'text-white/70' : 'text-muted')}>{hint}</p>}
      </div>
    </Card>
  );
}

const shortDate = (iso: string) => {
  const [, m, d] = iso.split('-');
  return `${d}.${m}.`;
};

export function OverviewTab() {
  const { data: stats } = useStatsOverview();
  const [days, setDays] = useState(30);
  const { data: daily } = useDailyOrders(days);
  const { data: revenue } = useRevenueByCategory();
  const { data: byStatus } = useOrdersByStatus();

  return (
    <div className="space-y-6">
      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard accent icon={Banknote} label="Ukupni prihod" value={formatPrice(stats.totalRevenue)} hint="Bez PDV-a, bez otkazanih" />
          <StatCard icon={ShoppingBag} label="Ukupno narudžbi" value={stats.totalOrders} hint={`${stats.activeOrders} aktivnih`} />
          <StatCard icon={Users} label="Registrovani korisnici" value={stats.totalUsers} />
          <StatCard icon={Package} label="Ukupno proizvoda" value={stats.totalProducts} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Narudžbe i prihod</h3>
              <p className="flex items-center gap-3 text-xs text-muted">
                Posljednjih {days} dana
                <span className="flex items-center gap-1"><span className="h-0.5 w-3 rounded bg-brand" /> prihod</span>
                <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-[#d4d4d4]" /> narudžbe</span>
              </p>
            </div>
            <div className="flex rounded-full bg-surface p-1 text-xs">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={cn('rounded-full px-3 py-1 font-medium transition', days === d ? 'bg-white shadow-sm' : 'text-muted hover:text-ink')}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            {daily ? (
              <ResponsiveContainer>
                <ComposedChart data={daily} margin={{ left: -10, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BRAND} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} minTickGap={24} />
                  <YAxis yAxisId="rev" tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
                  {/* Order counts sit on a hidden axis scaled so the bars stay in the lower part of the chart */}
                  <YAxis yAxisId="orders" orientation="right" allowDecimals={false} hide domain={[0, (max: number) => Math.max(max * 3, 3)]} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={(l) => shortDate(String(l))}
                    formatter={(v, name) => (name === 'revenue' ? [formatPrice(Number(v)), 'Prihod'] : [v, 'Narudžbe'])}
                  />
                  <Bar yAxisId="orders" dataKey="orders" fill="#d4d4d4" barSize={8} radius={[4, 4, 0, 0]} />
                  <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke={BRAND} strokeWidth={2} fill="url(#rev)" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full" />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Narudžbe po statusu</h3>
          <p className="text-xs text-muted">Sve narudžbe</p>
          <div className="h-56">
            {byStatus ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byStatus} dataKey="count" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                    {byStatus.map((s) => (
                      <Cell key={s.status} fill={STATUS_COLORS[s.status]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v, ORDER_STATUS_LABELS[n as keyof typeof ORDER_STATUS_LABELS]]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full" />
            )}
          </div>
          <ul className="space-y-2 text-sm">
            {byStatus?.map((s) => (
              <li key={s.status} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: STATUS_COLORS[s.status] }} />
                  {ORDER_STATUS_LABELS[s.status]}
                </span>
                <span className="font-semibold tabular-nums">{s.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h3 className="font-semibold">Prihod po kategoriji</h3>
          <p className="mb-4 text-xs text-muted">Ukupno, bez PDV-a</p>
          <div className="h-72">
            {revenue ? (
              <ResponsiveContainer>
                <BarChart data={revenue} layout="vertical" margin={{ left: 20, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" width={130} tick={{ fontSize: 12, fill: '#111' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgb(223 0 35 / 0.05)' }} formatter={(v) => [formatPrice(Number(v)), 'Prihod']} />
                  <Bar dataKey="revenue" fill={BRAND} radius={[0, 6, 6, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full" />
            )}
          </div>
        </Card>
        <div className="grid gap-4">
          <StatCard icon={Clock} label="Aktivne narudžbe" value={stats?.activeOrders ?? '-'} hint="Čekaju pripremu ili preuzimanje" />
          <StatCard icon={Star} label="Prosječna ocjena" value={stats ? stats.averageRating.toFixed(1) : '-'} hint="Na osnovu korisničkih recenzija" />
          <StatCard icon={MessageSquare} label="Nepročitane poruke" value={stats?.unreadMessages ?? '-'} hint="Sa kontakt forme" />
        </div>
      </div>
    </div>
  );
}
