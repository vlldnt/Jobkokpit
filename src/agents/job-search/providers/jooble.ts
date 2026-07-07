import "server-only";

import { ExternalServiceError } from "@/core/errors/app-error";
import { env } from "@/lib/env";
import { stripHtml } from "../extract";
import type {
  JobSourceProvider,
  NormalizedOffer,
  ProviderSearchParams,
} from "../types";

const BASE = "https://jooble.org/api";

type JoobleJob = {
  id?: number | string;
  title?: string;
  location?: string;
  snippet?: string;
  salary?: string;
  type?: string;
  link?: string;
  company?: string;
  updated?: string;
};

type JoobleResponse = { jobs?: JoobleJob[] };

function mapRemote(job: JoobleJob): NormalizedOffer["remote"] {
  const text = `${job.title ?? ""} ${job.snippet ?? ""}`.toLowerCase();
  if (/télétravail|remote|100% à distance|full remote|distanciel/.test(text))
    return "REMOTE";
  if (/hybride|hybrid/.test(text)) return "HYBRID";
  return "UNKNOWN";
}

/** Jooble — agrégateur multi-pays (dont FR). Clé passée dans l'URL (POST). */
export const joobleProvider: JobSourceProvider = {
  source: "JOOBLE",

  isConfigured() {
    return env.JOOBLE_API_KEY.length > 0;
  },

  async search(params: ProviderSearchParams): Promise<NormalizedOffer[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    let data: JoobleResponse;
    try {
      const res = await fetch(`${BASE}/${env.JOOBLE_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: params.query ?? "",
          location: params.location ?? "",
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new ExternalServiceError(`Jooble ${res.status}`);
      data = (await res.json()) as JoobleResponse;
    } catch (error) {
      if (error instanceof ExternalServiceError) throw error;
      throw new ExternalServiceError("Jooble injoignable.");
    } finally {
      clearTimeout(timer);
    }

    return (data.jobs ?? [])
      .filter((j) => j.title)
      .slice(0, params.limit ?? 20)
      .map((j) => {
        const posted = j.updated ? new Date(j.updated) : null;
        return {
          source: "JOOBLE" as const,
          externalId: j.id != null ? String(j.id) : null,
          title: j.title!,
          companyName: j.company ?? null,
          description: j.snippet ? stripHtml(j.snippet) : null,
          url: j.link ?? null,
          location: j.location ?? null,
          remote: mapRemote(j),
          contractType: j.type ?? null,
          salaryMin: null,
          salaryMax: null,
          currency: "EUR",
          seniority: "UNKNOWN" as const,
          postedAt: posted && !Number.isNaN(posted.getTime()) ? posted : null,
          raw: j,
        };
      });
  },
};
