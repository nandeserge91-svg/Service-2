import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { APP_NAME, CATEGORIES_ICONS } from "@/lib/constants";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";

const platformLinks = [
  { labelKey: "browseServices" as const, href: "/services" },
  { labelKey: "becomeSeller" as const, href: "/auth/inscription/vendeur" },
  { labelKey: "howItWorks" as const, href: "/#comment-ca-marche" },
  { labelKey: "search" as const, href: "/recherche" },
];

const helpLinks = [
  { labelKey: "guideClient" as const, href: "/aide/guide-client" },
  { labelKey: "guideSeller" as const, href: "/aide/guide-vendeur" },
  { labelKey: "faq" as const, href: "/aide/faq" },
  { labelKey: "status" as const, href: "/statut" },
  { labelKey: "releaseNotes" as const, href: "/aide/versions" },
  { labelKey: "contact" as const, href: "/contact" },
];

const legalLinks = [
  { labelKey: "terms" as const, href: "/conditions" },
  { labelKey: "privacy" as const, href: "/confidentialite" },
  { labelKey: "about" as const, href: "/a-propos" },
];

async function getPopularCategories() {
  if (!hasDatabaseUrl()) return [];
  try {
    const cats = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      take: 9,
      select: { slug: true, nameFr: true },
    });
    return cats;
  } catch {
    return [];
  }
}

export async function Footer() {
  const t = await getTranslations("Footer");
  const categories = await getPopularCategories();

  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* ── Top: brand + columns ── */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
                M
              </span>
              <span className="text-lg font-bold text-white">{APP_NAME}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
              {t("tagline")}
            </p>
            {/* Social */}
            <div className="mt-5 flex gap-3">
              <SocialLink href="#" label="Facebook" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              <SocialLink href="#" label="Twitter" d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              <SocialLink href="#" label="LinkedIn" d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
              <SocialLink href="#" label="Instagram" d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm4.5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm5.5-.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">{t("categories")}</h4>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/recherche?cat=${cat.slug}`}
                      className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      {CATEGORIES_ICONS[cat.slug] && (
                        <span className="text-xs">{CATEGORIES_ICONS[cat.slug]}</span>
                      )}
                      {cat.nameFr}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Plateforme */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">{t("platform")}</h4>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 transition-colors hover:text-white">
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">{t("help")}</h4>
            <ul className="space-y-2">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 transition-colors hover:text-white">
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">{t("legal")}</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 transition-colors hover:text-white">
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="mt-10 rounded-xl bg-gray-800 px-6 py-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <h4 className="text-base font-semibold text-white">{t("ctaTitle")}</h4>
            <p className="mt-1 text-sm text-gray-400">
              {t("ctaSubtitle")}
            </p>
          </div>
          <div className="mt-4 flex gap-3 sm:mt-0">
            <Link
              href="/auth/inscription"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-600 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              {t("ctaRegister")}
            </Link>
            <Link
              href="/auth/inscription/vendeur"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-600 px-5 text-sm font-medium text-gray-300 transition-colors hover:border-gray-400 hover:text-white"
            >
              {t("ctaSeller")}
            </Link>
          </div>
        </div>

        {/* ── Bottom ── */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-800 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {APP_NAME}. {t("copyright")}</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              {t("badgeSecure")}
            </span>
            <span className="text-gray-700">•</span>
            <span className="inline-flex items-center gap-1">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              {t("badgeSupport")}
            </span>
            <span className="text-gray-700">•</span>
            <span>🇨🇮 🇸🇳 🇧🇫 🇲🇱 🇬🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, d }: { href: string; label: string; d: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </a>
  );
}
