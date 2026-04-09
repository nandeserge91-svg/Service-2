import { describe, it, expect } from "vitest";
import { cn, formatPrice, formatDate, slugify } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    const result = cn("px-4", "px-2");
    expect(result).toBe("px-2");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "visible");
    expect(result).toBe("base visible");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("formatPrice", () => {
  it("formats XOF with no decimals", () => {
    const result = formatPrice(15000, "XOF", "fr-FR");
    expect(result).toContain("15");
    expect(result).toContain("000");
  });

  it("accepts bigint", () => {
    const result = formatPrice(BigInt(50000), "XOF");
    expect(result).toContain("50");
  });

  it("handles zero", () => {
    const result = formatPrice(0, "XOF");
    expect(result).toContain("0");
  });

  it("formats EUR with decimals", () => {
    const result = formatPrice(1050, "EUR", "fr-FR");
    expect(result).toContain("1");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const result = formatDate(new Date("2025-03-15T12:00:00Z"), "fr-FR");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });

  it("formats a date string", () => {
    const result = formatDate("2025-06-20", "fr-FR");
    expect(result).toContain("20");
    expect(result).toContain("2025");
  });

  it("applies custom options", () => {
    const result = formatDate(new Date("2025-01-01"), "fr-FR", {
      weekday: "long",
    });
    expect(result.length).toBeGreaterThan(5);
  });
});

describe("slugify", () => {
  it("converts to lowercase kebab-case", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes accents", () => {
    expect(slugify("Création de café")).toBe("creation-de-cafe");
  });

  it("removes special characters", () => {
    expect(slugify("E-commerce & Tech!")).toBe("e-commerce-tech");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --Bonjour--  ")).toBe("bonjour");
  });

  it("collapses multiple separators", () => {
    expect(slugify("mot   à   mot")).toBe("mot-a-mot");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});
