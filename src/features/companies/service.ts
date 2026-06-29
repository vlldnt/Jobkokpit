import "server-only";

import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/dal";
import { NotFoundError } from "@/core/errors/app-error";
import * as repo from "./repository";
import type { CompanyInput } from "./schemas";

export async function listCompanies(params: {
  skip: number;
  take: number;
  search?: string;
}) {
  const user = await requireUser();
  return repo.listCompanies(user.id, params);
}

export async function getCompany(id: string) {
  const user = await requireUser();
  return repo.getCompany(user.id, id);
}

export async function listCompanyOptions() {
  const user = await requireUser();
  return repo.listCompanyOptions(user.id);
}

export async function createCompany(input: CompanyInput) {
  const user = await requireUser();
  const company = await repo.createCompany(user.id, input);
  await recordAudit({
    userId: user.id,
    action: "company.create",
    entityType: "Company",
    entityId: company.id,
    after: input,
  });
  return company;
}

export async function updateCompany(id: string, input: CompanyInput) {
  const user = await requireUser();
  const before = await repo.getCompany(user.id, id);
  if (!before) throw new NotFoundError("Entreprise introuvable.");

  await repo.updateCompany(user.id, id, input);
  await recordAudit({
    userId: user.id,
    action: "company.update",
    entityType: "Company",
    entityId: id,
    before,
    after: input,
  });
}

export async function deleteCompany(id: string) {
  const user = await requireUser();
  const before = await repo.getCompany(user.id, id);
  if (!before) throw new NotFoundError("Entreprise introuvable.");

  await repo.softDeleteCompany(user.id, id);
  await recordAudit({
    userId: user.id,
    action: "company.delete",
    entityType: "Company",
    entityId: id,
    before,
  });
}
