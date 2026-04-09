import { beforeEach, describe, expect, it, vi } from "vitest";

describe("deferAfterResponse", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("exécute la tâche quand after appelle le callback", async () => {
    vi.doMock("next/server", () => ({
      after: (cb: () => void) => {
        cb();
      },
    }));
    const { deferAfterResponse } = await import("./deferred");
    let ran = false;
    deferAfterResponse(() => {
      ran = true;
    });
    await Promise.resolve();
    expect(ran).toBe(true);
  });

  it("repli microtask si after lève synchronement", async () => {
    vi.doMock("next/server", () => ({
      after: () => {
        throw new Error("no request scope");
      },
    }));
    const { deferAfterResponse } = await import("./deferred");
    let ran = false;
    deferAfterResponse(() => {
      ran = true;
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(ran).toBe(true);
  });
});
