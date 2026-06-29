import "server-only";

import type { ApplicationEventType } from "@prisma/client";

import { NotFoundError } from "@/core/errors/app-error";
import { createNotification } from "@/features/notifications/repository";
import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/dal";
import * as repo from "./repository";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

/**
 * Agent 3 — application orchestration (business-heavy, little LLM). Adds
 * timeline events, schedules follow-ups (with a notification) and surfaces due
 * actions. All reads/writes are scoped to the owner.
 */
export async function getApplicationDetail(id: string) {
  const user = await requireUser();
  return repo.getApplicationDetail(user.id, id);
}

export async function logApplicationEvent(
  applicationId: string,
  data: { type: ApplicationEventType; title: string; detail?: string },
) {
  const user = await requireUser();
  const app = await repo.getApplication(user.id, applicationId);
  if (!app) throw new NotFoundError("Candidature introuvable.");

  await repo.addEvent(applicationId, data);
  await recordAudit({
    userId: user.id,
    action: "application.event",
    entityType: "Application",
    entityId: applicationId,
    after: { type: data.type, title: data.title },
  });
}

export async function scheduleFollowUp(
  applicationId: string,
  date: Date,
  note?: string,
) {
  const user = await requireUser();
  const app = await repo.getApplicationDetail(user.id, applicationId);
  if (!app) throw new NotFoundError("Candidature introuvable.");

  await repo.setNextAction(user.id, applicationId, date);
  await repo.addEvent(applicationId, {
    type: "FOLLOW_UP",
    title: "Relance planifiée",
    detail: note ? `${dateFmt.format(date)} — ${note}` : dateFmt.format(date),
  });

  const label = app.offer?.title ?? app.company?.name ?? "une candidature";
  await createNotification(user.id, {
    type: "FOLLOW_UP",
    title: "Relance planifiée",
    body: `${label} — à relancer le ${dateFmt.format(date)}.`,
  });

  await recordAudit({
    userId: user.id,
    action: "application.followup",
    entityType: "Application",
    entityId: applicationId,
    after: { nextActionAt: date.toISOString() },
  });
}

export async function listDueFollowUps() {
  const user = await requireUser();
  return repo.listDueFollowUps(user.id);
}
