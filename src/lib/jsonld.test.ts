import { describe, it, expect } from "vitest";
import {
  organizationJsonLd,
  serviceJsonLd,
  breadcrumbJsonLd,
  websiteSearchJsonLd,
} from "./jsonld";

describe("organizationJsonLd", () => {
  it("returns Organization schema", () => {
    const ld = organizationJsonLd();
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Organization");
    expect(typeof ld.url).toBe("string");
    expect(ld.logo).toMatch(/\/logo\.png$/);
    expect(ld.contactPoint.contactType).toBe("customer service");
    expect(ld.contactPoint.availableLanguage).toContain("French");
  });
});

describe("serviceJsonLd", () => {
  const base = {
    title: "Logo pro",
    description: "Création de logo",
    slug: "logo-pro",
    sellerName: "Koffi",
    avgRating: 4.5,
    reviewCount: 10,
    minPrice: 15000,
    currency: "XOF",
    categoryName: "Design",
  };

  it("returns Service schema with aggregateRating and offers", () => {
    const ld = serviceJsonLd(base);
    expect(ld["@type"]).toBe("Service");
    expect(ld.name).toBe("Logo pro");
    expect(ld.url).toMatch(/\/services\/logo-pro$/);
    expect(ld.provider.name).toBe("Koffi");
    expect(ld.category).toBe("Design");
    expect(ld.aggregateRating).toBeDefined();
    expect(ld.aggregateRating!.ratingValue).toBe(4.5);
    expect(ld.aggregateRating!.reviewCount).toBe(10);
    expect(ld.aggregateRating!.bestRating).toBe(5);
    expect(ld.offers).toBeDefined();
    expect(ld.offers!.price).toBe(15000);
    expect(ld.offers!.priceCurrency).toBe("XOF");
  });

  it("omits aggregateRating when reviewCount is 0", () => {
    const ld = serviceJsonLd({ ...base, reviewCount: 0 });
    expect(ld.aggregateRating).toBeUndefined();
  });

  it("omits offers when minPrice is 0", () => {
    const ld = serviceJsonLd({ ...base, minPrice: 0 });
    expect(ld.offers).toBeUndefined();
  });

  it("handles negative or missing values gracefully", () => {
    const ld = serviceJsonLd({ ...base, reviewCount: 0, minPrice: 0 });
    expect(ld.aggregateRating).toBeUndefined();
    expect(ld.offers).toBeUndefined();
    expect(ld.name).toBe("Logo pro");
  });
});

describe("breadcrumbJsonLd", () => {
  it("returns BreadcrumbList with correct positions", () => {
    const ld = breadcrumbJsonLd([
      { name: "Accueil", url: "https://example.com" },
      { name: "Design", url: "https://example.com/recherche?cat=design" },
      { name: "Logo", url: "https://example.com/services/logo" },
    ]);
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement).toHaveLength(3);
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement[1].position).toBe(2);
    expect(ld.itemListElement[2].position).toBe(3);
    expect(ld.itemListElement[1].name).toBe("Design");
  });

  it("handles single item", () => {
    const ld = breadcrumbJsonLd([{ name: "Home", url: "/" }]);
    expect(ld.itemListElement).toHaveLength(1);
    expect(ld.itemListElement[0]["@type"]).toBe("ListItem");
  });

  it("handles empty list", () => {
    const ld = breadcrumbJsonLd([]);
    expect(ld.itemListElement).toHaveLength(0);
  });
});

describe("websiteSearchJsonLd", () => {
  it("returns WebSite schema with SearchAction", () => {
    const ld = websiteSearchJsonLd();
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("WebSite");
    expect(ld.potentialAction["@type"]).toBe("SearchAction");
    expect(ld.potentialAction.target.urlTemplate).toContain("/recherche?q=");
    expect(ld.potentialAction["query-input"]).toContain("search_term_string");
  });
});
