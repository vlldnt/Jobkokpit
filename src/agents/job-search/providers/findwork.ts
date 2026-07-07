import "server-only";

import { ExternalServiceError } from "@/core/errors/app-error";
import { env } from "@/lib/env";
import type {
  JobSourceProvider,
  NormalizedOffer,
  ProviderSearchParams,
} from "../types";

const BASE = "https://findwork.dev/api/jobs/";

type FindworkJob = {
  id?: string;
  role?: string;
  company_name?: string;
  text?: string;
  url?: string;
  location?: string | null;
  remote?: boolean;
  employment_type?: string | null;
  date_posted?: string;
};

type FindworkResponse = { results?: FindworkJob[] };

/**
 * Findwork.dev — tech-focused job board, English-oriented and strong on remote
 * roles. Auth: `Authorization: Token <key>`. Configured via FINDWORK_API_KEY.
 */
export const findworkProvider: JobSourceProvider = {
  source: "FINDWORK",
  coverage: "global",

  isConfigured() {
    return env.FINDWORK_API_KEY.length > 0;
  },

  async search(params: ProviderSearchParams): Promise<NormalizedOffer[]> {
    const url = new URL(BASE);
    url.searchParams.set("sort_by", "relevance");
    if (params.query) url.searchParams.set("search", params.query);
    if (params.location) url.searchParams.set("location", params.location);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    let data: FindworkResponse;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Token ${env.FINDWORK_API_KEY}` },
        signal: controller.signal,
      });
      if (!res.ok) throw new ExternalServiceError(`Findwork ${res.status}`);
      data = (await res.json()) as FindworkResponse;
    } catch (error) {
      if (error instanceof ExternalServiceError) throw error;
      throw new ExternalServiceError("Findwork injoignable.");
    } finally {
      clearTimeout(timer);
    }

    const limit = params.limit ?? 20;
    return (data.results ?? [])
      .filter((j) => j.role)
      .slice(0, limit)
      .map((j) => {
        const posted = j.date_posted ? new Date(j.date_posted) : null;
        return {
          source: "FINDWORK" as const,
          externalId: j.id ?? null,
          title: j.role!,
          companyName: j.company_name ?? null,
          description: j.text ?? null,
          url: j.url ?? null,
          location: j.location ?? null,
          remote: j.remote ? ("REMOTE" as const) : ("UNKNOWN" as const),
          contractType: j.employment_type ?? null,
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
