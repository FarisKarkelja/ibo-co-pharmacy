import { Info, LayoutDashboard, type LucideIcon, Mail, MapPin, ShoppingBag, Star } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const primaryNav: NavItem[] = [
  { to: '/', label: 'Početna', icon: LayoutDashboard },
  { to: '/about', label: 'O nama', icon: Info },
  { to: '/shop', label: 'Shop', icon: ShoppingBag },
  { to: '/reviews', label: 'Recenzije', icon: Star },
  { to: '/locations', label: 'Lokacije', icon: MapPin },
  { to: '/contact', label: 'Kontakt', icon: Mail },
];
