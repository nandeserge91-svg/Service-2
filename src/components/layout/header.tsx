"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  HelpCircle,
  BookOpen,
  MessageSquare,
  Grid3X3,
  Activity,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { PushManager } from "@/components/notifications/push-manager";
import { SearchBar } from "@/components/search/search-bar";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { cn } from "@/lib/utils";
import { APP_NAME, CATEGORIES_ICONS } from "@/lib/constants";

const MAIN_CATEGORY_SLUGS = [
  "design",
  "developpement",
  "redaction",
  "marketing",
  "business",
  "video",
  "audio",
  "photo",
  "formation",
] as const;

const HELP_LINKS = [
  { key: "faq", href: "/aide/faq", icon: HelpCircle },
  { key: "guideClient", href: "/aide/guide-client", icon: BookOpen },
  { key: "guideSeller", href: "/aide/guide-vendeur", icon: BookOpen },
  { key: "status", href: "/statut", icon: Activity },
  { key: "releaseNotes", href: "/aide/versions", icon: ClipboardList },
  { key: "contact", href: "/contact", icon: MessageSquare },
] as const;

export function Header() {
  const t = useTranslations("Header");
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!session?.user;
  const roles = session?.user?.roles ?? [];
  const dashboardPath = roles.includes("ADMIN")
    ? "/tableau-de-bord/admin"
    : roles.includes("SELLER")
      ? "/tableau-de-bord/vendeur"
      : "/tableau-de-bord/client";

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setCatMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      {/* ── Main bar ── */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            M
          </span>
          <span className="hidden text-lg font-bold text-gray-900 lg:block">
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {/* Categories dropdown */}
          <div ref={catRef} className="relative">
            <button
              onClick={() => setCatMenuOpen(!catMenuOpen)}
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                catMenuOpen ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Grid3X3 className="h-4 w-4" />
              {t("categories")}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", catMenuOpen && "rotate-180")} />
            </button>

            {catMenuOpen && (
              <div className="absolute left-0 z-50 mt-1 w-72 rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
                {MAIN_CATEGORY_SLUGS.map((slug) => (
                  <Link
                    key={slug}
                    href={`/recherche?cat=${slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <span className="text-base">{CATEGORIES_ICONS[slug] ?? "📁"}</span>
                    {t(`cat.${slug}`)}
                  </Link>
                ))}
                <hr className="my-1 border-gray-100" />
                <Link
                  href="/services"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50"
                >
                  {t("viewAllCategories")}
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/services"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            {t("services")}
          </Link>
        </nav>

        {/* Search */}
        <div className="hidden flex-1 md:block">
          <SearchBar className="max-w-xl" />
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/recherche"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
          >
            <Search className="h-5 w-5" />
          </Link>

          {isLoggedIn ? (
            <>
              <PushManager />
              <NotificationBell />
              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100"
                >
                  <Avatar
                    name={session.user.name ?? session.user.email ?? "U"}
                    src={session.user.image}
                    size="sm"
                  />
                  <span className="hidden max-w-[120px] truncate text-sm font-medium text-gray-700 sm:block">
                    {session.user.name ?? session.user.email}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-50 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                      <div className="border-b border-gray-100 px-4 py-2">
                        <p className="truncate text-sm font-medium text-gray-900">{session.user.name}</p>
                        <p className="truncate text-xs text-gray-500">{session.user.email}</p>
                      </div>
                      <Link
                        href={dashboardPath}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {t("dashboard")}
                      </Link>
                      <Link
                        href={`${dashboardPath}/profil`}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        {t("myProfile")}
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      {HELP_LINKS.slice(0, 2).map((h) => (
                        <Link
                          key={h.href}
                          href={h.href}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <h.icon className="h-4 w-4" />
                          {t(`help.${h.key}`)}
                        </Link>
                      ))}
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50"
                      >
                        <LogOut className="h-4 w-4" />
                        {t("signOut")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/connexion" className="hidden sm:block">
                <Button variant="ghost" size="sm">{t("login")}</Button>
              </Link>
              <Link href="/auth/inscription" className="hidden sm:block">
                <Button variant="primary" size="sm">{t("register")}</Button>
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <div
        className={cn(
          "overflow-hidden border-t border-gray-100 bg-white transition-all md:hidden",
          mobileMenuOpen ? "max-h-[32rem]" : "max-h-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {/* Categories section */}
          <p className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {t("sectionCategories")}
          </p>
          <div className="grid grid-cols-2 gap-1">
            {MAIN_CATEGORY_SLUGS.slice(0, 6).map((slug) => (
              <Link
                key={slug}
                href={`/recherche?cat=${slug}`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-sm">{CATEGORIES_ICONS[slug] ?? "📁"}</span>
                <span className="truncate">{t(`cat.${slug}`).split(" & ")[0]}</span>
              </Link>
            ))}
          </div>
          <Link
            href="/services"
            className="rounded-lg px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t("mobileAllCategories")}
          </Link>

          <hr className="my-2 border-gray-100" />

          {/* Help */}
          <p className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {t("sectionHelp")}
          </p>
          {HELP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              <link.icon className="h-4 w-4 text-gray-400" />
              {t(`help.${link.key}`)}
            </Link>
          ))}

          <hr className="my-2 border-gray-100" />

          {/* Auth */}
          {isLoggedIn ? (
            <>
              <Link
                href={dashboardPath}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4 text-gray-400" />
                {t("dashboard")}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger-600 hover:bg-danger-50"
              >
                <LogOut className="h-4 w-4" />
                {t("signOut")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/connexion"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4 text-gray-400" />
                {t("login")}
              </Link>
              <Link href="/auth/inscription" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="mt-1 w-full">
                  {t("createAccount")}
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
