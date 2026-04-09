"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, ShoppingBag, MessageCircle, Heart, CreditCard,
  AlertTriangle, Bell, User, HelpCircle, Store, BarChart3,
  Star, Wallet, ArrowDownToLine, LayoutDashboard, Users, FolderTree,
  Settings, FileText, Shield, History, BadgeCheck, Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const clientNav: NavItem[] = [
  { label: "Accueil", href: "/tableau-de-bord/client", icon: Home },
  { label: "Commandes", href: "/tableau-de-bord/client/commandes", icon: ShoppingBag },
  { label: "Historique", href: "/tableau-de-bord/client/historique", icon: History },
  { label: "Messages", href: "/tableau-de-bord/client/messages", icon: MessageCircle },
  { label: "Favoris", href: "/tableau-de-bord/client/favoris", icon: Heart },
  { label: "Paiements", href: "/tableau-de-bord/client/paiements", icon: CreditCard },
  { label: "Litiges", href: "/tableau-de-bord/client/litiges", icon: AlertTriangle },
  { label: "Notifications", href: "/tableau-de-bord/client/notifications", icon: Bell },
  { label: "Profil", href: "/tableau-de-bord/client/profil", icon: User },
  { label: "Aide", href: "/aide/guide-client", icon: HelpCircle },
];

const sellerNav: NavItem[] = [
  { label: "Accueil", href: "/tableau-de-bord/vendeur", icon: Home },
  { label: "Services", href: "/tableau-de-bord/vendeur/services", icon: Store },
  { label: "Commandes", href: "/tableau-de-bord/vendeur/commandes", icon: ShoppingBag },
  { label: "Messages", href: "/tableau-de-bord/vendeur/messages", icon: MessageCircle },
  { label: "Revenus", href: "/tableau-de-bord/vendeur/revenus", icon: Wallet },
  { label: "Retraits", href: "/tableau-de-bord/vendeur/retraits", icon: ArrowDownToLine },
  { label: "Performances", href: "/tableau-de-bord/vendeur/performances", icon: BarChart3 },
  { label: "Avis", href: "/tableau-de-bord/vendeur/avis", icon: Star },
  { label: "Vérification KYC", href: "/tableau-de-bord/vendeur/kyc", icon: BadgeCheck },
  { label: "Profil", href: "/tableau-de-bord/vendeur/profil", icon: User },
  { label: "Notifications", href: "/tableau-de-bord/vendeur/notifications", icon: Bell },
  { label: "Aide", href: "/aide/guide-vendeur", icon: HelpCircle },
];

const adminNav: NavItem[] = [
  { label: "Aperçu", href: "/tableau-de-bord/admin", icon: LayoutDashboard },
  { label: "Analytiques", href: "/tableau-de-bord/admin/analytiques", icon: BarChart3 },
  { label: "Utilisateurs", href: "/tableau-de-bord/admin/utilisateurs", icon: Users },
  { label: "Services", href: "/tableau-de-bord/admin/services", icon: Store },
  { label: "Litiges", href: "/tableau-de-bord/admin/litiges", icon: AlertTriangle },
  { label: "Retraits", href: "/tableau-de-bord/admin/retraits", icon: ArrowDownToLine },
  { label: "Vérification KYC", href: "/tableau-de-bord/admin/kyc", icon: BadgeCheck },
  { label: "Coupons", href: "/tableau-de-bord/admin/coupons", icon: Tag },
  { label: "Journal d'audit", href: "/tableau-de-bord/admin/audit", icon: FileText },
];

const navMap: Record<string, NavItem[]> = {
  client: clientNav,
  vendeur: sellerNav,
  admin: adminNav,
};

export function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const items = navMap[role] ?? clientNav;

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
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
