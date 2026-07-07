import "server-only";

import {
  aiEnabled,
  chatComplete,
  parseJsonResponse,
  resolveModel,
  type AgentExecResult,
  type ChatMessage,
} from "@/agents/shared";
import { applicationDocsSchema, type ApplicationDocsData } from "./schema";

export type ApplicationDocsInput = {
  title: string;
  companyName?: string | null;
  location?: string | null;
  contractType?: string | null;
  remote?: string | null;
  description?: string | null;
  technologies?: string[];
  candidateName?: string | null;
  candidateEmail?: string | null;
};

const SYSTEM_PROMPT = `Tu es un coach en recrutement tech francophone. À partir d'une offre d'emploi, tu rédiges pour le candidat :
1. Une lettre de motivation en français, professionnelle et sincère, structurée en 3-4 paragraphes, sans formules creuses, qui met en avant l'adéquation avec le poste.
2. Un email d'accompagnement court (5-8 lignes) à envoyer avec la candidature, ton cordial et direct.
Réponds UNIQUEMENT par un objet JSON valide, sans texte autour, avec exactement ces clés :
{
  "coverLetter": "texte de la lettre de motivation",
  "email": "texte de l'email d'accompagnement"
}
N'invente pas d'expériences précises ni de chiffres que tu ne connais pas : reste sur des tournures que le candidat pourra personnaliser. Utilise le nom du candidat pour la signature s'il est fourni.`;

function buildUserPrompt(o: ApplicationDocsInput): string {
  const lines = [
    `Intitulé du poste : ${o.title}`,
    o.companyName ? `Entreprise : ${o.companyName}` : null,
    o.location ? `Localisation : ${o.location}` : null,
    o.contractType ? `Contrat : ${o.contractType}` : null,
    o.remote ? `Télétravail : ${o.remote}` : null,
    o.technologies?.length
      ? `Technologies clés : ${o.technologies.join(", ")}`
      : null,
    o.candidateName ? `Nom du candidat : ${o.candidateName}` : null,
    o.candidateEmail ? `Email du candidat : ${o.candidateEmail}` : null,
    "",
    "Description de l'offre :",
    o.description?.trim() || "(aucune description fournie)",
  ].filter((l): l is string => l !== null);
  return lines.join("\n");
}

/** Deterministic fallback used when no LLM key is configured. */
function mockDocs(o: ApplicationDocsInput): ApplicationDocsData {
  const company = o.companyName ?? "votre entreprise";
  const signature = o.candidateName ?? "[Votre nom]";
  const coverLetter = [
    "Madame, Monsieur,",
    "",
    `Je me permets de vous adresser ma candidature au poste de ${o.title}${
      o.companyName ? ` au sein de ${company}` : ""
    }. Ce poste correspond pleinement à mon projet professionnel et à mes compétences.`,
    "",
    "Au fil de mon parcours, j'ai développé une solide expérience technique et le goût du travail en équipe. Je serais ravi(e) de mettre ces atouts au service de vos projets et de contribuer à vos objectifs.",
    "",
    "Je reste à votre disposition pour un entretien afin de vous exposer ma motivation plus en détail.",
    "",
    "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
    "",
    signature,
    "",
    "— Brouillon local (configurez OPENROUTER_API_KEY pour une génération IA).",
  ].join("\n");
  const email = [
    `Objet : Candidature — ${o.title}`,
    "",
    "Bonjour,",
    "",
    `Je vous adresse ma candidature pour le poste de ${o.title}${
      o.companyName ? ` chez ${company}` : ""
    }. Vous trouverez ci-joint mon CV et ma lettre de motivation.`,
    "",
    "Je me tiens à votre disposition pour échanger.",
    "",
    "Bien cordialement,",
    signature,
  ].join("\n");
  return applicationDocsSchema.parse({ coverLetter, email });
}

/**
 * Agent 3 (APPLICATION) — drafts a cover letter and an outreach email for one
 * offer. Falls back to a deterministic template when no LLM key is set, so the
 * feature is usable (and editable) without any spend.
 */
export async function generateApplicationDocs(
  input: ApplicationDocsInput,
): Promise<AgentExecResult<ApplicationDocsData>> {
  if (!aiEnabled()) {
    return { result: mockDocs(input), output: { mock: true } };
  }

  const model = resolveModel("complex");
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(input) },
  ];

  const completion = await chatComplete({
    model,
    messages,
    json: true,
    temperature: 0.6,
    maxTokens: 1600,
  });

  const result = applicationDocsSchema.parse(
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
