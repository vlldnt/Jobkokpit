import "server-only";

import { generateCoverLetter } from "@/agents/application-mgmt/cover-letter";
import { runAgent } from "@/agents/shared";
import {
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "@/core/errors/app-error";
import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/rate-limit";
import * as repo from "./repository";
import type { DocumentInput } from "./schemas";

async function assertApplication(userId: string, applicationId?: string) {
  if (applicationId) {
    const ctx = await repo.getApplicationLetterContext(userId, applicationId);
    if (!ctx) throw new ValidationError("Candidature sélectionnée invalide.");
  }
}

export async function listDocuments(params: {
  skip: number;
  take: number;
  search?: string;
}) {
  const user = await requireUser();
  return repo.listDocuments(user.id, params);
}

export async function getDocument(id: string) {
  const user = await requireUser();
  return repo.getDocument(user.id, id);
}

export async function listDocumentApplicationOptions() {
  const user = await requireUser();
  return repo.listApplicationOptions(user.id);
}

export async function createDocument(input: DocumentInput) {
  const user = await requireUser();
  await assertApplication(user.id, input.applicationId);

  const doc = await repo.createDocument(user.id, input);
  await recordAudit({
    userId: user.id,
    action: "document.create",
    entityType: "Document",
    entityId: doc.id,
    after: { type: input.type, title: input.title },
  });
  return doc;
}

export async function updateDocument(id: string, input: DocumentInput) {
  const user = await requireUser();
  const before = await repo.getDocument(user.id, id);
  if (!before) throw new NotFoundError("Document introuvable.");
  await assertApplication(user.id, input.applicationId);

  await repo.updateDocument(user.id, id, input);
  await recordAudit({
    userId: user.id,
    action: "document.update",
    entityType: "Document",
    entityId: id,
    before: { type: before.type, title: before.title },
    after: { type: input.type, title: input.title },
  });
}

export async function deleteDocument(id: string) {
  const user = await requireUser();
  const before = await repo.getDocument(user.id, id);
  if (!before) throw new NotFoundError("Document introuvable.");

  await repo.softDeleteDocument(user.id, id);
  await recordAudit({
    userId: user.id,
    action: "document.delete",
    entityType: "Document",
    entityId: id,
    before: { type: before.type, title: before.title },
  });
}

/** Generates a cover letter for an application and stores it as a Document. */
export async function generateCoverLetterDocument(
  applicationId: string,
): Promise<string> {
  const user = await requireUser();

  const rl = rateLimit(`cover-letter:${user.id}`, 15, 60 * 60 * 1000);
  if (!rl.success) {
    throw new RateLimitError("Trop de générations. Réessayez plus tard.");
  }

  const ctx = await repo.getApplicationLetterContext(user.id, applicationId);
  if (!ctx) throw new NotFoundError("Candidature introuvable.");
  if (!ctx.offer) {
    throw new ValidationError("Liez une offre à la candidature.");
  }

  const { result } = await runAgent({
    agent: "APPLICATION",
    userId: user.id,
    input: { applicationId },
    exec: () =>
      generateCoverLetter({
        offerTitle: ctx.offer!.title,
        companyName: ctx.company?.name,
        description: ctx.offer!.description,
        candidateName: user.name,
      }),
  });

  const doc = await repo.createDocumentRaw(user.id, {
    title: `Lettre — ${ctx.offer.title}`,
    type: "COVER_LETTER",
    applicationId,
    content: result,
  });

  await recordAudit({
    userId: user.id,
    action: "document.generate_cover_letter",
    entityType: "Document",
    entityId: doc.id,
    after: { applicationId },
  });

  return doc.id;
}
