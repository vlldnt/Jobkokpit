import "server-only";

import { ExternalServiceError } from "@/core/errors/app-error";
import { stripHtml } from "../extract";
import type {
  JobSourceProvider,
  NormalizedOffer,
  ProviderSearchParams,
} from "../types";

const BASE = "https://remotive.com/api/remote-jobs";

type RemotiveJob = {
  id?: number;
  url?: string;
  title?: string;
  company_name?: string;
  job_type?: string;
  publication_date?: string;
  candidate_required_location?: string;
  description?: string;
};

type RemotiveResponse = { jobs?: RemotiveJob[] };

/** Remotive — job board 100% télétravail (mondial). Aucune clé requise. */
export const remotiveProvider: JobSourceProvider = {
  source: "REMOTIVE",
  coverage: "global",

  isConfigured() {
    return true;
  },

  async search(params: ProviderSearchParams): Promise<NormalizedOffer[]> {
    const url = new URL(BASE);
    if (params.query) url.searchParams.set("search", params.query);
    url.searchParams.set("limit", String(params.limit ?? 20));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    let data: RemotiveResponse;
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new ExternalServiceError(`Remotive ${res.status}`);
      data = (await res.json()) as RemotiveResponse;
    } catch (error) {
      if (error instanceof ExternalServiceError) throw error;
      throw new ExternalServiceError("Remotive injoignable.");
    } finally {
      clearTimeout(timer);
    }

    return (data.jobs ?? [])
      .filter((j) => j.title)
      .map((j) => {
        const posted = j.publication_date ? new Date(j.publication_date) : null;
        return {
          source: "REMOTIVE" as const,
          externalId: j.id != null ? String(j.id) : null,
          title: j.title!,
          companyName: j.company_name ?? null,
          description: j.description ? stripHtml(j.description) : null,
          url: j.url ?? null,
          location: j.candidate_required_location ?? "Télétravail",
          remote: "REMOTE" as const,
          contractType: j.job_type ?? null,
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
