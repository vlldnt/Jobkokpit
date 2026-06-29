import "server-only";

import { db } from "@/lib/db";

export async function listAuditLogs(
  userId: string,
  { skip, take }: { skip: number; take: number },
) {
  const where = { userId };
  const [items, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        ip: true,
        createdAt: true,
      },
    }),
    db.auditLog.count({ where }),
  ]);
  return { items, total };
}
