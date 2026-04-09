import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, __resetRateLimitStoreForTests } from "./rate-limit-memory";

beforeEach(() => {
  __resetRateLimitStoreForTests();
});

describe("rateLimit", () => {
  it("allows requests under the cap", () => {
    expect(rateLimit("k1", 3, 60_000)).toBe(true);
    expect(rateLimit("k1", 3, 60_000)).toBe(true);
    expect(rateLimit("k1", 3, 60_000)).toBe(true);
  });

  it("blocks when cap exceeded", () => {
    expect(rateLimit("k2", 2, 60_000)).toBe(true);
    expect(rateLimit("k2", 2, 60_000)).toBe(true);
    expect(rateLimit("k2", 2, 60_000)).toBe(false);
  });

  it("uses separate keys", () => {
    expect(rateLimit("a", 1, 60_000)).toBe(true);
    expect(rateLimit("a", 1, 60_000)).toBe(false);
    expect(rateLimit("b", 1, 60_000)).toBe(true);
  });
});
