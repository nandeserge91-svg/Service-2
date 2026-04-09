import { afterEach, describe, expect, it, vi } from "vitest";
import { serverFeatureEnabled } from "./feature-flags";

describe("serverFeatureEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns false when unset", () => {
    expect(serverFeatureEnabled("BETA_DEMO")).toBe(false);
  });

  it("returns true for 1, true, yes (case insensitive)", () => {
    vi.stubEnv("FEATURE_BETA_DEMO", "1");
    expect(serverFeatureEnabled("BETA_DEMO")).toBe(true);
    vi.stubEnv("FEATURE_BETA_DEMO", "TRUE");
    expect(serverFeatureEnabled("BETA_DEMO")).toBe(true);
    vi.stubEnv("FEATURE_BETA_DEMO", "Yes");
    expect(serverFeatureEnabled("BETA_DEMO")).toBe(true);
  });

  it("normalizes flag name to SNAKE_UPPER", () => {
    vi.stubEnv("FEATURE_BETA_SELLER_ANALYTICS", "1");
    expect(serverFeatureEnabled("beta-seller-analytics")).toBe(true);
  });

  it("returns false for empty flag", () => {
    expect(serverFeatureEnabled("")).toBe(false);
    expect(serverFeatureEnabled("   ")).toBe(false);
  });
});
