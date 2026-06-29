import "server-only";

import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";

export async function updateProfile(name: string) {
  const user = await requireUser();
  await db.user.update({
    where: { id: user.id },
    data: { name: name || null },
  });
  await recordAudit({
    userId: user.id,
    action: "profile.update",
    entityType: "User",
    entityId: user.id,
  });
}
