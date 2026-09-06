"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Receipt,
  BarChart3,
  Truck,
  Tag,
  Users,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuthSession, useLogout } from "../../../features/auth";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: readonly string[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/checkout", label: "Checkout", icon: ShoppingCart },
  { href: "/products", label: "Products", icon: Package },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/sales", label: "Sales", icon: Receipt },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["OWNER", "ADMIN", "MANAGER"] },
  { href: "/purchase-orders", label: "Purchase Orders", icon: Truck, roles: ["OWNER", "ADMIN", "MANAGER"] },
  { href: "/discounts", label: "Discounts", icon: Tag, roles: ["OWNER", "ADMIN", "MANAGER"] },
  { href: "/team", label: "Team", icon: Users, roles: ["OWNER", "ADMIN", "MANAGER"] },
];

const PLATFORM_ADMIN_ITEM: NavItem = {
  href: "/platform-admin/organizations",
  label: "Organization Approvals",
  icon: ShieldCheck,
};

interface AppShellProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({ title, actions, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isBootstrapping } = useAuthSession();
  const logoutMutation = useLogout();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isBootstrapping && !session) {
      router.replace("/login");
    }
  }, [isBootstrapping, session, router]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (isBootstrapping || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading...</p>
      </main>
    );
  }

  if (!session.user.isPlatformAdmin && session.organization.status !== "APPROVED") {
    const isRejected = session.organization.status === "REJECTED";
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <Card narrow>
          <h1 className="mb-2 text-xl font-semibold text-slate-900">
            {isRejected ? "Registration not approved" : "Approval pending"}
          </h1>
          <p className="text-sm text-slate-600">
            {isRejected
              ? `We're sorry, but the registration for ${session.organization.name} was not approved. Contact support if you believe this is a mistake.`
              : `Thanks for signing up! ${session.organization.name} is waiting for approval before you can start using the platform. We'll let you know once it's reviewed.`}
          </p>
          <Button
            className="mt-4"
            variant="secondary"
            onClick={() => logoutMutation.mutate()}
            isLoading={logoutMutation.isPending}
          >
            Log out
          </Button>
        </Card>
      </main>
    );
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(session.user.role));
  const items = session.user.isPlatformAdmin ? [...visibleItems, PLATFORM_ADMIN_ITEM] : visibleItems;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <span className="text-base font-semibold tracking-tight text-slate-900">POS &amp; Inventory</span>
          <button
            type="button"
            aria-label="Close navigation"
            className="cursor-pointer text-slate-400 hover:text-slate-600 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                      isActive ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex flex-col">
            <span className="truncate text-sm font-medium text-slate-900">
              {session.user.firstName} {session.user.lastName}
            </span>
            <span className="text-xs text-slate-500">
              {session.organization.name} · {session.user.role}
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => logoutMutation.mutate()}
            isLoading={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              className="cursor-pointer text-slate-500 hover:text-slate-700 lg:hidden"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
