import { vi } from "vitest";

export const sendMail = vi.fn().mockResolvedValue(undefined);

export const baseLayout = vi.fn((content: string) => `<html>${content}</html>`);
