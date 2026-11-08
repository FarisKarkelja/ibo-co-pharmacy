import {
  ChevronLeft,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  Link,
  useLocation,
  useMatch,
  useNavigate,
  useResolvedPath,
} from "react-router";
import { toast } from "sonner";
import { useLogout, useMe } from "@/api/auth";
import { useCart } from "@/api/cart";
import { Dialog, DialogClose, SheetContent } from "@/components/ui/dialog";
import { Tooltip } from "@/components/ui/misc";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { type NavItem, primaryNav } from "./nav-items";

// Floating white sidebar from v1 (collapsible to icons), plus a top bar and
// slide-in drawer on small screens.

function useSecondaryNav() {
  const { data: user } = useMe();
  const { data: cart } = useCart();
  const items: (NavItem & { badge?: number })[] = [];
  if (!user)
    return { user, items: [{ to: "/login", label: "Prijava", icon: LogIn }] };
  if (user.role === "Admin")
    items.push({ to: "/admin", label: "Admin panel", icon: ShieldCheck });
  items.push({
    to: "/cart",
    label: "Korpa",
    icon: ShoppingCart,
    badge: cart?.itemCount,
  });
  items.push({ to: "/profile", label: "Profil", icon: UserRound });
  return { user, items };
}

function NavEntry({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem & { badge?: number };
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  // Active state is computed here instead of NavLink's className function: the tooltip
  // (Radix asChild) merges class names as strings and would break a function className.
  const { pathname } = useResolvedPath(item.to);
  const isActive = !!useMatch({ path: pathname, end: item.to === "/" });
  return (
    <Tooltip content={item.label} disabled={!collapsed}>
      <Link
        to={item.to}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        aria-label={collapsed ? item.label : undefined}
        className={cn(
          "group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
          isActive
            ? "bg-brand text-white shadow-brand"
            : "text-ink/80 hover:bg-brand-50 hover:text-brand",
          collapsed && "justify-center px-0",
        )}
      >
        <Icon className="size-5 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {!!item.badge && (
          <span
            className={cn(
              "grid min-w-5 place-items-center rounded-full bg-ink px-1.5 text-[10px] font-semibold leading-5 text-white",
              collapsed ? "absolute -right-1 -top-1" : "ml-auto",
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    </Tooltip>
  );
}

function LogoutButton({
  collapsed,
  onDone,
}: {
  collapsed?: boolean;
  onDone?: () => void;
}) {
  const logout = useLogout();
  const navigate = useNavigate();
  return (
    <Tooltip content="Odjava" disabled={!collapsed}>
      <button
        type="button"
        onClick={() =>
          logout.mutate(undefined, {
            onSuccess: () => {
              toast.success("Uspješno ste se odjavili.");
              onDone?.();
              navigate("/");
            },
          })
        }
        className={cn(
          "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink/80 transition-colors hover:bg-brand-50 hover:text-brand",
          collapsed && "justify-center px-0",
        )}
      >
        <LogOut className="size-5 shrink-0" />
        {!collapsed && "Odjava"}
      </button>
    </Tooltip>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useLocalStorage("sidebar-collapsed", false);
  const { user, items } = useSecondaryNav();

  return (
    <aside
      className={cn(
        "fixed inset-y-4 left-4 z-40 hidden flex-col rounded-2xl bg-white p-3 shadow-card transition-[width] duration-300 lg:flex",
        collapsed ? "w-[76px]" : "w-60",
      )}
    >
      <div
        className={cn(
          "mb-6 flex items-center pt-2",
          collapsed ? "flex-col gap-3" : "justify-between px-2",
        )}
      >
        <Link to="/" aria-label="IBO & CO početna" className="shrink-0">
          <img src="/images/logo.png" alt="IBO & CO" className="h-11 w-auto" />
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Proširi meni" : "Skupi meni"}
          className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-surface hover:text-ink"
        >
          <ChevronLeft
            className={cn(
              "size-5 transition-transform",
              collapsed && "rotate-180",
            )}
          />
        </button>
      </div>

      <nav
        className="flex flex-1 flex-col justify-between gap-6 overflow-y-auto"
        aria-label="Glavni meni"
      >
        <ul className="space-y-1">
          {primaryNav.map((item) => (
            <li key={item.to}>
              <NavEntry item={item} collapsed={collapsed} />
            </li>
          ))}
        </ul>
        <ul className="space-y-1 border-t border-line pt-3">
          {items.map((item) => (
            <li key={item.to}>
              <NavEntry item={item} collapsed={collapsed} />
            </li>
          ))}
          {user && (
            <li>
              <LogoutButton collapsed={collapsed} />
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { user, items } = useSecondaryNav();
  const { data: cart } = useCart();
  const location = useLocation();
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
      <Dialog open={open} onOpenChange={setOpen}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Otvori meni"
          className="grid size-10 place-items-center rounded-xl text-ink hover:bg-surface"
        >
          <Menu className="size-6" />
        </button>
        <SheetContent title="Meni">
          <div className="mb-6 flex items-center justify-between">
            <img
              src="/images/logo.png"
              alt="IBO & CO"
              className="h-11 w-auto"
            />
            <DialogClose
              className="grid size-10 place-items-center rounded-xl hover:bg-surface"
              aria-label="Zatvori meni"
            >
              <X className="size-5" />
            </DialogClose>
          </div>
          <nav
            className="flex flex-1 flex-col justify-between overflow-y-auto"
            aria-label="Glavni meni"
          >
            <ul className="space-y-1">
              {primaryNav.map((item) => (
                <li key={item.to}>
                  <NavEntry item={item} onNavigate={close} />
                </li>
              ))}
            </ul>
            <ul className="space-y-1 border-t border-line pt-3">
              {items.map((item) => (
                <li key={item.to}>
                  <NavEntry item={item} onNavigate={close} />
                </li>
              ))}
              {user && (
                <li>
                  <LogoutButton onDone={close} />
                </li>
              )}
            </ul>
          </nav>
        </SheetContent>
      </Dialog>

      <Link to="/" aria-label="IBO & CO početna">
        <img src="/images/logo.png" alt="IBO & CO" className="h-10 w-auto" />
      </Link>

      <Link
        to={
          user
            ? "/cart"
            : `/login?redirect=${encodeURIComponent(location.pathname)}`
        }
        aria-label="Korpa"
        className="relative grid size-10 place-items-center rounded-xl hover:bg-surface"
      >
        <ShoppingCart className="size-6" />
        {!!cart?.itemCount && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-5 text-white">
            {cart.itemCount}
          </span>
        )}
      </Link>
    </header>
  );
}
