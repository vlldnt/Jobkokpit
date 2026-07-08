import "server-only";

import { ExternalServiceError } from "@/core/errors/app-error";
import { stripHtml } from "../extract";
import type {
  JobSourceProvider,
  NormalizedOffer,
  ProviderSearchParams,
} from "../types";

const BASE = "https://www.arbeitnow.com/api/job-board-api";

type ArbeitnowJob = {
  slug?: string;
  company_name?: string;
  title?: string;
  description?: string;
  remote?: boolean;
  url?: string;
  job_types?: string[];
  location?: string;
  created_at?: number | string;
};

type ArbeitnowResponse = { data?: ArbeitnowJob[] };

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * Arbeitnow — job board Allemagne / Europe. Pas de paramètre de recherche :
 * on récupère le flux et on filtre par mot-clé côté code.
 */
export const arbeitnowProvider: JobSourceProvider = {
  source: "ARBEITNOW",
  coverage: "global",

  isConfigured() {
    return true;
  },

  async search(params: ProviderSearchParams): Promise<NormalizedOffer[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    let data: ArbeitnowResponse;
    try {
      const res = await fetch(BASE, { signal: controller.signal });
      if (!res.ok) throw new ExternalServiceError(`Arbeitnow ${res.status}`);
      data = (await res.json()) as ArbeitnowResponse;
    } catch (error) {
      if (error instanceof ExternalServiceError) throw error;
      throw new ExternalServiceError("Arbeitnow injoignable.");
    } finally {
      clearTimeout(timer);
    }

    const words = params.query
      ? norm(params.query)
          .split(/\s+/)
          .filter((w) => w.length > 3)
      : [];

    return (data.data ?? [])
      .filter((j) => {
        if (!j.title) return false;
        if (!words.length) return true;
        const hay = norm(`${j.title} ${j.description ?? ""}`);
        return words.some((w) => hay.includes(w));
      })
      .slice(0, params.limit ?? 20)
      .map((j) => {
        const ts = j.created_at != null ? Number(j.created_at) : NaN;
        const posted = Number.isNaN(ts) ? null : new Date(ts * 1000);
        return {
          source: "ARBEITNOW" as const,
          externalId: j.slug ?? null,
          title: j.title!,
          companyName: j.company_name ?? null,
          description: j.description ? stripHtml(j.description) : null,
          url: j.url ?? null,
          location: j.location ?? null,
          remote: j.remote ? ("REMOTE" as const) : ("UNKNOWN" as const),
          contractType: j.job_types?.[0] ?? null,
          salaryMin: null,
          salaryMax: null,
          currency: null,
          seniority: "UNKNOWN" as const,
          postedAt: posted,
          raw: j,
        };
      });
  },
};
