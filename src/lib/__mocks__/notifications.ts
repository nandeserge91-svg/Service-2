import { vi } from "vitest";

export const onReviewReceived = vi.fn().mockResolvedValue(undefined);
export const onOrderStatusChanged = vi.fn().mockResolvedValue(undefined);
export const onNewMessage = vi.fn().mockResolvedValue(undefined);
