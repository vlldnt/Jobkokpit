import "server-only";

import { generatePrep } from "@/agents/interview-prep/agent";
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

export async function listInterviewPreps() {
  const user = await requireUser();
  return repo.listPreps(user.id);
}

export async function getInterviewPrep(id: string) {
  const user = await requireUser();
  return repo.getPrep(user.id, id);
}

export async function listPrepApplicationOptions() {
  const user = await requireUser();
  return repo.listApplicationOptions(user.id);
}

export async function generateInterviewPrep(
  applicationId: string,
): Promise<string> {
  const user = await requireUser();

  const rl = rateLimit(`interview-prep:${user.id}`, 15, 60 * 60 * 1000);
  if (!rl.success) {
    throw new RateLimitError("Trop de générations. Réessayez plus tard.");
  }

  const ctx = await repo.getApplicationContext(user.id, applicationId);
  if (!ctx) throw new NotFoundError("Candidature introuvable.");
  if (!ctx.offer) {
    throw new ValidationError(
      "Liez une offre à la candidature pour générer la préparation.",
    );
  }

  const { result, usage } = await runAgent({
    agent: "INTERVIEW_PREP",
    userId: user.id,
    input: { applicationId },
    exec: () =>
      generatePrep({
        title: ctx.offer!.title,
        companyName: ctx.company?.name,
        seniority: ctx.offer!.seniority,
        technologies: ctx.offer!.analysis?.technologies,
        description: ctx.offer!.description,
      }),
  });

  const created = await repo.createPrep(
    user.id,
    applicationId,
    result,
    usage?.model ?? "mock",
  );

  await recordAudit({
    userId: user.id,
    action: "interview.generate",
    entityType: "InterviewPrep",
    entityId: created.id,
    after: { applicationId, model: usage?.model ?? "mock" },
  });

  return created.id;
}
