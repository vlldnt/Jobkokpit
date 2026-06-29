import "server-only";

import {
  isValidEmail,
  isValidHttpUrl,
  isValidPhone,
} from "@/agents/quality-control/validators";
import { runAgent } from "@/agents/shared";
import { RateLimitError } from "@/core/errors/app-error";
import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/dal";
import { rateLimit } from "@/lib/rate-limit";
import * as repo from "./repository";
import type { IssueSeverity, QualityIssue, QualityReport } from "./types";

function tally(issues: QualityIssue[]): Record<IssueSeverity, number> {
  return issues.reduce(
    (acc, i) => ({ ...acc, [i.severity]: acc[i.severity] + 1 }),
    { info: 0, warning: 0, error: 0 } as Record<IssueSeverity, number>,
  );
}

/**
 * Agent 5 — scans the user's data for quality problems: expired offers
 * (auto-corrected), duplicates, invalid contact details and missing links.
 * Read-mostly; the only mutation is expiring stale offers.
 */
export async function runQualityScan(): Promise<QualityReport> {
  const user = await requireUser();

  const rl = rateLimit(`quality:${user.id}`, 20, 60 * 60 * 1000);
  if (!rl.success) {
    throw new RateLimitError("Trop de contrôles lancés. Réessayez plus tard.");
  }

  const report = await runAgent({
    agent: "QUALITY_CONTROL",
    userId: user.id,
    exec: async () => {
      const expired = await repo.markExpiredOffers(user.id);
      const [offers, recruiters, companies] = await Promise.all([
        repo.loadOffersForQuality(user.id),
        repo.loadRecruitersForQuality(user.id),
        repo.loadCompaniesForQuality(user.id),
      ]);

      const issues: QualityIssue[] = [];

      // Duplicate offers (same dedup hash, still active).
      const byHash = new Map<string, typeof offers>();
      for (const offer of offers) {
        const list = byHash.get(offer.dedupHash) ?? [];
        list.push(offer);
        byHash.set(offer.dedupHash, list);
      }
      for (const list of byHash.values()) {
        if (list.length > 1) {
          for (const offer of list.slice(1)) {
            issues.push({
              kind: "offer.duplicate",
              severity: "error",
              entityType: "JobOffer",
              entityId: offer.id,
              label: offer.title,
              message: "Offre en doublon (même intitulé/entreprise/lieu).",
              href: `/offers/${offer.id}`,
            });
          }
        }
      }

      // Offers without a linked company / valid URL.
      for (const offer of offers) {
        if (!offer.companyId) {
          issues.push({
            kind: "offer.no_company",
            severity: "info",
            entityType: "JobOffer",
            entityId: offer.id,
            label: offer.title,
            message: "Aucune entreprise liée.",
            href: `/offers/${offer.id}/edit`,
          });
        }
        if (offer.url && !isValidHttpUrl(offer.url)) {
          issues.push({
            kind: "offer.bad_url",
            severity: "warning",
            entityType: "JobOffer",
            entityId: offer.id,
            label: offer.title,
            message: "Lien de l'offre invalide.",
            href: `/offers/${offer.id}/edit`,
          });
        }
      }

      // Recruiter contact details.
      for (const r of recruiters) {
        if (r.email && !isValidEmail(r.email)) {
          issues.push({
            kind: "recruiter.bad_email",
            severity: "warning",
            entityType: "Recruiter",
            entityId: r.id,
            label: r.name,
            message: `E-mail invalide : ${r.email}`,
            href: `/recruiters/${r.id}/edit`,
          });
        }
        if (r.phone && !isValidPhone(r.phone)) {
          issues.push({
            kind: "recruiter.bad_phone",
            severity: "warning",
            entityType: "Recruiter",
            entityId: r.id,
            label: r.name,
            message: `Téléphone invalide : ${r.phone}`,
            href: `/recruiters/${r.id}/edit`,
          });
        }
        if (r.linkedinUrl && !isValidHttpUrl(r.linkedinUrl)) {
          issues.push({
            kind: "recruiter.bad_url",
            severity: "warning",
            entityType: "Recruiter",
            entityId: r.id,
            label: r.name,
            message: "URL LinkedIn invalide.",
            href: `/recruiters/${r.id}/edit`,
          });
        }
      }

      // Company websites.
      for (const c of companies) {
        if (c.website && !isValidHttpUrl(c.website)) {
          issues.push({
            kind: "company.bad_url",
            severity: "warning",
            entityType: "Company",
            entityId: c.id,
            label: c.name,
            message: "Site web invalide.",
            href: `/companies/${c.id}/edit`,
          });
        }
      }

      const result: QualityReport = {
        scannedAt: new Date().toISOString(),
        expiredMarked: expired.count,
        counts: tally(issues),
        issues,
      };
      return { result, output: { ...result.counts, expired: expired.count } };
    },
  });

  await recordAudit({
    userId: user.id,
    action: "quality.scan",
    entityType: "Quality",
    after: { ...report.result.counts, expired: report.result.expiredMarked },
  });

  return report.result;
}
