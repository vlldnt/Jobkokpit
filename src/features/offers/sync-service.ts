import "server-only";

import { extractOffer, stripHtml } from "@/agents/job-search/extract";
import type { ExtractedOffer } from "@/agents/job-search/extract";
import { adzunaProvider } from "@/agents/job-search/providers/adzuna";
import { franceTravailProvider } from "@/agents/job-search/providers/france-travail";
import type {
  JobSourceProvider,
  NormalizedOffer,
  ProviderSearchParams,
} from "@/agents/job-search/types";
import { runAgent } from "@/agents/shared";
import {
  ConflictError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "@/core/errors/app-error";
import { findOrCreateByName } from "@/features/companies/repository";
import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { offerDedupHash } from "@/lib/dedup";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { safeFetchText } from "@/lib/ssrf";
import * as offerRepo from "./repository";
import type { OfferSource } from "@prisma/client";

const PROVIDERS: JobSourceProvider[] = [adzunaProvider, franceTravailProvider];

export type SyncResult = {
  created: number;
  skipped: number;
  errors: string[];
  providers: string[];
};

async function getOwnerUserId(): Promise<string> {
  const owner = await db.user.findFirst({
    where: { role: "OWNER", deletedAt: null },
    select: { id: true },
  });
  if (!owner) throw new NotFoundError("Utilisateur propriétaire introuvable.");
  return owner.id;
}

async function persistNormalized(
  userId: string,
  offer: NormalizedOffer,
): Promise<"created" | "skipped"> {
  if (offer.externalId) {
    const existing = await offerRepo.findOfferByExternal(
      offer.source,
      offer.externalId,
    );
    if (existing) return "skipped";
  }

  const dedupHash = offerDedupHash(
    offer.title,
    offer.companyName,
    offer.location,
  );
  if (await offerRepo.findByDedupHash(userId, dedupHash)) return "skipped";

  const companyId = offer.companyName
    ? await findOrCreateByName(userId, offer.companyName)
    : null;

  await offerRepo.createIngestedOffer(userId, {
    title: offer.title,
    companyId,
    description: offer.description,
    url: offer.url,
    location: offer.location,
    remote: offer.remote,
    contractType: offer.contractType,
    salaryMin: offer.salaryMin,
    salaryMax: offer.salaryMax,
    currency: offer.currency,
    seniority: offer.seniority,
    source: offer.source,
    externalId: offer.externalId,
    postedAt: offer.postedAt,
    dedupHash,
    raw: offer.raw,
  });
  return "created";
}

/**
 * Core sync: run every configured provider, deduplicate, persist new offers.
 * Takes an explicit userId so it works from a Server Action or from cron.
 * Per-provider failures are collected, not fatal.
 */
export async function runOfferSync(
  userId: string,
  params: ProviderSearchParams,
): Promise<SyncResult> {
  const active = PROVIDERS.filter((p) => p.isConfigured());
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  const { result } = await runAgent({
    agent: "JOB_SEARCH",
    userId,
    input: { params, providers: active.map((p) => p.source) },
    exec: async () => {
      for (const provider of active) {
        try {
          const offers = await provider.search(params);
          for (const offer of offers) {
            const outcome = await persistNormalized(userId, offer);
            if (outcome === "created") created++;
            else skipped++;
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          logger.error(
            { err: error, provider: provider.source },
            "provider sync failed",
          );
          errors.push(`${provider.source}: ${msg}`);
        }
      }
      const summary = { created, skipped, errors };
      return { result: summary, output: summary };
    },
  });

  return { ...result, providers: active.map((p) => p.source) };
}

/** "Synchroniser" Server Action entrypoint (session-scoped, rate-limited). */
export async function syncOffersForCurrentUser(
  params: ProviderSearchParams,
): Promise<SyncResult> {
  const user = await requireUser();
  const rl = rateLimit(`offer-sync:${user.id}`, 10, 60 * 60 * 1000);
  if (!rl.success) {
    throw new RateLimitError("Trop de synchronisations. Réessayez plus tard.");
  }
  const res = await runOfferSync(user.id, params);
  await recordAudit({
    userId: user.id,
    action: "offer.sync",
    entityType: "JobOffer",
    after: {
      created: res.created,
      skipped: res.skipped,
      providers: res.providers,
    },
  });
  return res;
}

/** Cron entrypoint: resolve the single owner and sync with the given params. */
export async function syncOffersForOwner(
  params: ProviderSearchParams,
): Promise<SyncResult> {
  return runOfferSync(await getOwnerUserId(), params);
}

// ---------------------------------------------------------------------------
// Manual import (URL / paste) — AI extraction via ManualProvider
// ---------------------------------------------------------------------------

async function createFromExtracted(
  userId: string,
  e: ExtractedOffer,
  source: OfferSource,
  url: string | null,
): Promise<string> {
  const dedupHash = offerDedupHash(e.title, e.companyName, e.location);
  if (await offerRepo.findByDedupHash(userId, dedupHash)) {
    throw new ConflictError("Cette offre semble déjà importée.");
  }
  const companyId = e.companyName
    ? await findOrCreateByName(userId, e.companyName)
    : null;

  const created = await offerRepo.createIngestedOffer(userId, {
    title: e.title,
    companyId,
    description: e.description,
    url,
    location: e.location,
    remote: e.remote,
    contractType: e.contractType,
    salaryMin: e.salaryMin,
    salaryMax: e.salaryMax,
    currency: e.currency,
    seniority: e.seniority,
    source,
    externalId: null,
    postedAt: null,
    dedupHash,
    raw: { imported: true },
  });

  await recordAudit({
    userId,
    action: "offer.import",
    entityType: "JobOffer",
    entityId: created.id,
    after: { source, title: e.title },
  });
  return created.id;
}

export async function importOfferFromUrl(url: string): Promise<string> {
  const user = await requireUser();
  const rl = rateLimit(`offer-import:${user.id}`, 30, 60 * 60 * 1000);
  if (!rl.success) {
    throw new RateLimitError("Trop d'imports. Réessayez plus tard.");
  }

  const { text, url: finalUrl } = await safeFetchText(url);
  const clean = stripHtml(text);
  if (clean.length < 50) {
    throw new ValidationError(
      "Contenu de la page insuffisant pour extraire une offre.",
    );
  }

  const { result } = await runAgent({
    agent: "JOB_SEARCH",
    userId: user.id,
    input: { kind: "import-url", url },
    exec: () => extractOffer(clean),
  });

  return createFromExtracted(user.id, result, "IMPORT_URL", finalUrl);
}

export async function importOfferFromText(text: string): Promise<string> {
  const user = await requireUser();
  const rl = rateLimit(`offer-import:${user.id}`, 30, 60 * 60 * 1000);
  if (!rl.success) {
    throw new RateLimitError("Trop d'imports. Réessayez plus tard.");
  }

  const clean = stripHtml(text);
  if (clean.length < 30) throw new ValidationError("Texte trop court.");

  const { result } = await runAgent({
    agent: "JOB_SEARCH",
    userId: user.id,
    input: { kind: "import-text" },
    exec: () => extractOffer(clean),
  });

  return createFromExtracted(user.id, result, "MANUAL", null);
}
