import "server-only";

import { generateApplicationDocs as runDocsAgent } from "@/agents/documents/agent";
import { runAgent } from "@/agents/shared";
import { NotFoundError, RateLimitError } from "@/core/errors/app-error";
import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/rate-limit";
import * as repo from "./repository";

const blankToNull = (s: string) => {
  const t = s.trim();
  return t === "" ? null : t;
};

/** Pin / unpin an offer ("Intéressé" / favori). */
export async function setInterested(offerId: string, interested: boolean) {
  const user = await requireUser();
  const res = await repo.setInterested(user.id, offerId, interested);
  if (res.count === 0) throw new NotFoundError("Offre introuvable.");
  await recordAudit({
    userId: user.id,
    action: interested ? "offer.interested" : "offer.uninterested",
    entityType: "JobOffer",
    entityId: offerId,
  });
}

/** "J'aime pas" : met l'offre de côté (masquée de la liste) ou l'y remet. */
export async function setDismissed(offerId: string, dismissed: boolean) {
  const user = await requireUser();
  const res = await repo.setDismissed(user.id, offerId, dismissed);
  if (res.count === 0) throw new NotFoundError("Offre introuvable.");
  await recordAudit({
    userId: user.id,
    action: dismissed ? "offer.dismiss" : "offer.undismiss",
    entityType: "JobOffer",
    entityId: offerId,
  });
}

/** Save the contact block (email / phone) of an offer. */
export async function saveContact(
  offerId: string,
  data: { contactEmail: string; contactPhone: string },
) {
  const user = await requireUser();
  const res = await repo.updateContact(user.id, offerId, {
    contactEmail: blankToNull(data.contactEmail),
    contactPhone: blankToNull(data.contactPhone),
  });
  if (res.count === 0) throw new NotFoundError("Offre introuvable.");
}

/** Save edited cover letter and/or outreach email. */
export async function saveApplicationDocs(
  offerId: string,
  data: { coverLetter: string; outreachEmail: string },
) {
  const user = await requireUser();
  const res = await repo.updateApplicationDocs(user.id, offerId, {
    coverLetter: blankToNull(data.coverLetter),
    outreachEmail: blankToNull(data.outreachEmail),
  });
  if (res.count === 0) throw new NotFoundError("Offre introuvable.");
}

/**
 * Runs the APPLICATION agent to draft a cover letter + outreach email for an
 * owned offer, persists them and audits. Falls back to a local template when no
 * LLM key is set. The generated text is fully editable afterwards.
 */
export async function generateApplicationDocs(offerId: string) {
  const user = await requireUser();

  const rl = rateLimit(`offer-docs:${user.id}`, 20, 60 * 60 * 1000);
  if (!rl.success) {
    throw new RateLimitError("Trop de générations. Réessayez plus tard.");
  }

  const offer = await repo.getOfferDetail(user.id, offerId);
  if (!offer) throw new NotFoundError("Offre introuvable.");

  const { result, usage } = await runAgent({
    agent: "APPLICATION",
    userId: user.id,
    input: { offerId, title: offer.title },
    exec: () =>
      runDocsAgent({
        title: offer.title,
        companyName: offer.company?.name,
        location: offer.location,
        contractType: offer.contractType,
        remote: offer.remote,
        description: offer.description,
        technologies: offer.analysis?.technologies ?? [],
        candidateName: user.name,
        candidateEmail: user.email,
      }),
  });

  await repo.updateApplicationDocs(user.id, offerId, {
    coverLetter: result.coverLetter,
    outreachEmail: result.email,
  });

  await recordAudit({
    userId: user.id,
    action: "offer.docs.generate",
    entityType: "JobOffer",
    entityId: offerId,
    after: { model: usage?.model ?? "mock" },
  });

  return { coverLetter: result.coverLetter, outreachEmail: result.email };
}
