import { prisma } from "./prisma";
import type { AuditAction } from "@prisma/client";

/**
 * Append an entry to the audit log. Fire-and-forget.
 */
export async function log(opts: {
  actorId?: string | null;
  action: AuditAction;
  entity: string;
  entityId: string;
  payload?: Record<string, string | number | boolean | null>;
  ip?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: opts.actorId ?? null,
        action: opts.action,
        entity: opts.entity,
        entityId: opts.entityId,
        payload: opts.payload ?? undefined,
        ip: opts.ip,
      },
    });
  } catch (err) {
    console.error("[audit:error]", err);
  }
}
