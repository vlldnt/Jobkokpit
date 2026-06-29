import "server-only";

import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

/** Convert arbitrary values (incl. Date) into JSON-safe data for storage. */
function toJsonSafe(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export type AuditParams = {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
};

/**
 * Append-only audit trail. Best-effort: a logging failure must never break the
 * underlying mutation, so errors are swallowed.
 */
export async function recordAudit(params: AuditParams): Promise<void> {
  try {
    const h = await headers();
    await db.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        before: toJsonSafe(params.before),
        after: toJsonSafe(params.after),
        ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        userAgent: h.get("user-agent") ?? null,
      },
    });
  } catch {
    // Intentionally ignored — auditing is non-critical to the mutation.
  }
}
