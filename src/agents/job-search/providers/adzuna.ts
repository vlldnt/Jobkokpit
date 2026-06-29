import "server-only";

import { ExternalServiceError } from "@/core/errors/app-error";
import { env } from "@/lib/env";
import type {
  JobSourceProvider,
  NormalizedOffer,
  ProviderSearchParams,
} from "../types";

const BASE = "https://api.adzuna.com/v1/api/jobs/fr/search/1";

type AdzunaJob = {
  id?: string;
  title?: string;
  description?: string;
  redirect_url?: string;
  created?: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  contract_type?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
};

type AdzunaResponse = { results?: AdzunaJob[] };

function mapRemote(job: AdzunaJob): NormalizedOffer["remote"] {
  const text = `${job.title ?? ""} ${job.description ?? ""}`.toLowerCase();
  if (/télétravail|remote|100% à distance|full remote/.test(text))
    return "REMOTE";
  if (/hybride|hybrid/.test(text)) return "HYBRID";
  return "UNKNOWN";
}

function mapContract(job: AdzunaJob): string | null {
  if (job.contract_type) return job.contract_type;
  if (job.contract_time === "part_time") return "Temps partiel";
  if (job.contract_time === "full_time") return "Temps plein";
  return null;
}

/** Adzuna aggregator (FR). Configured via ADZUNA_APP_ID / ADZUNA_APP_KEY. */
export const adzunaProvider: JobSourceProvider = {
  source: "ADZUNA",

  isConfigured() {
    return env.ADZUNA_APP_ID.length > 0 && env.ADZUNA_APP_KEY.length > 0;
  },

  async search(params: ProviderSearchParams): Promise<NormalizedOffer[]> {
    const url = new URL(BASE);
    url.searchParams.set("app_id", env.ADZUNA_APP_ID);
    url.searchParams.set("app_key", env.ADZUNA_APP_KEY);
    url.searchParams.set("results_per_page", String(params.limit ?? 20));
    url.searchParams.set("content-type", "application/json");
    if (params.query) url.searchParams.set("what", params.query);
    if (params.location) url.searchParams.set("where", params.location);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    let data: AdzunaResponse;
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new ExternalServiceError(`Adzuna ${res.status}`);
      data = (await res.json()) as AdzunaResponse;
    } catch (error) {
      if (error instanceof ExternalServiceError) throw error;
      throw new ExternalServiceError("Adzuna injoignable.");
    } finally {
      clearTimeout(timer);
    }

    return (data.results ?? [])
      .filter((j) => j.title)
      .map((j) => ({
        source: "ADZUNA" as const,
        externalId: j.id ?? null,
        title: j.title!,
        companyName: j.company?.display_name ?? null,
        description: j.description ?? null,
        url: j.redirect_url ?? null,
        location: j.location?.display_name ?? null,
        remote: mapRemote(j),
        contractType: mapContract(j),
        salaryMin: j.salary_min ? Math.round(j.salary_min) : null,
        salaryMax: j.salary_max ? Math.round(j.salary_max) : null,
        currency: "EUR",
        seniority: "UNKNOWN" as const,
        postedAt: j.created ? new Date(j.created) : null,
        raw: j,
      }));
  },
};
