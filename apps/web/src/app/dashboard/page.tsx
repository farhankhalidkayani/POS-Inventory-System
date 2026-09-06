"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Boxes,
  Receipt,
  BarChart3,
  Truck,
  Tag,
  Users,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useAuthSession } from "../../features/auth";
import { AppShell } from "../../shared/components/layout/AppShell";
import { Card } from "../../shared/components/ui/Card";

interface QuickLink {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  roles?: readonly string[];
}

const QUICK_LINKS: QuickLink[] = [
  { href: "/checkout", label: "Checkout", description: "Ring up a sale", icon: ShoppingCart },
  { href: "/products", label: "Products", description: "Manage the catalog", icon: Package },
  { href: "/inventory", label: "Inventory", description: "Stock levels & adjustments", icon: Boxes },
  { href: "/sales", label: "Sales", description: "Sale history", icon: Receipt },
  { href: "/reports", label: "Reports", description: "Summaries & alerts", icon: BarChart3, roles: ["OWNER", "ADMIN", "MANAGER"] },
  { href: "/purchase-orders", label: "Purchase Orders", description: "Suppliers & receiving", icon: Truck, roles: ["OWNER", "ADMIN", "MANAGER"] },
  { href: "/discounts", label: "Discounts", description: "Manage discount codes", icon: Tag, roles: ["OWNER", "ADMIN", "MANAGER"] },
  { href: "/team", label: "Team", description: "Members & invites", icon: Users, roles: ["OWNER", "ADMIN", "MANAGER"] },
];

export default function DashboardPage() {
  const { session, isBootstrapping } = useAuthSession();

  if (isBootstrapping || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading...</p>
      </main>
    );
  }

  const links = QUICK_LINKS.filter((link) => !link.roles || link.roles.includes(session.user.role));
  if (session.user.isPlatformAdmin) {
    links.push({
      href: "/platform-admin/organizations",
      label: "Organization Approvals",
      description: "Review pending sign-ups",
      icon: ShieldCheck,
    });
  }

  return (
    <AppShell title="Dashboard">
      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">
            Welcome back, {session.user.firstName} {session.user.lastName}
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div className="flex justify-between sm:block">
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium text-slate-900">{session.user.role}</dd>
            </div>
            <div className="flex justify-between sm:block">
              <dt className="text-slate-500">Organization</dt>
              <dd className="font-medium text-slate-900">{session.organization.name}</dd>
            </div>
            <div className="flex justify-between sm:block">
              <dt className="text-slate-500">Store</dt>
              <dd className="font-medium text-slate-900">{session.store?.name ?? "No store assigned"}</dd>
            </div>
          </dl>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-colors duration-150 hover:border-primary-300 hover:bg-primary-50/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 group-hover:bg-primary-100">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{link.label}</span>
                  <span className="block text-sm text-slate-500">{link.description}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
