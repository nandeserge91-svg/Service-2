import { APP_NAME } from "./constants";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["French"],
    },
  };
}

export function serviceJsonLd(opts: {
  title: string;
  description: string;
  slug: string;
  sellerName: string;
  avgRating: number;
  reviewCount: number;
  minPrice: number;
  currency: string;
  categoryName: string;
}) {
  const url = `${siteUrl}/services/${opts.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.title,
    description: opts.description,
    url,
    provider: {
      "@type": "Person",
      name: opts.sellerName,
    },
    category: opts.categoryName,
    ...(opts.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: opts.avgRating,
        reviewCount: opts.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(opts.minPrice > 0 && {
      offers: {
        "@type": "Offer",
        priceCurrency: opts.currency,
        price: opts.minPrice,
        availability: "https://schema.org/InStock",
      },
    }),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function websiteSearchJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/recherche?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
