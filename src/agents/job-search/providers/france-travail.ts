import "server-only";

import { ExternalServiceError } from "@/core/errors/app-error";
import { env } from "@/lib/env";
import type {
  JobSourceProvider,
  NormalizedOffer,
  ProviderSearchParams,
} from "../types";

const TOKEN_URL =
  "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire";
const SEARCH_URL =
  "https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search";
const SCOPE = "api_offresdemploiv2 o2dsoffre";

let cachedToken: { value: string; expiresAt: number } | null = null;

type FtJob = {
  id?: string;
  intitule?: string;
  description?: string;
  dateCreation?: string;
  entreprise?: { nom?: string };
  lieuTravail?: { libelle?: string };
  typeContratLibelle?: string;
  salaire?: { libelle?: string };
  origineOffre?: { urlOrigine?: string };
};

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.FRANCE_TRAVAIL_CLIENT_ID,
    client_secret: env.FRANCE_TRAVAIL_CLIENT_SECRET,
    scope: SCOPE,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok)
    throw new ExternalServiceError(`France Travail auth ${res.status}`);

  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!json.access_token) throw new ExternalServiceError("Jeton FT manquant.");

  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 1200) * 1000,
  };
  return cachedToken.value;
}

function mapRemote(job: FtJob): NormalizedOffer["remote"] {
  const text = `${job.intitule ?? ""} ${job.description ?? ""}`.toLowerCase();
  if (/télétravail|100% à distance|full remote/.test(text)) return "REMOTE";
  if (/hybride/.test(text)) return "HYBRID";
  return "UNKNOWN";
}

/** France Travail (ex Pôle emploi) offers API v2. OAuth client_credentials. */
export const franceTravailProvider: JobSourceProvider = {
  source: "FRANCE_TRAVAIL",

  isConfigured() {
    return (
      env.FRANCE_TRAVAIL_CLIENT_ID.length > 0 &&
      env.FRANCE_TRAVAIL_CLIENT_SECRET.length > 0
    );
  },

  async search(params: ProviderSearchParams): Promise<NormalizedOffer[]> {
    const token = await getToken();
    const url = new URL(SEARCH_URL);
    if (params.query) url.searchParams.set("motsCles", params.query);
    if (params.location) {
      url.searchParams.set("commune", params.location);
      if (params.distance != null)
        url.searchParams.set("distance", String(params.distance));
    }
    url.searchParams.set("range", `0-${(params.limit ?? 20) - 1}`);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // 204 = no results, 206 = partial content (both fine).
    if (res.status === 204) return [];
    if (!res.ok && res.status !== 206) {
      throw new ExternalServiceError(`France Travail ${res.status}`);
    }

    const data = (await res.json()) as { resultats?: FtJob[] };
    return (data.resultats ?? [])
      .filter((j) => j.intitule)
      .map((j) => ({
        source: "FRANCE_TRAVAIL" as const,
        externalId: j.id ?? null,
        title: j.intitule!,
        companyName: j.entreprise?.nom ?? null,
        description: j.description ?? null,
        url: j.origineOffre?.urlOrigine ?? null,
        location: j.lieuTravail?.libelle ?? null,
        remote: mapRemote(j),
        contractType: j.typeContratLibelle ?? null,
        salaryMin: null,
        salaryMax: null,
        currency: "EUR",
        seniority: "UNKNOWN" as const,
        postedAt: j.dateCreation ? new Date(j.dateCreation) : null,
        raw: j,
      }));
  },
};
