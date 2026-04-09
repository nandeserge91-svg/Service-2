import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ── Helpers ──

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Data ──

const categories = [
  {
    slug: "design",
    nameFr: "Design & Graphisme",
    nameEn: "Design & Graphics",
    children: [
      { slug: "logo-identite", nameFr: "Logo & Identité visuelle", nameEn: "Logo & Brand Identity" },
      { slug: "carte-visite", nameFr: "Cartes de visite", nameEn: "Business Cards" },
      { slug: "flyer-affiche", nameFr: "Flyers & Affiches", nameEn: "Flyers & Posters" },
      { slug: "illustration", nameFr: "Illustration", nameEn: "Illustration" },
    ],
  },
  {
    slug: "developpement",
    nameFr: "Développement & Tech",
    nameEn: "Development & Tech",
    children: [
      { slug: "site-vitrine", nameFr: "Site web vitrine", nameEn: "Landing Pages" },
      { slug: "e-commerce", nameFr: "E-commerce", nameEn: "E-commerce" },
      { slug: "application-mobile", nameFr: "Application mobile", nameEn: "Mobile App" },
      { slug: "wordpress", nameFr: "WordPress", nameEn: "WordPress" },
    ],
  },
  {
    slug: "redaction",
    nameFr: "Rédaction & Traduction",
    nameEn: "Writing & Translation",
    children: [
      { slug: "articles-blog", nameFr: "Articles de blog", nameEn: "Blog Articles" },
      { slug: "redaction-seo", nameFr: "Rédaction SEO", nameEn: "SEO Writing" },
      { slug: "traduction", nameFr: "Traduction", nameEn: "Translation" },
      { slug: "correction", nameFr: "Correction & Relecture", nameEn: "Proofreading" },
    ],
  },
  {
    slug: "business",
    nameFr: "Business & Conseil",
    nameEn: "Business & Consulting",
    children: [
      { slug: "business-plan", nameFr: "Business plan", nameEn: "Business Plan" },
      { slug: "comptabilite", nameFr: "Comptabilité", nameEn: "Accounting" },
      { slug: "conseil-strategie", nameFr: "Conseil & Stratégie", nameEn: "Strategy Consulting" },
    ],
  },
  {
    slug: "marketing",
    nameFr: "Marketing Digital",
    nameEn: "Digital Marketing",
    children: [
      { slug: "community-management", nameFr: "Community management", nameEn: "Community Management" },
      { slug: "publicite-en-ligne", nameFr: "Publicité en ligne", nameEn: "Online Advertising" },
      { slug: "email-marketing", nameFr: "Email marketing", nameEn: "Email Marketing" },
    ],
  },
  {
    slug: "audio",
    nameFr: "Audio & Musique",
    nameEn: "Audio & Music",
    children: [
      { slug: "voix-off", nameFr: "Voix off", nameEn: "Voice Over" },
      { slug: "production-musicale", nameFr: "Production musicale", nameEn: "Music Production" },
      { slug: "mixage-mastering", nameFr: "Mixage & Mastering", nameEn: "Mixing & Mastering" },
    ],
  },
  {
    slug: "video",
    nameFr: "Vidéo & Animation",
    nameEn: "Video & Animation",
    children: [
      { slug: "montage-video", nameFr: "Montage vidéo", nameEn: "Video Editing" },
      { slug: "animation-2d-3d", nameFr: "Animation 2D/3D", nameEn: "2D/3D Animation" },
      { slug: "motion-design", nameFr: "Motion design", nameEn: "Motion Design" },
    ],
  },
  {
    slug: "photo",
    nameFr: "Photographie",
    nameEn: "Photography",
    children: [
      { slug: "retouche-photo", nameFr: "Retouche photo", nameEn: "Photo Retouching" },
      { slug: "photo-produit", nameFr: "Photo de produit", nameEn: "Product Photography" },
    ],
  },
  {
    slug: "formation",
    nameFr: "Formation & Coaching",
    nameEn: "Training & Coaching",
    children: [
      { slug: "cours-particulier", nameFr: "Cours particuliers", nameEn: "Private Lessons" },
      { slug: "coaching", nameFr: "Coaching professionnel", nameEn: "Professional Coaching" },
    ],
  },
];

const sellers = [
  { name: "Koffi Dembélé", email: "koffi@demo.com", headline: "Designer graphique senior", bio: "Plus de 8 ans d'expérience en design et branding pour des entreprises africaines.", country: "CI", city: "Abidjan" },
  { name: "Aminata Sylla", email: "aminata@demo.com", headline: "Développeuse web full-stack", bio: "Passionnée par la tech, je crée des sites web modernes et performants.", country: "SN", city: "Dakar" },
  { name: "Moussa Koné", email: "moussa@demo.com", headline: "Rédacteur SEO & content manager", bio: "Spécialiste en création de contenu qui convertit. Articles, blogs, et pages de vente.", country: "ML", city: "Bamako" },
  { name: "Fatou Ndiaye", email: "fatou@demo.com", headline: "Vidéaste et motion designer", bio: "Montage vidéo professionnel, spots publicitaires et animations pour réseaux sociaux.", country: "SN", city: "Thiès" },
  { name: "Ibrahim Touré", email: "ibrahim@demo.com", headline: "Expert marketing digital", bio: "J'aide les entreprises à développer leur présence en ligne et générer des leads.", country: "BF", city: "Ouagadougou" },
  { name: "Awa Diallo", email: "awa@demo.com", headline: "Traductrice FR/EN certifiée", bio: "Traduction professionnelle français-anglais pour documents, sites web et contenus marketing.", country: "GN", city: "Conakry" },
];

const buyers = [
  { name: "Jean Kouassi", email: "jean@demo.com" },
  { name: "Marie Ouédraogo", email: "marie@demo.com" },
  { name: "Paul Mensah", email: "paul@demo.com" },
  { name: "Aïcha Bamba", email: "aicha@demo.com" },
];

const serviceTemplates = [
  { title: "Création de logo professionnel", summary: "Je crée un logo unique et mémorable pour votre entreprise. Livraison avec fichiers source et déclinaisons.", catSlug: "logo-identite", prices: [15_000, 35_000, 75_000], days: [3, 5, 7], seller: 0 },
  { title: "Design de cartes de visite", summary: "Cartes de visite modernes et élégantes, prêtes pour l'impression. Format recto ou recto-verso.", catSlug: "carte-visite", prices: [5_000, 10_000, 20_000], days: [2, 3, 5], seller: 0 },
  { title: "Création de flyer publicitaire", summary: "Flyers A5 ou A4 percutants pour vos événements et promotions. Design professionnel garanti.", catSlug: "flyer-affiche", prices: [8_000, 15_000, 30_000], days: [2, 4, 6], seller: 0 },
  { title: "Site web vitrine responsive", summary: "Développement d'un site web moderne, rapide et responsive. Hébergement et nom de domaine inclus pendant 1 an.", catSlug: "site-vitrine", prices: [50_000, 100_000, 200_000], days: [7, 14, 21], seller: 1 },
  { title: "Boutique e-commerce complète", summary: "Boutique en ligne clé en main avec gestion de produits, paiement en ligne et tableau de bord.", catSlug: "e-commerce", prices: [100_000, 200_000, 400_000], days: [14, 21, 30], seller: 1 },
  { title: "Application mobile sur mesure", summary: "Développement d'application mobile iOS et Android avec design personnalisé et backend.", catSlug: "application-mobile", prices: [200_000, 500_000, 1_000_000], days: [30, 45, 60], seller: 1 },
  { title: "Rédaction d'articles SEO", summary: "Articles de blog optimisés pour le référencement. Recherche de mots-clés incluse.", catSlug: "redaction-seo", prices: [5_000, 10_000, 25_000], days: [2, 3, 5], seller: 2 },
  { title: "Rédaction de contenu web", summary: "Textes pour votre site web : pages d'accueil, présentations, fiches produits. Ton adapté à votre audience.", catSlug: "articles-blog", prices: [8_000, 15_000, 35_000], days: [3, 5, 7], seller: 2 },
  { title: "Montage vidéo professionnel", summary: "Montage de vos vidéos avec transitions, musique, sous-titres et correction colorimétrique.", catSlug: "montage-video", prices: [15_000, 30_000, 60_000], days: [3, 5, 7], seller: 3 },
  { title: "Animation motion design", summary: "Vidéos animées pour vos réseaux sociaux, présentations ou publicités. Style moderne et impactant.", catSlug: "motion-design", prices: [25_000, 50_000, 100_000], days: [5, 7, 14], seller: 3 },
  { title: "Gestion réseaux sociaux", summary: "Community management complet : création de contenu, planification, publication et reporting mensuel.", catSlug: "community-management", prices: [30_000, 60_000, 100_000], days: [30, 30, 30], seller: 4 },
  { title: "Campagne publicitaire Facebook/Instagram", summary: "Création et gestion de campagnes publicitaires ciblées sur Facebook et Instagram.", catSlug: "publicite-en-ligne", prices: [20_000, 50_000, 100_000], days: [7, 14, 30], seller: 4 },
  { title: "Traduction français-anglais", summary: "Traduction professionnelle de documents, sites web, contenus marketing. Relecture incluse.", catSlug: "traduction", prices: [5_000, 15_000, 40_000], days: [2, 5, 10], seller: 5 },
  { title: "Correction et relecture", summary: "Correction orthographique, grammaticale et stylistique de vos documents en français.", catSlug: "correction", prices: [3_000, 8_000, 20_000], days: [1, 3, 5], seller: 5 },
];

const tiers = ["BASIC", "STANDARD", "PREMIUM"];

const reviewComments = [
  "Excellent travail ! Très professionnel et réactif. Je recommande vivement.",
  "Bon travail dans l'ensemble. Quelques petits ajustements nécessaires mais le résultat final est très bien.",
  "Livraison rapide et conforme à mes attentes. Merci !",
  "Très satisfait du résultat. Le vendeur est à l'écoute et prend le temps de bien comprendre le besoin.",
  "Super prestation ! Je reviendrai pour d'autres projets.",
  "Qualité au rendez-vous. Communication fluide tout au long du projet.",
  "Travail soigné et livré en avance. Rien à redire.",
  "Bonne qualité mais le délai a été un peu dépassé. Le résultat compense.",
  "Très bon rapport qualité/prix. Je recommande.",
  "Parfait ! Exactement ce que je cherchais.",
];

const sellerResponses = [
  "Merci beaucoup pour votre confiance ! Ce fut un plaisir de travailler sur ce projet.",
  "Merci pour cet avis ! N'hésitez pas à revenir pour vos futurs projets.",
  "Ravi que le résultat vous plaise ! À bientôt.",
  null,
  null,
];

// ── Main ──

async function main() {
  console.log("🌱 Seeding de la base de données…\n");

  // 1. Categories
  const catMap = new Map<string, string>();

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { nameFr: cat.nameFr, nameEn: cat.nameEn, sortOrder: i },
      create: { slug: cat.slug, nameFr: cat.nameFr, nameEn: cat.nameEn, sortOrder: i },
    });
    catMap.set(cat.slug, parent.id);

    for (let j = 0; j < cat.children.length; j++) {
      const child = cat.children[j];
      const sub = await prisma.category.upsert({
        where: { slug: child.slug },
        update: { nameFr: child.nameFr, nameEn: child.nameEn, parentId: parent.id, sortOrder: j },
        create: { slug: child.slug, nameFr: child.nameFr, nameEn: child.nameEn, parentId: parent.id, sortOrder: j },
      });
      catMap.set(child.slug, sub.id);
    }
  }
  console.log(`  ✅ ${catMap.size} catégories`);

  // 2. Commission rule
  const ruleExists = await prisma.commissionRule.findFirst();
  if (!ruleExists) {
    await prisma.commissionRule.create({ data: { percentBps: 1000 } });
  }
  console.log("  ✅ Règle de commission (10%)");

  // 3. Password hash
  const hash = await bcrypt.hash("Demo1234!", 10);

  // 4. Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: { email: "admin@demo.com", passwordHash: hash, emailVerifiedAt: new Date() },
  });
  const adminRoleExists = await prisma.userRoleAssignment.findFirst({
    where: { userId: adminUser.id, role: "ADMIN" },
  });
  if (!adminRoleExists) {
    await prisma.userRoleAssignment.create({ data: { userId: adminUser.id, role: "ADMIN" } });
  }
  console.log("  ✅ Admin (admin@demo.com / Demo1234!)");

  // 5. Seller users
  const sellerUsers: { id: string; profileId: string }[] = [];
  for (const s of sellers) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { email: s.email, passwordHash: hash, emailVerifiedAt: new Date() },
    });

    const roleExists = await prisma.userRoleAssignment.findFirst({
      where: { userId: user.id, role: "SELLER" },
    });
    if (!roleExists) {
      await prisma.userRoleAssignment.createMany({
        data: [
          { userId: user.id, role: "SELLER" },
          { userId: user.id, role: "CLIENT" },
        ],
        skipDuplicates: true,
      });
    }

    let profile = await prisma.sellerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      profile = await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          displayName: s.name,
          headline: s.headline,
          bio: s.bio,
          countryCode: s.country,
          city: s.city,
          verifiedBadge: true,
          languages: ["fr"],
          responseTimeHours: randInt(1, 12),
        },
      });
    }

    // Wallet
    const walletExists = await prisma.financialWallet.findFirst({
      where: { sellerProfileId: profile.id },
    });
    if (!walletExists) {
      await prisma.financialWallet.create({
        data: {
          sellerProfileId: profile.id,
          availableMinor: BigInt(randInt(50_000, 500_000)),
          pendingMinor: BigInt(randInt(0, 100_000)),
          currency: "XOF",
        },
      });
    }

    sellerUsers.push({ id: user.id, profileId: profile.id });
  }
  console.log(`  ✅ ${sellerUsers.length} vendeurs`);

  // 6. Buyer users
  const buyerUsers: { id: string }[] = [];
  for (const b of buyers) {
    const user = await prisma.user.upsert({
      where: { email: b.email },
      update: {},
      create: { email: b.email, passwordHash: hash, emailVerifiedAt: new Date() },
    });

    const roleExists = await prisma.userRoleAssignment.findFirst({
      where: { userId: user.id, role: "CLIENT" },
    });
    if (!roleExists) {
      await prisma.userRoleAssignment.create({ data: { userId: user.id, role: "CLIENT" } });
    }

    let profile = await prisma.buyerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      await prisma.buyerProfile.create({
        data: { userId: user.id, displayName: b.name, countryCode: pick(["CI", "SN", "BF", "ML"]) },
      });
    }

    buyerUsers.push({ id: user.id });
  }
  console.log(`  ✅ ${buyerUsers.length} acheteurs`);

  // 7. Services
  const serviceIds: { id: string; sellerIdx: number; serviceId: string }[] = [];

  for (const tpl of serviceTemplates) {
    const seller = sellerUsers[tpl.seller];
    const catId = catMap.get(tpl.catSlug);
    if (!catId) continue;

    const slug = tpl.title
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const exists = await prisma.service.findFirst({
      where: { sellerProfileId: seller.profileId, slug },
    });
    if (exists) {
      serviceIds.push({ id: exists.id, sellerIdx: tpl.seller, serviceId: exists.id });
      continue;
    }

    const service = await prisma.service.create({
      data: {
        sellerProfileId: seller.profileId,
        categoryId: catId,
        slug,
        title: tpl.title,
        summary: tpl.summary,
        status: "PUBLISHED",
        packages: {
          create: tiers.map((tier, i) => ({
            tier,
            title: tier === "BASIC" ? "Essentiel" : tier === "STANDARD" ? "Standard" : "Premium",
            description: tier === "BASIC"
              ? "L'offre de base, idéale pour démarrer."
              : tier === "STANDARD"
                ? "L'offre recommandée, meilleur rapport qualité/prix."
                : "L'offre complète, pour un résultat optimal.",
            priceMinor: BigInt(tpl.prices[i]),
            currency: "XOF",
            deliveryDays: tpl.days[i],
            revisions: i + 1,
            sortOrder: i,
          })),
        },
        faqItems: {
          create: [
            { question: "Combien de révisions sont incluses ?", answer: "Le nombre de révisions dépend du forfait choisi. Voir les détails de chaque formule.", sortOrder: 0 },
            { question: "Pouvez-vous travailler sur un projet urgent ?", answer: "Oui, contactez-moi pour discuter des délais possibles et des éventuels frais de priorité.", sortOrder: 1 },
          ],
        },
      },
    });

    serviceIds.push({ id: service.id, sellerIdx: tpl.seller, serviceId: service.id });
  }
  console.log(`  ✅ ${serviceIds.length} services`);

  // 8. Orders + Reviews
  let orderCount = 0;
  let reviewCount = 0;

  for (const svc of serviceIds) {
    const seller = sellerUsers[svc.sellerIdx];
    const pkg = await prisma.servicePackage.findFirst({
      where: { serviceId: svc.id },
      orderBy: { sortOrder: "asc" },
    });
    if (!pkg) continue;

    const numOrders = randInt(2, 5);
    for (let o = 0; o < numOrders; o++) {
      const buyer = pick(buyerUsers);
      const fee = Number(pkg.priceMinor) / 10;
      const daysAgo = randInt(5, 90);

      const order = await prisma.order.create({
        data: {
          buyerUserId: buyer.id,
          sellerUserId: seller.id,
          serviceId: svc.id,
          servicePackageId: pkg.id,
          status: "COMPLETED",
          currency: "XOF",
          subtotalMinor: pkg.priceMinor,
          platformFeeMinor: BigInt(Math.round(fee)),
          totalMinor: pkg.priceMinor,
          completedAt: new Date(Date.now() - daysAgo * 86_400_000),
          createdAt: new Date(Date.now() - (daysAgo + pkg.deliveryDays) * 86_400_000),
          events: {
            create: [
              { status: "PENDING_PAYMENT", createdAt: new Date(Date.now() - (daysAgo + pkg.deliveryDays) * 86_400_000) },
              { status: "PAID", createdAt: new Date(Date.now() - (daysAgo + pkg.deliveryDays - 1) * 86_400_000) },
              { status: "IN_PROGRESS", createdAt: new Date(Date.now() - (daysAgo + pkg.deliveryDays - 1) * 86_400_000) },
              { status: "DELIVERED", createdAt: new Date(Date.now() - (daysAgo + 1) * 86_400_000) },
              { status: "COMPLETED", createdAt: new Date(Date.now() - daysAgo * 86_400_000) },
            ],
          },
        },
      });
      orderCount++;

      // Review (80% chance)
      if (Math.random() < 0.8) {
        const rating = pick([4, 4, 4, 5, 5, 5, 5, 3, 5, 4]);
        const resp = pick(sellerResponses);
        await prisma.review.create({
          data: {
            orderId: order.id,
            rating,
            comment: pick(reviewComments),
            createdAt: new Date(Date.now() - (daysAgo - 1) * 86_400_000),
            ...(resp ? { sellerResponse: resp, sellerRespondedAt: new Date(Date.now() - (daysAgo - 2) * 86_400_000) } : {}),
          },
        });
        reviewCount++;
      }
    }
  }
  console.log(`  ✅ ${orderCount} commandes + ${reviewCount} avis`);

  // 9. A few active orders (IN_PROGRESS)
  const activeSvc = serviceIds.slice(0, 4);
  for (const svc of activeSvc) {
    const seller = sellerUsers[svc.sellerIdx];
    const pkg = await prisma.servicePackage.findFirst({ where: { serviceId: svc.id }, orderBy: { sortOrder: "asc" } });
    if (!pkg) continue;
    const buyer = pick(buyerUsers);
    const fee = Number(pkg.priceMinor) / 10;

    await prisma.order.create({
      data: {
        buyerUserId: buyer.id,
        sellerUserId: seller.id,
        serviceId: svc.id,
        servicePackageId: pkg.id,
        status: "IN_PROGRESS",
        currency: "XOF",
        subtotalMinor: pkg.priceMinor,
        platformFeeMinor: BigInt(Math.round(fee)),
        totalMinor: pkg.priceMinor,
        deliveryDueAt: new Date(Date.now() + pkg.deliveryDays * 86_400_000),
        events: {
          create: [
            { status: "PENDING_PAYMENT", createdAt: new Date(Date.now() - 3 * 86_400_000) },
            { status: "PAID", createdAt: new Date(Date.now() - 2 * 86_400_000) },
            { status: "IN_PROGRESS", createdAt: new Date(Date.now() - 2 * 86_400_000) },
          ],
        },
      },
    });
  }
  console.log(`  ✅ ${activeSvc.length} commandes actives`);

  // 10. Sync denormalized search fields
  console.log("\n  🔄 Synchronisation des champs de recherche…");
  const allServices = await prisma.service.findMany({ select: { id: true } });
  for (const s of allServices) {
    const [pkgAgg, reviewAgg] = await Promise.all([
      prisma.servicePackage.aggregate({
        where: { serviceId: s.id },
        _min: { priceMinor: true, deliveryDays: true },
      }),
      prisma.review.aggregate({
        where: { order: { serviceId: s.id } },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);
    await prisma.service.update({
      where: { id: s.id },
      data: {
        minPriceMinor: pkgAgg._min.priceMinor,
        minDeliveryDays: pkgAgg._min.deliveryDays,
        avgRating: Math.round((reviewAgg._avg.rating ?? 0) * 10) / 10,
        reviewCount: reviewAgg._count.rating,
      },
    });
  }
  console.log(`  ✅ ${allServices.length} services synchronisés`);

  console.log("\n🌱 Seed terminé avec succès !");
  console.log("\n📋 Comptes de démonstration :");
  console.log("   Admin   : admin@demo.com / Demo1234!");
  console.log("   Vendeur : koffi@demo.com / Demo1234!");
  console.log("   Client  : jean@demo.com  / Demo1234!");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
