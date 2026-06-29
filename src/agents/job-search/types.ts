import type { OfferSource, RemoteType, SeniorityLevel } from "@prisma/client";

/** A provider-agnostic offer, ready to be deduplicated and persisted. */
export type NormalizedOffer = {
  source: OfferSource;
  externalId: string | null;
  title: string;
  companyName: string | null;
  description: string | null;
  url: string | null;
  location: string | null;
  remote: RemoteType;
  contractType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  seniority: SeniorityLevel;
  postedAt: Date | null;
  /** Raw provider payload kept for traceability/debugging. */
  raw: unknown;
};

export type ProviderSearchParams = {
  query?: string;
  location?: string;
  limit?: number;
};

/**
 * Agent 1 source provider. Implementations are interchangeable; the sync
 * service iterates over the configured ones. Scraping is intentionally absent —
 * LinkedIn/Indeed go through manual import instead (CGU compliance).
 */
export interface JobSourceProvider {
  readonly source: OfferSource;
  isConfigured(): boolean;
  search(params: ProviderSearchParams): Promise<NormalizedOffer[]>;
}
