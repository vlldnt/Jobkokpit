import "server-only";

import {
  aiEnabled,
  chatComplete,
  parseJsonResponse,
  resolveModel,
  type AgentExecResult,
  type ChatMessage,
} from "@/agents/shared";
import { interviewPrepSchema, type InterviewPrepData } from "./schema";

export type InterviewPrepInput = {
  title: string;
  companyName?: string | null;
  seniority?: string | null;
  technologies?: string[];
  description?: string | null;
};

const SYSTEM_PROMPT = `Tu es un coach d'entretien d'embauche francophone, spécialisé tech.
À partir d'une offre, tu prépares le candidat. Réponds UNIQUEMENT par un objet JSON valide :
{
  "hrQuestions": ["questions RH probables"],
  "technicalQuestions": ["questions techniques ciblées sur le poste"],
  "quiz": [{"question": "...", "answer": "réponse concise"}],
  "caseStudies": ["mises en situation / cas pratiques"],
  "checklist": ["choses à préparer avant l'entretien"],
  "revisionPlan": ["plan de révision étape par étape"]
}
Sois concret, adapté au niveau et aux technologies. 5 à 8 éléments par liste.`;

function buildUserPrompt(o: InterviewPrepInput): string {
  return [
    `Poste : ${o.title}`,
    o.companyName ? `Entreprise : ${o.companyName}` : null,
    o.seniority ? `Niveau : ${o.seniority}` : null,
    o.technologies?.length
      ? `Technologies : ${o.technologies.join(", ")}`
      : null,
    "",
    "Description :",
    o.description?.trim() || "(non fournie)",
  ]
    .filter((l): l is string => l !== null)
    .join("\n");
}

function mockPrep(o: InterviewPrepInput): InterviewPrepData {
  const tech = o.technologies?.length ? o.technologies.join(", ") : "le poste";
  return interviewPrepSchema.parse({
    hrQuestions: [
      "Présentez-vous en quelques minutes.",
      `Pourquoi ce poste${o.companyName ? ` chez ${o.companyName}` : ""} ?`,
      "Quelle est votre plus grande réussite professionnelle ?",
      "Comment gérez-vous un désaccord en équipe ?",
      "Quelles sont vos prétentions salariales ?",
    ],
    technicalQuestions: [
      `Expliquez vos forces sur ${tech}.`,
      "Décrivez une architecture que vous avez conçue.",
      "Comment assurez-vous la qualité de votre code ?",
    ],
    quiz: [
      {
        question: "Mode local actif",
        answer: "Configurez OPENROUTER_API_KEY pour un quiz généré par IA.",
      },
    ],
    caseStudies: ["Étude de cas générique (mode local)."],
    checklist: [
      "Relire l'offre et le site de l'entreprise.",
      "Préparer 3 questions à poser.",
      "Tester le matériel (visio).",
    ],
    revisionPlan: [
      "J-3 : réviser les fondamentaux.",
      "J-1 : relire ses projets clés.",
      "Jour J : arriver en avance, rester serein.",
    ],
  });
}

/**
 * Agent 4 — generates interview preparation for an offer/application. Uses the
 * "complex" model tier (stronger reasoning). Mock fallback without a key.
 */
export async function generatePrep(
  input: InterviewPrepInput,
): Promise<AgentExecResult<InterviewPrepData>> {
  if (!aiEnabled()) {
    return { result: mockPrep(input), output: { mock: true } };
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
    temperature: 0.4,
    maxTokens: 2500,
  });

  const result = interviewPrepSchema.parse(
    parseJsonResponse(completion.content),
  );

  return {
    result,
    usage: {
      model: completion.model,
      inputTokens: completion.inputTokens,
      outputTokens: completion.outputTokens,
    },
    output: { generated: true },
  };
}
