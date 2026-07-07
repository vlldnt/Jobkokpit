import "server-only";

import { ExternalServiceError } from "@/core/errors/app-error";
import { env } from "@/lib/env";
import type {
  JobSourceProvider,
  NormalizedOffer,
  ProviderSearchParams,
} from "../types";

const BASE = "https://search.api.careerjet.net/v4/query";

// Careerjet v4 requires a plausible end-user IP consistent with the locale and
// a Referer header. There is no real end user in a server-side sync, so we send
// a stable public FR IP and the app URL as referer.
const USER_IP = "90.0.0.1";
const USER_AGENT = "Mozilla/5.0 (compatible; JobkokpitBot/1.0)";

// salary_type → multiplier to approximate a yearly amount (keeps salaries
// comparable with other providers, which report annual figures).
const YEARLY_MULTIPLIER: Record<string, number> = {
  Y: 1,
  M: 12,
  W: 52,
  D: 260,
  H: 1720,
};

type CareerjetJob = {
  title?: string;
  company?: string;
  date?: string;
  description?: string;
  locations?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency_code?: string;
  salary_type?: string;
  url?: string;
};

type CareerjetResponse = {
  type?: string; // "JOBS" | "LOCATIONS" | "ERROR"
  jobs?: CareerjetJob[];
};

function mapRemote(job: CareerjetJob): NormalizedOffer["remote"] {
  const text = `${job.title ?? ""} ${job.description ?? ""}`.toLowerCase();
  if (/télétravail|remote|100% à distance|full remote|distanciel/.test(text))
    return "REMOTE";
  if (/hybride|hybrid/.test(text)) return "HYBRID";
  return "UNKNOWN";
}

function toYearly(value?: number, type?: string): number | null {
  if (!value) return null;
  const mult = YEARLY_MULTIPLIER[type ?? "Y"] ?? 1;
  return Math.round(value * mult);
}

/** Careerjet aggregator (v4). Configured via CAREERJET_API_KEY (Basic auth). */
export const careerjetProvider: JobSourceProvider = {
  source: "CAREERJET",

  isConfigured() {
    return env.CAREERJET_API_KEY.length > 0;
  },

  async search(params: ProviderSearchParams): Promise<NormalizedOffer[]> {
    const url = new URL(BASE);
    url.searchParams.set("locale_code", "fr_FR");
    url.searchParams.set("page_size", String(params.limit ?? 20));
    url.searchParams.set("user_ip", USER_IP);
    url.searchParams.set("user_agent", USER_AGENT);
    if (params.query) url.searchParams.set("keywords", params.query);
    if (params.location) {
      url.searchParams.set("location", params.location);
      if (params.distance != null)
        url.searchParams.set("radius", String(params.distance));
    }

    // Basic auth: API key as username, empty password.
    const auth = Buffer.from(`${env.CAREERJET_API_KEY}:`).toString("base64");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    let data: CareerjetResponse;
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Basic ${auth}`,
          Referer: env.APP_URL,
        },
        signal: controller.signal,
      });
      if (!res.ok) throw new ExternalServiceError(`Careerjet ${res.status}`);
      data = (await res.json()) as CareerjetResponse;
    } catch (error) {
      if (error instanceof ExternalServiceError) throw error;
      throw new ExternalServiceError("Careerjet injoignable.");
    } finally {
      clearTimeout(timer);
    }

    // An ambiguous/absent location yields type "LOCATIONS" (no jobs).
    if (data.type && data.type !== "JOBS") return [];

    return (data.jobs ?? [])
      .filter((j) => j.title)
      .map((j) => {
        const posted = j.date ? new Date(j.date) : null;
        return {
          source: "CAREERJET" as const,
          externalId: null,
          title: j.title!,
          companyName: j.company ?? null,
          description: j.description ?? null,
          url: j.url ?? null,
          location: j.locations ?? null,
          remote: mapRemote(j),
          contractType: null,
          salaryMin: toYearly(j.salary_min, j.salary_type),
          salaryMax: toYearly(j.salary_max, j.salary_type),
          currency: j.salary_currency_code ?? "EUR",
          seniority: "UNKNOWN" as const,
          postedAt: posted && !Number.isNaN(posted.getTime()) ? posted : null,
          raw: j,
        };
      });
  },
};
