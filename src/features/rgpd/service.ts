import "server-only";

import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/dal";
import { decrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

const safeDecrypt = (body: string | null): string | null => {
  if (!body) return null;
  try {
    return decrypt(body);
  } catch (error) {
    logger.warn({ err: error }, "rgpd export decrypt failed");
    return "[illisible]";
  }
};

/**
 * RGPD — full export of the user's personal data (right to portability).
 * Email bodies are decrypted for human readability.
 */
export async function exportUserData() {
  const user = await requireUser();
  const userId = user.id;
  const active = { userId, deletedAt: null };

  const [
    companies,
    offers,
    applications,
    recruiters,
    documents,
    threads,
    interviewPreps,
    notifications,
    auditLogs,
  ] = await Promise.all([
    db.company.findMany({ where: active }),
    db.jobOffer.findMany({ where: active, include: { analysis: true } }),
    db.application.findMany({ where: active, include: { events: true } }),
    db.recruiter.findMany({ where: active }),
    db.document.findMany({ where: active }),
    db.emailThread.findMany({ where: { userId }, include: { messages: true } }),
    db.interviewPrep.findMany({ where: { userId } }),
    db.notification.findMany({ where: { userId } }),
    db.auditLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  await recordAudit({
    userId,
    action: "rgpd.export",
    entityType: "User",
    entityId: userId,
  });
  await db.dataProcessingRecord.create({
    data: {
      userId,
      purpose: "Export RGPD des données personnelles",
      legalBasis: "Droit à la portabilité (art. 20 RGPD)",
      dataCategories: ["identité", "candidatures", "offres", "communications"],
    },
  });

  return {
    exportedAt: new Date().toISOString(),
    profile: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    companies,
    offers,
    applications,
    recruiters,
    documents,
    emailThreads: threads.map((t) => ({
      ...t,
      messages: t.messages.map((m) => ({ ...m, body: safeDecrypt(m.body) })),
    })),
    interviewPreps,
    notifications,
    auditLogs,
  };
}

/**
 * RGPD — right to erasure. Deletes all content owned by the user (cascades
 * handle dependent rows). The account itself and active session are preserved
 * so the single owner stays logged in; credentials can be changed separately.
 */
export async function eraseUserData() {
  const user = await requireUser();
  const userId = user.id;

  await db.$transaction([
    db.notification.deleteMany({ where: { userId } }),
    db.agentRun.deleteMany({ where: { userId } }),
    db.document.deleteMany({ where: { userId } }),
    db.interviewPrep.deleteMany({ where: { userId } }),
    db.emailThread.deleteMany({ where: { userId } }),
    db.application.deleteMany({ where: { userId } }),
    db.jobOffer.deleteMany({ where: { userId } }),
    db.tag.deleteMany({ where: { userId } }),
    db.recruiter.deleteMany({ where: { userId } }),
    db.company.deleteMany({ where: { userId } }),
  ]);

  await db.dataProcessingRecord.create({
    data: {
      userId,
      purpose: "Effacement RGPD des données personnelles",
      legalBasis: "Droit à l'effacement (art. 17 RGPD)",
      dataCategories: ["toutes"],
    },
  });
  await recordAudit({
    userId,
    action: "rgpd.erase",
    entityType: "User",
    entityId: userId,
  });
}
