"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Home, ShoppingBag, MessageCircle, Heart, CreditCard,
  AlertTriangle, Bell, User, HelpCircle, Store, BarChart3,
  Star, Wallet, ArrowDownToLine, LayoutDashboard, Users, FolderTree,
  Settings, FileText, Shield, History, BadgeCheck, Tag, Crown, Gift, PenSquare,
  Flag, Activity, ToggleLeft, DollarSign, Globe, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
}

const clientNav: NavItem[] = [
  { labelKey: "home", href: "/tableau-de-bord/client", icon: Home },
  { labelKey: "orders", href: "/tableau-de-bord/client/commandes", icon: ShoppingBag },
  { labelKey: "history", href: "/tableau-de-bord/client/historique", icon: History },
  { labelKey: "messages", href: "/tableau-de-bord/client/messages", icon: MessageCircle },
  { labelKey: "favorites", href: "/tableau-de-bord/client/favoris", icon: Heart },
  { labelKey: "payments", href: "/tableau-de-bord/client/paiements", icon: CreditCard },
  { labelKey: "disputes", href: "/tableau-de-bord/client/litiges", icon: AlertTriangle },
  { labelKey: "referral", href: "/tableau-de-bord/client/parrainage", icon: Gift },
  { labelKey: "notifications", href: "/tableau-de-bord/client/notifications", icon: Bell },
  { labelKey: "profile", href: "/tableau-de-bord/client/profil", icon: User },
  { labelKey: "help", href: "/aide/guide-client", icon: HelpCircle },
];

const sellerNav: NavItem[] = [
  { labelKey: "home", href: "/tableau-de-bord/vendeur", icon: Home },
  { labelKey: "services", href: "/tableau-de-bord/vendeur/services", icon: Store },
  { labelKey: "orders", href: "/tableau-de-bord/vendeur/commandes", icon: ShoppingBag },
  { labelKey: "messages", href: "/tableau-de-bord/vendeur/messages", icon: MessageCircle },
  { labelKey: "revenue", href: "/tableau-de-bord/vendeur/revenus", icon: Wallet },
  { labelKey: "withdrawals", href: "/tableau-de-bord/vendeur/retraits", icon: ArrowDownToLine },
  { labelKey: "performance", href: "/tableau-de-bord/vendeur/performances", icon: BarChart3 },
  { labelKey: "reviews", href: "/tableau-de-bord/vendeur/avis", icon: Star },
  { labelKey: "subscription", href: "/tableau-de-bord/vendeur/abonnement", icon: Crown },
  { labelKey: "kyc", href: "/tableau-de-bord/vendeur/kyc", icon: BadgeCheck },
  { labelKey: "profile", href: "/tableau-de-bord/vendeur/profil", icon: User },
  { labelKey: "notifications", href: "/tableau-de-bord/vendeur/notifications", icon: Bell },
  { labelKey: "help", href: "/aide/guide-vendeur", icon: HelpCircle },
];

const adminNav: NavItem[] = [
  { labelKey: "overview", href: "/tableau-de-bord/admin", icon: LayoutDashboard },
  { labelKey: "analytics", href: "/tableau-de-bord/admin/analytiques", icon: BarChart3 },
  { labelKey: "users", href: "/tableau-de-bord/admin/utilisateurs", icon: Users },
  { labelKey: "services", href: "/tableau-de-bord/admin/services", icon: Store },
  { labelKey: "disputes", href: "/tableau-de-bord/admin/litiges", icon: AlertTriangle },
  { labelKey: "withdrawals", href: "/tableau-de-bord/admin/retraits", icon: ArrowDownToLine },
  { labelKey: "kyc", href: "/tableau-de-bord/admin/kyc", icon: BadgeCheck },
  { labelKey: "coupons", href: "/tableau-de-bord/admin/coupons", icon: Tag },
  { labelKey: "blog", href: "/tableau-de-bord/admin/blog", icon: PenSquare },
  { labelKey: "moderation", href: "/tableau-de-bord/admin/moderation", icon: Flag },
  { labelKey: "metrics", href: "/tableau-de-bord/admin/metriques", icon: Activity },
  { labelKey: "featureFlags", href: "/tableau-de-bord/admin/feature-flags", icon: ToggleLeft },
  { labelKey: "currencies", href: "/tableau-de-bord/admin/devises", icon: DollarSign },
  { labelKey: "paymentProviders", href: "/tableau-de-bord/admin/fournisseurs-paiement", icon: CreditCard },
  { labelKey: "countries", href: "/tableau-de-bord/admin/pays", icon: Globe },
  { labelKey: "exports", href: "/tableau-de-bord/admin/exports", icon: Download },
  { labelKey: "audit", href: "/tableau-de-bord/admin/audit", icon: FileText },
];

const navMap: Record<string, NavItem[]> = {
  client: clientNav,
  vendeur: sellerNav,
  admin: adminNav,
};

const roleToNamespace: Record<string, string> = {
  client: "client",
  vendeur: "seller",
  admin: "admin",
};

export function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const items = navMap[role] ?? clientNav;
  const ns = roleToNamespace[role] ?? "client";
  const t = useTranslations(`Dashboard.${ns}`);

  return (
    <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white lg:block">
      <nav className="sticky top-16 flex flex-col gap-0.5 overflow-y-auto p-3" style={{ maxHeight: "calc(100vh - 4rem)" }}>
        {items.map((item) => {
          const active =
            item.href === `/tableau-de-bord/${role}`
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px]", active && "text-primary-600")} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
