import "server-only";

import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/dal";
import { offerDedupHash } from "@/lib/dedup";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/core/errors/app-error";
import { getCompany } from "@/features/companies/repository";
import * as repo from "./repository";
import type { OfferInput } from "./schemas";

/** Resolve & authorize the linked company, returning its name for dedup. */
async function resolveCompanyName(
  userId: string,
  companyId?: string,
): Promise<string> {
  if (!companyId) return "";
  const company = await getCompany(userId, companyId);
  if (!company) throw new ValidationError("Entreprise sélectionnée invalide.");
  return company.name;
}

export async function listOffers(params: {
  skip: number;
  take: number;
  search?: string;
}) {
  const user = await requireUser();
  return repo.listOffers(user.id, params);
}

export async function getOffer(id: string) {
  const user = await requireUser();
  return repo.getOffer(user.id, id);
}

export async function getOfferDetail(id: string) {
  const user = await requireUser();
  return repo.getOfferDetail(user.id, id);
}

export async function listOfferOptions() {
  const user = await requireUser();
  return repo.listOfferOptions(user.id);
}

export async function createOffer(input: OfferInput) {
  const user = await requireUser();
  const companyName = await resolveCompanyName(user.id, input.companyId);
  const dedupHash = offerDedupHash(input.title, companyName, input.location);

  if (await repo.findByDedupHash(user.id, dedupHash)) {
    throw new ConflictError("Une offre identique existe déjà.");
  }

  const offer = await repo.createOffer(user.id, input, dedupHash);
  await recordAudit({
    userId: user.id,
    action: "offer.create",
    entityType: "JobOffer",
    entityId: offer.id,
    after: input,
  });
  return offer;
}

export async function updateOffer(id: string, input: OfferInput) {
  const user = await requireUser();
  const before = await repo.getOffer(user.id, id);
  if (!before) throw new NotFoundError("Offre introuvable.");

  const companyName = await resolveCompanyName(user.id, input.companyId);
  const dedupHash = offerDedupHash(input.title, companyName, input.location);

  if (await repo.findByDedupHash(user.id, dedupHash, id)) {
    throw new ConflictError("Une autre offre identique existe déjà.");
  }

  await repo.updateOffer(user.id, id, input, dedupHash);
  await recordAudit({
    userId: user.id,
    action: "offer.update",
    entityType: "JobOffer",
    entityId: id,
    before,
    after: input,
  });
}

export async function deleteOffer(id: string) {
  const user = await requireUser();
  const before = await repo.getOffer(user.id, id);
  if (!before) throw new NotFoundError("Offre introuvable.");

  await repo.softDeleteOffer(user.id, id);
  await recordAudit({
    userId: user.id,
    action: "offer.delete",
    entityType: "JobOffer",
    entityId: id,
    before,
  });
}
