import "server-only";

import { ExternalServiceError } from "@/core/errors/app-error";
import { stripHtml } from "../extract";
import type {
  JobSourceProvider,
  NormalizedOffer,
  ProviderSearchParams,
} from "../types";

const BASE = "https://jobicy.com/api/v2/remote-jobs";

type JobicyJob = {
  id?: number | string;
  url?: string;
  jobTitle?: string;
  companyName?: string;
  jobType?: string[];
  jobGeo?: string;
  jobLevel?: string;
  jobExcerpt?: string;
  jobDescription?: string;
  pubDate?: string;
};

type JobicyResponse = { jobs?: JobicyJob[] };

/** Jobicy — job board télétravail (mondial), pays dans `jobGeo`. Sans clé. */
export const jobicyProvider: JobSourceProvider = {
  source: "JOBICY",
  coverage: "global",

  isConfigured() {
    return true;
  },

  async search(params: ProviderSearchParams): Promise<NormalizedOffer[]> {
    const url = new URL(BASE);
    url.searchParams.set("count", String(Math.min(params.limit ?? 20, 50)));
    if (params.query) url.searchParams.set("tag", params.query);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    let data: JobicyResponse;
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new ExternalServiceError(`Jobicy ${res.status}`);
      data = (await res.json()) as JobicyResponse;
    } catch (error) {
      if (error instanceof ExternalServiceError) throw error;
      throw new ExternalServiceError("Jobicy injoignable.");
    } finally {
      clearTimeout(timer);
    }

    return (data.jobs ?? [])
      .filter((j) => j.jobTitle)
      .map((j) => {
        const posted = j.pubDate ? new Date(j.pubDate) : null;
        const body = j.jobDescription ?? j.jobExcerpt ?? null;
        return {
          source: "JOBICY" as const,
          externalId: j.id != null ? String(j.id) : null,
          title: j.jobTitle!,
          companyName: j.companyName ?? null,
          description: body ? stripHtml(body) : null,
          url: j.url ?? null,
          // Pays d'origine de l'offre full remote.
          location: j.jobGeo ?? "Télétravail",
          remote: "REMOTE" as const,
          contractType: j.jobType?.[0] ?? null,
          salaryMin: null,
          salaryMax: null,
          currency: null,
          seniority: "UNKNOWN" as const,
          postedAt: posted && !Number.isNaN(posted.getTime()) ? posted : null,
          raw: j,
        };
      });
  },
};
