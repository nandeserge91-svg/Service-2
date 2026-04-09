import { vi } from "vitest";

function createMockModel() {
  return {
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  };
}

export const prisma = {
  user: createMockModel(),
  userRoleAssignment: createMockModel(),
  sellerProfile: createMockModel(),
  buyerProfile: createMockModel(),
  service: createMockModel(),
  servicePackage: createMockModel(),
  category: createMockModel(),
  order: createMockModel(),
  review: createMockModel(),
  commissionRule: createMockModel(),
  escrowState: createMockModel(),
  ledgerAccount: createMockModel(),
  ledgerJournal: createMockModel(),
  financialWallet: createMockModel(),
  withdrawalRequest: createMockModel(),
  auditLog: createMockModel(),
  notification: createMockModel(),
  $transaction: vi.fn((fns: unknown[]) => Promise.all(fns)),
  $queryRaw: vi.fn().mockResolvedValue([]),
};
