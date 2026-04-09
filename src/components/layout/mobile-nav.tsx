"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageCircle, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Accueil", href: "/", icon: Home },
  { label: "Recherche", href: "/recherche", icon: Search },
  { label: "Messages", href: "/tableau-de-bord/client/messages", icon: MessageCircle },
  { label: "Commandes", href: "/tableau-de-bord/client/commandes", icon: ShoppingBag },
  { label: "Profil", href: "/tableau-de-bord/client/profil", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-gray-200 bg-white sm:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition-colors",
                active
                  ? "text-primary-600 font-medium"
                  : "text-gray-500"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", active && "text-primary-600")}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
