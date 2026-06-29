import "server-only";

import { analyzeOffer } from "@/agents/analysis/agent";
import { runAgent } from "@/agents/shared";
import { NotFoundError, RateLimitError } from "@/core/errors/app-error";
import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/rate-limit";
import * as repo from "./repository";

const blankToNull = (s: string) => (s.trim() === "" ? null : s);

/**
 * Runs Agent 2 on an owned offer, persists the analysis (with model/token
 * usage) and audits the action. The AgentRun lifecycle/cost is handled by
 * `runAgent`; this layer owns authorization + domain persistence.
 */
export async function analyzeOfferById(offerId: string) {
  const user = await requireUser();

  // Cap AI spend / abuse: 30 analyses per rolling hour per user.
  const rl = rateLimit(`offer-analyze:${user.id}`, 30, 60 * 60 * 1000);
  if (!rl.success) {
    throw new RateLimitError("Trop d'analyses lancées. Réessayez plus tard.");
  }

  const offer = await repo.getOfferDetail(user.id, offerId);
  if (!offer) throw new NotFoundError("Offre introuvable.");

  const { result, usage } = await runAgent({
    agent: "ANALYSIS",
    userId: user.id,
    input: { offerId, title: offer.title },
    exec: () =>
      analyzeOffer({
        title: offer.title,
        companyName: offer.company?.name,
        location: offer.location,
        contractType: offer.contractType,
        remote: offer.remote,
        seniority: offer.seniority,
        salaryMin: offer.salaryMin,
        salaryMax: offer.salaryMax,
        currency: offer.currency,
        description: offer.description,
      }),
  });

  await repo.saveAnalysis(offerId, {
    summary: result.summary,
    execSummary: blankToNull(result.execSummary),
    skills: result.skills,
    technologies: result.technologies,
    benefits: result.benefits,
    salaryEstimate: blankToNull(result.salaryEstimate),
    remoteAssessment: blankToNull(result.remoteAssessment),
    seniorityAssessment: blankToNull(result.seniorityAssessment),
    compatibilityScore: result.compatibilityScore,
    suggestions: result.suggestions,
    model: usage?.model ?? "mock",
    inputTokens: usage?.inputTokens ?? 0,
    outputTokens: usage?.outputTokens ?? 0,
  });

  await recordAudit({
    userId: user.id,
    action: "offer.analyze",
    entityType: "JobOffer",
    entityId: offerId,
    after: { model: usage?.model ?? "mock", score: result.compatibilityScore },
  });
}
