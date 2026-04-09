import { describe, it, expect } from "vitest";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  CATEGORIES_ICONS,
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
} from "./constants";

describe("ORDER_STATUS_LABELS", () => {
  const expectedStatuses = [
    "PENDING_PAYMENT",
    "PAID",
    "IN_PROGRESS",
    "DELIVERED",
    "REVISION_REQUESTED",
    "COMPLETED",
    "CANCELLED",
    "DISPUTED",
  ];

  it("has a label for every order status", () => {
    for (const status of expectedStatuses) {
      expect(ORDER_STATUS_LABELS[status]).toBeDefined();
      expect(typeof ORDER_STATUS_LABELS[status]).toBe("string");
      expect(ORDER_STATUS_LABELS[status].length).toBeGreaterThan(0);
    }
  });
});

describe("ORDER_STATUS_COLORS", () => {
  it("has bg, text, dot for every status", () => {
    for (const key of Object.keys(ORDER_STATUS_LABELS)) {
      const colors = ORDER_STATUS_COLORS[key];
      expect(colors).toBeDefined();
      expect(colors.bg).toMatch(/^bg-/);
      expect(colors.text).toMatch(/^text-/);
      expect(colors.dot).toMatch(/^bg-/);
    }
  });
});

describe("CATEGORIES_ICONS", () => {
  it("has at least 5 category icons", () => {
    expect(Object.keys(CATEGORIES_ICONS).length).toBeGreaterThanOrEqual(5);
  });

  it("each icon is a non-empty string", () => {
    for (const icon of Object.values(CATEGORIES_ICONS)) {
      expect(icon.length).toBeGreaterThan(0);
    }
  });
});

describe("defaults", () => {
  it("DEFAULT_CURRENCY is XOF", () => {
    expect(DEFAULT_CURRENCY).toBe("XOF");
  });

  it("DEFAULT_LOCALE is fr", () => {
    expect(DEFAULT_LOCALE).toBe("fr");
  });
});
