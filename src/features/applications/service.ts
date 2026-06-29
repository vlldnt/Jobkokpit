import "server-only";

import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/dal";
import { labelFor } from "@/lib/enums";
import { NotFoundError, ValidationError } from "@/core/errors/app-error";
import { getCompany } from "@/features/companies/repository";
import { getOffer } from "@/features/offers/repository";
import * as repo from "./repository";
import type { ApplicationInput } from "./schemas";

/** Authorize linked company/offer belong to the user (IDOR protection). */
async function assertLinks(userId: string, input: ApplicationInput) {
  if (input.companyId && !(await getCompany(userId, input.companyId))) {
    throw new ValidationError("Entreprise sélectionnée invalide.");
  }
  if (input.offerId && !(await getOffer(userId, input.offerId))) {
    throw new ValidationError("Offre sélectionnée invalide.");
  }
}

export async function listApplications(params: {
  skip: number;
  take: number;
  search?: string;
}) {
  const user = await requireUser();
  return repo.listApplications(user.id, params);
}

export async function getApplication(id: string) {
  const user = await requireUser();
  return repo.getApplication(user.id, id);
}

export async function getApplicationEvents(id: string) {
  const user = await requireUser();
  return repo.listApplicationEvents(user.id, id);
}

export async function createApplication(input: ApplicationInput) {
  const user = await requireUser();
  await assertLinks(user.id, input);

  const application = await repo.createApplication(user.id, input);
  await repo.addEvent(application.id, {
    type: "CREATED",
    title: "Candidature créée",
    detail: `Statut initial : ${labelFor("applicationStatus", input.status)}`,
  });
  await recordAudit({
    userId: user.id,
    action: "application.create",
    entityType: "Application",
    entityId: application.id,
    after: input,
  });
  return application;
}

export async function updateApplication(id: string, input: ApplicationInput) {
  const user = await requireUser();
  const before = await repo.getApplication(user.id, id);
  if (!before) throw new NotFoundError("Candidature introuvable.");
  await assertLinks(user.id, input);

  await repo.updateApplication(user.id, id, input);

  if (before.status !== input.status) {
    await repo.addEvent(id, {
      type: "STATUS_CHANGE",
      title: "Changement de statut",
      detail: `${labelFor("applicationStatus", before.status)} → ${labelFor(
        "applicationStatus",
        input.status,
      )}`,
    });
  }

  await recordAudit({
    userId: user.id,
    action: "application.update",
    entityType: "Application",
    entityId: id,
    before,
    after: input,
  });
}

export async function deleteApplication(id: string) {
  const user = await requireUser();
  const before = await repo.getApplication(user.id, id);
  if (!before) throw new NotFoundError("Candidature introuvable.");

  await repo.softDeleteApplication(user.id, id);
  await recordAudit({
    userId: user.id,
    action: "application.delete",
    entityType: "Application",
    entityId: id,
    before,
  });
}
