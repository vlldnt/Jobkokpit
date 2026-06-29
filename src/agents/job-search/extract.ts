import "server-only";

import { z } from "zod";
import type { RemoteType, SeniorityLevel } from "@prisma/client";

import {
  aiEnabled,
  chatComplete,
  parseJsonResponse,
  resolveModel,
  type AgentExecResult,
  type ChatMessage,
} from "@/agents/shared";

export type ExtractedOffer = {
  title: string;
  companyName: string | null;
  location: string | null;
  contractType: string | null;
  remote: RemoteType;
  seniority: SeniorityLevel;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  description: string | null;
};

const extractSchema = z.object({
  title: z.string().catch(""),
  companyName: z.string().nullish().catch(null),
  location: z.string().nullish().catch(null),
  contractType: z.string().nullish().catch(null),
  remote: z.enum(["UNKNOWN", "ONSITE", "HYBRID", "REMOTE"]).catch("UNKNOWN"),
  seniority: z
    .enum(["UNKNOWN", "INTERN", "JUNIOR", "MID", "SENIOR", "LEAD", "PRINCIPAL"])
    .catch("UNKNOWN"),
  salaryMin: z.coerce.number().int().nullable().catch(null),
  salaryMax: z.coerce.number().int().nullable().catch(null),
  currency: z.string().nullish().catch("EUR"),
  description: z.string().nullish().catch(null),
});

const SYSTEM_PROMPT = `Tu extrais les informations d'une offre d'emploi à partir d'un texte brut (souvent du HTML nettoyé).
Réponds UNIQUEMENT par un objet JSON valide avec ces clés :
{
  "title": "intitulé du poste",
  "companyName": "entreprise ou null",
  "location": "ville/région ou null",
  "contractType": "CDI/CDD/Freelance/Stage… ou null",
  "remote": "UNKNOWN|ONSITE|HYBRID|REMOTE",
  "seniority": "UNKNOWN|INTERN|JUNIOR|MID|SENIOR|LEAD|PRINCIPAL",
  "salaryMin": nombre annuel brut ou null,
  "salaryMax": nombre annuel brut ou null,
  "currency": "EUR par défaut",
  "description": "description condensée et nettoyée"
}
N'invente rien. Utilise null quand l'information est absente.`;

/** Strip HTML tags/scripts/styles and collapse whitespace to reduce tokens. */
export function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toExtracted(raw: z.infer<typeof extractSchema>): ExtractedOffer {
  return {
    title: raw.title,
    companyName: raw.companyName ?? null,
    location: raw.location ?? null,
    contractType: raw.contractType ?? null,
    remote: raw.remote,
    seniority: raw.seniority,
    salaryMin: raw.salaryMin,
    salaryMax: raw.salaryMax,
    currency: raw.currency ?? "EUR",
    description: raw.description ?? null,
  };
}

/** Deterministic fallback: first non-empty line as title, text as description. */
function heuristicExtract(text: string): ExtractedOffer {
  const clean = text.trim();
  const firstLine =
    clean
      .split("\n")
      .map((l) => l.trim())
      .find(Boolean) ?? "";
  return {
    title: firstLine.slice(0, 200) || "Offre importée",
    companyName: null,
    location: null,
    contractType: null,
    remote: "UNKNOWN",
    seniority: "UNKNOWN",
    salaryMin: null,
    salaryMax: null,
    currency: "EUR",
    description: clean.slice(0, 8000),
  };
}

/**
 * Extract a structured offer from raw text (HTML already stripped by caller).
 * Uses the LLM when available, otherwise a deterministic heuristic.
 */
export async function extractOffer(
  text: string,
): Promise<AgentExecResult<ExtractedOffer>> {
  const trimmed = text.slice(0, 12_000);

  if (!aiEnabled()) {
    return { result: heuristicExtract(trimmed), output: { mock: true } };
  }

  const model = resolveModel("default");
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: trimmed },
  ];

  const completion = await chatComplete({
    model,
    messages,
    json: true,
    temperature: 0.1,
    maxTokens: 1500,
  });

  const parsed = extractSchema.parse(parseJsonResponse(completion.content));
  const result = toExtracted(parsed);
  if (!result.title) result.title = heuristicExtract(trimmed).title;

  return {
    result,
    usage: {
      model: completion.model,
      inputTokens: completion.inputTokens,
      outputTokens: completion.outputTokens,
    },
    output: result,
  };
}
