import "server-only";

import {
  aiEnabled,
  chatComplete,
  parseJsonResponse,
  resolveModel,
  type AgentExecResult,
  type ChatMessage,
} from "@/agents/shared";
import { offerAnalysisSchema, type OfferAnalysisData } from "./schema";

export type AnalysisInput = {
  title: string;
  companyName?: string | null;
  location?: string | null;
  contractType?: string | null;
  remote?: string | null;
  seniority?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  description?: string | null;
};

const SYSTEM_PROMPT = `Tu es un analyste spécialisé en recrutement tech francophone.
On te fournit une offre d'emploi. Tu produis une analyse structurée, factuelle et concise, en français.
Réponds UNIQUEMENT par un objet JSON valide, sans texte autour, avec exactement ces clés :
{
  "summary": "résumé neutre de l'offre en 2-3 phrases",
  "execSummary": "synthèse exécutive en 1 phrase pour décider d'aller plus loin",
  "skills": ["compétences clés non techniques"],
  "technologies": ["technologies/outils explicitement requis"],
  "benefits": ["avantages mentionnés"],
  "salaryEstimate": "fourchette estimée si déductible, sinon ''",
  "remoteAssessment": "appréciation du télétravail",
  "seniorityAssessment": "niveau d'expérience attendu",
  "compatibilityScore": 0-100,
  "suggestions": ["conseils pour candidater / points de vigilance"]
}
N'invente pas d'informations absentes. Les tableaux peuvent être vides.`;

function buildUserPrompt(o: AnalysisInput): string {
  const lines = [
    `Intitulé : ${o.title}`,
    o.companyName ? `Entreprise : ${o.companyName}` : null,
    o.location ? `Localisation : ${o.location}` : null,
    o.contractType ? `Contrat : ${o.contractType}` : null,
    o.remote ? `Télétravail : ${o.remote}` : null,
    o.seniority ? `Niveau indiqué : ${o.seniority}` : null,
    o.salaryMin || o.salaryMax
      ? `Salaire indiqué : ${o.salaryMin ?? "?"}–${o.salaryMax ?? "?"} ${o.currency ?? ""}`
      : null,
    "",
    "Description :",
    o.description?.trim() || "(aucune description fournie)",
  ].filter((l): l is string => l !== null);
  return lines.join("\n");
}

const TECH_KEYWORDS = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "C#",
  "C++",
  "React",
  "Next.js",
  "Vue",
  "Angular",
  "Svelte",
  "Node.js",
  "Express",
  "NestJS",
  "Django",
  "Flask",
  "FastAPI",
  "Spring",
  "Laravel",
  "Symfony",
  "Rails",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Elasticsearch",
  "Prisma",
  "Docker",
  "Kubernetes",
  "Terraform",
  "AWS",
  "GCP",
  "Azure",
  "CI/CD",
  "GraphQL",
  "REST",
  "Tailwind",
  "Kafka",
  "RabbitMQ",
  "Git",
];

/** Deterministic fallback used when no LLM key is configured. */
function mockAnalysis(o: AnalysisInput): OfferAnalysisData {
  const haystack = `${o.title} ${o.description ?? ""}`.toLowerCase();
  const technologies = TECH_KEYWORDS.filter((t) =>
    haystack.includes(t.toLowerCase()),
  );
  const score = Math.min(100, 40 + technologies.length * 8);
  return offerAnalysisSchema.parse({
    summary: `Offre « ${o.title} »${o.companyName ? ` chez ${o.companyName}` : ""}${o.location ? ` à ${o.location}` : ""}. Analyse générée en mode local (sans IA).`,
    execSummary:
      "Analyse de démonstration : configurez OPENROUTER_API_KEY pour une analyse réelle.",
    skills: [],
    technologies,
    benefits: [],
    salaryEstimate:
      o.salaryMin || o.salaryMax
        ? `${o.salaryMin ?? "?"}–${o.salaryMax ?? "?"} ${o.currency ?? "EUR"}`
        : "",
    remoteAssessment: o.remote ?? "",
    seniorityAssessment: o.seniority ?? "",
    compatibilityScore: score,
    suggestions: ["Mode local actif — aucune suggestion IA générée."],
  });
}

/**
 * Agent 2 — analyses a single job offer. Returns the structured analysis plus
 * usage metadata (for AgentRun). Falls back to a deterministic mock when no
 * LLM key is set, so the feature is testable without spend.
 */
export async function analyzeOffer(
  input: AnalysisInput,
): Promise<AgentExecResult<OfferAnalysisData>> {
  if (!aiEnabled()) {
    return { result: mockAnalysis(input), output: { mock: true } };
  }

  const model = resolveModel("default");
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(input) },
  ];

  const completion = await chatComplete({
    model,
    messages,
    json: true,
    temperature: 0.2,
    maxTokens: 1200,
  });

  const result = offerAnalysisSchema.parse(
    parseJsonResponse(completion.content),
  );

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
