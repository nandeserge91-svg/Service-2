import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./deferred", () => ({
  deferAfterResponse: (fn: () => void | Promise<void>) => {
    void fn();
  },
}));
vi.mock("./outbox-email", () => ({
  enqueueEmailOutbox: vi.fn().mockResolvedValue(undefined),
  processEmailOutboxBatch: vi.fn().mockResolvedValue({ processed: 0, errors: 0 }),
}));
vi.mock("next/headers", () => ({
  headers: () =>
    Promise.resolve({
      get: (name: string) => (name === "x-forwarded-for" ? "203.0.113.50" : null),
    }),
}));

import { submitContactForm } from "./contact-actions";
import { enqueueEmailOutbox } from "./outbox-email";
import { __resetRateLimitStoreForTests } from "./rate-limit-memory";

function makeForm(data: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  __resetRateLimitStoreForTests();
  vi.clearAllMocks();
  vi.stubEnv("CONTACT_EMAIL", "admin@test.com");
});

describe("submitContactForm", () => {
  const valid = {
    name: "Jean Dupont",
    email: "jean@test.com",
    subject: "Question générale",
    message: "Bonjour, j'ai une question sur vos services. Merci.",
  };

  it("returns error when fields are missing", async () => {
    const result = await submitContactForm(makeForm({ name: "Jean" }));
    expect(result.error).toContain("Veuillez remplir");
  });

  it("returns error when message is too short", async () => {
    const result = await submitContactForm(makeForm({ ...valid, message: "Court" }));
    expect(result.error).toContain("trop court");
  });

  it("returns error when message is too long", async () => {
    const result = await submitContactForm(makeForm({ ...valid, message: "a".repeat(5001) }));
    expect(result.error).toContain("trop long");
  });

  it("succeeds with valid data", async () => {
    const result = await submitContactForm(makeForm(valid));
    expect(result.success).toBe(true);
  });

  it("enqueues contact email when CONTACT_EMAIL is set", async () => {
    await submitContactForm(makeForm(valid));
    expect(enqueueEmailOutbox).toHaveBeenCalledWith(
      "contact",
      expect.objectContaining({
        to: "admin@test.com",
        subject: expect.stringContaining("[Contact]"),
      }),
    );
  });

  it("succeeds even without CONTACT_EMAIL", async () => {
    vi.stubEnv("CONTACT_EMAIL", "");
    vi.stubEnv("EMAIL_FROM", "");
    const result = await submitContactForm(makeForm(valid));
    expect(result.success).toBe(true);
  });

  it("returns error after too many submissions from same IP", async () => {
    for (let i = 0; i < 5; i++) {
      await submitContactForm(makeForm(valid));
    }
    const sixth = await submitContactForm(makeForm(valid));
    expect(sixth.error).toContain("Trop de messages");
  });

  it("escapes HTML in email content", async () => {
    await submitContactForm(makeForm({
      ...valid,
      name: '<script>alert("xss")</script>',
    }));
    const calls = vi.mocked(enqueueEmailOutbox).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const html = (calls[0][1] as { html: string }).html;
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
