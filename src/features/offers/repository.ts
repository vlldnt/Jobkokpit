import "server-only";

import type {
  OfferSource,
  OfferStatus,
  Prisma,
  RemoteType,
  SeniorityLevel,
} from "@prisma/client";

import { db } from "@/lib/db";
import {
  EUROPE_LOCATION_TOKENS,
  REGION_CITIES,
  REGION_SEARCH_LOCATIONS,
} from "./region";
import type { OfferQuickFilter } from "./quick-filters";
import type { OfferInput } from "./schemas";

const activeWhere = (userId: string): Prisma.JobOfferWhereInput => ({
  userId,
  deletedAt: null,
});

function toData(input: OfferInput, dedupHash: string) {
  return {
    title: input.title,
    companyId: input.companyId ?? null,
    description: input.description ?? null,
    url: input.url ?? null,
    location: input.location ?? null,
    remote: input.remote as RemoteType,
    contractType: input.contractType ?? null,
    salaryMin: input.salaryMin ?? null,
    salaryMax: input.salaryMax ?? null,
    currency: input.currency ?? "EUR",
    seniority: input.seniority as SeniorityLevel,
    source: input.source as OfferSource,
    status: input.status as OfferStatus,
    postedAt: input.postedAt ?? null,
    expiresAt: input.expiresAt ?? null,
    dedupHash,
  };
}

/** OR "contains" (insensible à la casse) sur contractType + intitulé. */
const contractContains = (words: string[]): Prisma.JobOfferWhereInput => ({
  OR: words.flatMap((w) => [
    { contractType: { contains: w, mode: "insensitive" as const } },
    { title: { contains: w, mode: "insensitive" as const } },
  ]),
});

const locationContains = (tokens: readonly string[]) =>
  tokens.map((t) => ({
    location: { contains: t, mode: "insensitive" as const },
  }));

/**
 * Clause Prisma d'un filtre rapide. Les filtres contrat/zone matchent par
 * "contains" sur du texte libre : approximation volontaire alignée sur les
 * heuristiques d'affichage (contract-kind, region).
 */
function quickFilterWhere(filter: OfferQuickFilter): Prisma.JobOfferWhereInput {
  switch (filter) {
    case "remote":
      return { remote: "REMOTE" };
    case "hybrid":
      return { remote: "HYBRID" };
    case "onsite":
      return { remote: "ONSITE" };
    case "region":
      return {
        OR: [
          ...locationContains(REGION_SEARCH_LOCATIONS),
          ...locationContains(REGION_CITIES),
          // Format France Travail "12 - RODEZ".
          ...["12", "81", "46", "48", "15"].map((code) => ({
            location: { startsWith: `${code} ` },
          })),
        ],
      };
    case "europe":
      return {
        OR: locationContains(EUROPE_LOCATION_TOKENS),
        NOT: { location: { contains: "france", mode: "insensitive" } },
      };
    case "cdi":
      return contractContains(["cdi", "permanent"]);
    case "cdd":
      return contractContains(["cdd", "fixed-term", "temporaire"]);
    case "stage":
      return contractContains(["stage", "stagiaire", "internship"]);
    case "alternance":
      return contractContains(["alternance", "alternant", "apprenti"]);
    case "freelance":
      return contractContains([
        "freelance",
        "indépendant",
        "independant",
        "independent",
        "portage",
      ]);
  }
}

export async function listOffers(
  userId: string,
  {
    skip,
    take,
    search,
    filter,
    favorites = false,
  }: {
    skip: number;
    take: number;
    search?: string;
    filter?: OfferQuickFilter;
    favorites?: boolean;
  },
) {
  const where: Prisma.JobOfferWhereInput = {
    ...activeWhere(userId),
    // "J'aime pas" met l'offre de côté : jamais affichée dans la liste.
    dismissed: false,
    ...(favorites ? { interested: true } : {}),
    ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
    ...(filter ? { AND: [quickFilterWhere(filter)] } : {}),
  };

  const [items, total] = await Promise.all([
    db.jobOffer.findMany({
      where,
      orderBy: [{ interested: "desc" }, { updatedAt: "desc" }],
      skip,
      take,
      select: {
        id: true,
        title: true,
        status: true,
        remote: true,
        location: true,
        contractType: true,
        url: true,
        interested: true,
        updatedAt: true,
        company: { select: { name: true } },
      },
    }),
    db.jobOffer.count({ where }),
  ]);

  return { items, total };
}

export function getOffer(userId: string, id: string) {
  return db.jobOffer.findFirst({ where: { id, ...activeWhere(userId) } });
}

/** Full offer for the detail view: linked company + persisted AI analysis. */
export function getOfferDetail(userId: string, id: string) {
  return db.jobOffer.findFirst({
    where: { id, ...activeWhere(userId) },
    include: {
      company: { select: { id: true, name: true } },
      analysis: true,
    },
  });
}

export type AnalysisFields = {
  summary: string;
  execSummary: string | null;
  skills: string[];
  technologies: string[];
  benefits: string[];
  salaryEstimate: string | null;
  remoteAssessment: string | null;
  seniorityAssessment: string | null;
  compatibilityScore: number | null;
  suggestions: string[];
  model: string;
  inputTokens: number;
  outputTokens: number;
};

/**
 * Upsert the 1-1 analysis and promote a still-NEW offer to ANALYZED, atomically.
 * Ownership is verified by the caller before invoking this.
 */
export function saveAnalysis(offerId: string, fields: AnalysisFields) {
  return db.$transaction([
    db.offerAnalysis.upsert({
      where: { offerId },
      create: { offerId, ...fields },
      update: fields,
    }),
    db.jobOffer.updateMany({
      where: { id: offerId, status: "NEW" },
      data: { status: "ANALYZED" },
    }),
  ]);
}

export function listOfferOptions(userId: string) {
  return db.jobOffer.findMany({
    where: activeWhere(userId),
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: { id: true, title: true },
  });
}

/** Find a non-deleted offer with the same dedup hash (manual duplicate guard). */
export function findByDedupHash(
  userId: string,
  dedupHash: string,
  excludeId?: string,
) {
  return db.jobOffer.findFirst({
    where: {
      ...activeWhere(userId),
      dedupHash,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
}

export function createOffer(
  userId: string,
  input: OfferInput,
  dedupHash: string,
) {
  return db.jobOffer.create({ data: { ...toData(input, dedupHash), userId } });
}

export function updateOffer(
  userId: string,
  id: string,
  input: OfferInput,
  dedupHash: string,
) {
  return db.jobOffer.updateMany({
    where: { id, ...activeWhere(userId) },
    data: toData(input, dedupHash),
  });
}

export function softDeleteOffer(userId: string, id: string) {
  return db.jobOffer.updateMany({
    where: { id, ...activeWhere(userId) },
    data: { deletedAt: new Date() },
  });
}

/** Soft-delete every offer that is not a favourite (keeps `interested` ones). */
export function softDeleteNonFavorites(userId: string) {
  return db.jobOffer.updateMany({
    where: { ...activeWhere(userId), interested: false },
    data: { deletedAt: new Date() },
  });
}

// ---------------------------------------------------------------------------
// Application workspace (pin/interested, contact, cover letter & email)
// ---------------------------------------------------------------------------

export function setInterested(userId: string, id: string, interested: boolean) {
  return db.jobOffer.updateMany({
    where: { id, ...activeWhere(userId) },
    data: {
      interested,
      interestedAt: interested ? new Date() : null,
      // Aimer une offre annule une éventuelle mise de côté.
      ...(interested ? { dismissed: false, dismissedAt: null } : {}),
    },
  });
}

export function setDismissed(userId: string, id: string, dismissed: boolean) {
  return db.jobOffer.updateMany({
    where: { id, ...activeWhere(userId) },
    data: {
      dismissed,
      dismissedAt: dismissed ? new Date() : null,
      // Écarter une offre retire le "J'aime".
      ...(dismissed ? { interested: false, interestedAt: null } : {}),
    },
  });
}

export function updateContact(
  userId: string,
  id: string,
  data: { contactEmail: string | null; contactPhone: string | null },
) {
  return db.jobOffer.updateMany({
    where: { id, ...activeWhere(userId) },
    data,
  });
}

export function updateApplicationDocs(
  userId: string,
  id: string,
  data: { coverLetter?: string | null; outreachEmail?: string | null },
) {
  return db.jobOffer.updateMany({
    where: { id, ...activeWhere(userId) },
    data,
  });
}

// ---------------------------------------------------------------------------
// Ingestion (Agent 1 — job search sync & manual import)
// ---------------------------------------------------------------------------

export type IngestData = {
  title: string;
  companyId: string | null;
  description: string | null;
  url: string | null;
  location: string | null;
  remote: RemoteType;
  contractType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  seniority: SeniorityLevel;
  source: OfferSource;
  externalId: string | null;
  postedAt: Date | null;
  dedupHash: string;
  raw: unknown;
};

/** Global guard against re-importing the same provider offer (matches the
 * `@@unique([source, externalId])` constraint). */
export function findOfferByExternal(source: OfferSource, externalId: string) {
  return db.jobOffer.findFirst({
    where: { source, externalId },
    select: { id: true },
  });
}

export function createIngestedOffer(userId: string, data: IngestData) {
  const { raw, ...rest } = data;
  return db.jobOffer.create({
    data: {
      ...rest,
      userId,
      status: "NEW",
      raw:
        raw === undefined || raw === null
          ? undefined
          : (JSON.parse(JSON.stringify(raw)) as Prisma.InputJsonValue),
    },
    select: { id: true },
  });
}
