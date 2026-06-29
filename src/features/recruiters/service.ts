import "server-only";

import { NotFoundError, ValidationError } from "@/core/errors/app-error";
import { getCompany } from "@/features/companies/repository";
import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/dal";
import * as repo from "./repository";
import type { RecruiterInput } from "./schemas";

async function assertCompany(userId: string, companyId?: string) {
  if (companyId && !(await getCompany(userId, companyId))) {
    throw new ValidationError("Entreprise sélectionnée invalide.");
  }
}

export async function listRecruiters(params: {
  skip: number;
  take: number;
  search?: string;
}) {
  const user = await requireUser();
  return repo.listRecruiters(user.id, params);
}

export async function getRecruiter(id: string) {
  const user = await requireUser();
  return repo.getRecruiter(user.id, id);
}

export async function createRecruiter(input: RecruiterInput) {
  const user = await requireUser();
  await assertCompany(user.id, input.companyId);

  const recruiter = await repo.createRecruiter(user.id, input);
  await recordAudit({
    userId: user.id,
    action: "recruiter.create",
    entityType: "Recruiter",
    entityId: recruiter.id,
    after: input,
  });
  return recruiter;
}

export async function updateRecruiter(id: string, input: RecruiterInput) {
  const user = await requireUser();
  const before = await repo.getRecruiter(user.id, id);
  if (!before) throw new NotFoundError("Recruteur introuvable.");
  await assertCompany(user.id, input.companyId);

  await repo.updateRecruiter(user.id, id, input);
  await recordAudit({
    userId: user.id,
    action: "recruiter.update",
    entityType: "Recruiter",
    entityId: id,
    before,
    after: input,
  });
}

export async function deleteRecruiter(id: string) {
  const user = await requireUser();
  const before = await repo.getRecruiter(user.id, id);
  if (!before) throw new NotFoundError("Recruteur introuvable.");

  await repo.softDeleteRecruiter(user.id, id);
  await recordAudit({
    userId: user.id,
    action: "recruiter.delete",
    entityType: "Recruiter",
    entityId: id,
    before,
  });
}
