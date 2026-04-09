import { describe, expect, it } from "vitest";
import {
  clampAnalyticsDays,
  startDateForLastDays,
  utcDayKey,
  fillDailyCounts,
} from "./analytics";

describe("clampAnalyticsDays", () => {
  it("defaults to 30", () => {
    expect(clampAnalyticsDays(undefined)).toBe(30);
    expect(clampAnalyticsDays("")).toBe(30);
    expect(clampAnalyticsDays("abc")).toBe(30);
  });
  it("accepts 7 and 90", () => {
    expect(clampAnalyticsDays("7")).toBe(7);
    expect(clampAnalyticsDays("90")).toBe(90);
  });
});

describe("startDateForLastDays", () => {
  it("returns midnight UTC window of length days ending today", () => {
    const days = 7;
    const from = startDateForLastDays(days);
    expect(from.getUTCHours()).toBe(0);
    expect(from.getUTCMinutes()).toBe(0);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const diffMs = today.getTime() - from.getTime();
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
    expect(diffDays).toBe(days - 1);
  });
});

describe("utcDayKey", () => {
  it("formats ISO date prefix", () => {
    expect(utcDayKey(new Date("2024-06-15T12:00:00.000Z"))).toBe("2024-06-15");
  });
});

describe("fillDailyCounts", () => {
  it("fills missing days with zero", () => {
    const from = new Date("2024-01-01T00:00:00.000Z");
    const m = new Map<string, number>();
    m.set("2024-01-02", 3);
    const series = fillDailyCounts(from, 7, m);
    expect(series).toHaveLength(7);
    expect(series[0].value).toBe(0);
    expect(series[1].value).toBe(3);
    expect(series[2].value).toBe(0);
  });
});
