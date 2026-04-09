import Link from "next/link";
import {
  Search,
  ShieldCheck,
  BadgeCheck,
  Truck,
  MessageCircle,
  ArrowRight,
  Star,
  Users,
  ShoppingBag,
  Globe,
  Clock,
  CheckCircle,
  Zap,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { CATEGORIES_ICONS, APP_NAME } from "@/lib/constants";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { organizationJsonLd, websiteSearchJsonLd } from "@/lib/jsonld";

export const dynamic = "force-dynamic";

async function loadHomePageData() {
  const empty = {
    categories: [] as Awaited<
      ReturnType<
        typeof prisma.category.findMany<{
          where: { parentId: null };
          orderBy: { sortOrder: "asc" };
          include: { _count: { select: { services: true } } };
        }>
      >
    >,
    popularServices: [] as Awaited<
      ReturnType<
        typeof prisma.service.findMany<{
          where: { status: "PUBLISHED" };
          orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }, { createdAt: "desc" }];
          take: 8;
          select: {
            id: true;
            slug: true;
            title: true;
            avgRating: true;
            reviewCount: true;
            minPriceMinor: true;
            minDeliveryDays: true;
            sellerProfile: {
              select: {
                displayName: true;
                verifiedBadge: true;
                user: { select: { image: true } };
              };
            };
            category: { select: { nameFr: true } };
            packages: { orderBy: { priceMinor: "asc" }; take: 1; select: { currency: true } };
          };
        }>
      >
    >,
    topSellers: [] as Awaited<
      ReturnType<
        typeof prisma.sellerProfile.findMany<{
          where: {
            user: { locale: { not: "suspended" } };
            services: { some: { status: "PUBLISHED" } };
          };
          orderBy: { createdAt: "asc" };
          take: 6;
          select: {
            id: true;
            displayName: true;
            headline: true;
            verifiedBadge: true;
            countryCode: true;
            user: { select: { image: true } };
            services: {
              where: { status: "PUBLISHED" };
              select: { avgRating: true; reviewCount: true };
            };
            _count: { select: { services: true } };
          };
        }>
      >
    >,
    stats: { users: 0, services: 0, orders: 0 },
  };

  if (!hasDatabaseUrl()) return empty;

  try {
    const [categories, popularServices, topSellers, stats] = await Promise.all([
      prisma.category.findMany({
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { services: true } } },
      }),
      prisma.service.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }, { createdAt: "desc" }],
        take: 8,
        select: {
          id: true,
          slug: true,
          title: true,
          avgRating: true,
          reviewCount: true,
          minPriceMinor: true,
          minDeliveryDays: true,
          sellerProfile: {
            select: {
              displayName: true,
              verifiedBadge: true,
              user: { select: { image: true } },
            },
          },
          category: { select: { nameFr: true } },
          packages: { orderBy: { priceMinor: "asc" }, take: 1, select: { currency: true } },
        },
      }),
      prisma.sellerProfile.findMany({
        where: { user: { locale: { not: "suspended" } }, services: { some: { status: "PUBLISHED" } } },
        orderBy: { createdAt: "asc" },
        take: 6,
        select: {
          id: true,
          displayName: true,
          headline: true,
          verifiedBadge: true,
          countryCode: true,
          user: { select: { image: true } },
          services: {
            where: { status: "PUBLISHED" },
            select: { avgRating: true, reviewCount: true },
          },
          _count: { select: { services: true } },
        },
      }),
      Promise.all([
        prisma.user.count(),
        prisma.service.count({ where: { status: "PUBLISHED" } }),
        prisma.order.count({ where: { status: "COMPLETED" } }),
      ]).then(([users, services, orders]) => ({ users, services, orders })),
    ]);
    return { categories, popularServices, topSellers, stats };
  } catch {
    return empty;
  }
}

export default async function HomePage() {
  const { categories, popularServices, topSellers, stats } = await loadHomePageData();

  const sellersWithRating = topSellers.map((s) => {
    const allReviews = s.services.reduce((acc, svc) => acc + svc.reviewCount, 0);
    const weightedSum = s.services.reduce((acc, svc) => acc + svc.avgRating * svc.reviewCount, 0);
    const avg = allReviews > 0 ? weightedSum / allReviews : 0;
    return { ...s, avgRating: Math.round(avg * 10) / 10, totalReviews: allReviews };
  }).sort((a, b) => b.totalReviews - a.totalReviews);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSearchJsonLd()) }}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-4 py-16 text-center sm:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-60" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5" />
            La marketplace de services n°1 en Afrique
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Le talent africain,{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              à portée de clic
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-primary-100 sm:text-lg">
            Trouvez des professionnels qualifiés pour tous vos projets.
            Paiement sécurisé, livraison garantie, support réactif.
          </p>

          <form
            action="/recherche"
            className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl shadow-primary-900/30"
          >
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                name="q"
                placeholder="Ex : logo, site web, traduction…"
                className="h-14 w-full pl-12 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <Button type="submit" variant="primary" className="m-1.5 rounded-xl px-6 text-sm">
              Rechercher
            </Button>
          </form>

          <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-primary-200">
            <span>Populaire :</span>
            {["Design graphique", "Développement web", "Rédaction SEO", "Marketing digital"].map(
              (tag) => (
                <Link
                  key={tag}
                  href={`/recherche?q=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-white/20 px-3 py-1 text-white/80 transition-colors hover:bg-white/10"
                >
                  {tag}
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── Stats banner ── */}
      <section className="border-b border-gray-100 bg-white px-4 py-5">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {[
            { icon: Users, value: stats.users, label: "Utilisateurs" },
            { icon: ShoppingBag, value: stats.services, label: "Services" },
            { icon: CheckCircle, value: stats.orders, label: "Commandes réalisées" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2.5">
              <s.icon className="h-5 w-5 text-primary-500" />
              <span className="text-lg font-bold text-gray-900">
                {s.value.toLocaleString("fr-FR")}
              </span>
              <span className="text-sm text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Catégories ── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Explorez nos catégories
          </h2>
          <p className="mt-2 text-gray-500">
            Des dizaines de métiers, un seul endroit.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/recherche?cat=${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-center transition-all hover:border-primary-200 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-2xl transition-transform group-hover:scale-110">
                {CATEGORIES_ICONS[cat.slug] ?? "📁"}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{cat.nameFr}</p>
                <p className="text-xs text-gray-400">
                  {cat._count.services} service{cat._count.services > 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Services populaires ── */}
      <section className="bg-gray-50 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Services populaires
              </h2>
              <p className="mt-1 text-gray-500">Les mieux notés par la communauté</p>
            </div>
            <Link
              href="/recherche?sort=rating"
              className="hidden items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 sm:flex"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {popularServices.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">
              Aucun service publié pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {popularServices.map((s) => {
                const currency = s.packages[0]?.currency ?? "XOF";
                return (
                  <Link key={s.id} href={`/services/${s.slug}`}>
                    <Card hover padding="none" className="flex h-full flex-col overflow-hidden">
                      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary-50 via-gray-50 to-gray-100">
                        <span className="text-4xl text-gray-200">🖼️</span>
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-4">
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={s.sellerProfile.displayName}
                            src={s.sellerProfile.user.image}
                            size="sm"
                            verified={s.sellerProfile.verifiedBadge}
                          />
                          <span className="truncate text-sm font-medium text-gray-700">
                            {s.sellerProfile.displayName}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-900">
                          {s.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {s.reviewCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
                              <span className="font-medium text-gray-700">
                                {s.avgRating.toFixed(1)}
                              </span>
                              ({s.reviewCount})
                            </span>
                          )}
                          {s.minDeliveryDays != null && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {s.minDeliveryDays}j
                            </span>
                          )}
                        </div>
                        <div className="mt-auto border-t border-gray-50 pt-2">
                          {s.minPriceMinor != null && (
                            <p className="text-sm text-gray-500">
                              À partir de{" "}
                              <span className="font-semibold text-gray-900">
                                {formatPrice(s.minPriceMinor, currency)}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/recherche?sort=rating"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600"
            >
              Voir tous les services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section id="comment-ca-marche" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Comment ça marche ?
          </h2>
          <p className="mt-2 text-gray-500">Quatre étapes simples pour votre projet</p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              num: "1",
              icon: Search,
              title: "Cherchez",
              desc: "Trouvez le service adapté à votre besoin parmi des centaines de prestataires.",
            },
            {
              num: "2",
              icon: MessageCircle,
              title: "Contactez",
              desc: "Échangez directement avec le vendeur pour préciser votre projet.",
            },
            {
              num: "3",
              icon: ShieldCheck,
              title: "Payez",
              desc: "Payez en toute sécurité. Votre argent est protégé jusqu'à la livraison.",
            },
            {
              num: "4",
              icon: Heart,
              title: "Recevez",
              desc: "Validez la livraison quand vous êtes satisfait et laissez un avis.",
            },
          ].map((step) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/20">
                <step.icon className="h-6 w-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 lg:right-auto lg:-top-2 lg:left-1/2 lg:ml-6">
                {step.num}
              </span>
              <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Vendeurs vedettes ── */}
      {sellersWithRating.length > 0 && (
        <section className="border-y border-gray-100 bg-white px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Nos meilleurs prestataires
              </h2>
              <p className="mt-2 text-gray-500">
                Des professionnels vérifiés, prêts à vous accompagner
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {sellersWithRating.map((seller) => (
                <div
                  key={seller.id}
                  className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-5 text-center transition-shadow hover:shadow-md"
                >
                  <Avatar
                    name={seller.displayName}
                    src={seller.user.image}
                    size="lg"
                    verified={seller.verifiedBadge}
                  />
                  <p className="mt-3 truncate text-sm font-semibold text-gray-900">
                    {seller.displayName}
                  </p>
                  {seller.headline && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                      {seller.headline}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    {seller.totalReviews > 0 ? (
                      <>
                        <Star className="h-3.5 w-3.5 fill-warning-400 text-warning-400" />
                        <span className="font-medium text-gray-700">
                          {seller.avgRating.toFixed(1)}
                        </span>
                        <span className="text-gray-400">({seller.totalReviews})</span>
                      </>
                    ) : (
                      <span className="text-gray-400">Nouveau</span>
                    )}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                    <Globe className="h-3 w-3" />
                    {seller.countryCode}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Confiance & sécurité ── */}
      <section className="bg-gray-50 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Pourquoi nous choisir ?
            </h2>
            <p className="mt-2 text-gray-500">
              Une plateforme conçue pour inspirer confiance
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "Paiement sécurisé",
                desc: "Votre argent est conservé en séquestre et libéré uniquement à la livraison.",
                color: "bg-primary-50 text-primary-600",
              },
              {
                icon: BadgeCheck,
                title: "Vendeurs vérifiés",
                desc: "Profils contrôlés, avis authentiques et badges de confiance.",
                color: "bg-success-50 text-success-600",
              },
              {
                icon: Truck,
                title: "Livraison suivie",
                desc: "Chaque étape de votre commande est visible en temps réel.",
                color: "bg-warning-50 text-warning-600",
              },
              {
                icon: MessageCircle,
                title: "Support réactif",
                desc: "Une équipe disponible pour résoudre tout problème rapidement.",
                color: "bg-indigo-50 text-indigo-600",
              },
            ].map((tp) => (
              <Card key={tp.title} className="text-center">
                <div
                  className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${tp.color}`}
                >
                  <tp.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900">{tp.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{tp.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Double CTA ── */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
          {/* CTA Client */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white sm:p-10">
            <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/5" />
            <div className="relative">
              <h3 className="text-xl font-bold sm:text-2xl">
                Vous avez un projet ?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-300">
                Parcourez des centaines de services et trouvez le prestataire
                idéal en quelques clics. Inscription gratuite.
              </p>
              <Link href="/auth/inscription" className="mt-6 inline-block">
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100"
                >
                  Trouver un prestataire
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* CTA Vendeur */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white sm:p-10">
            <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/5" />
            <div className="relative">
              <h3 className="text-xl font-bold sm:text-2xl">
                Vous proposez des services ?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-primary-100">
                Rejoignez la plateforme, créez votre profil et commencez à
                recevoir des commandes dès aujourd&apos;hui.
              </p>
              <Link href="/auth/inscription/vendeur" className="mt-6 inline-block">
                <Button
                  size="lg"
                  className="bg-white text-primary-700 hover:bg-primary-50"
                >
                  Devenir vendeur
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
