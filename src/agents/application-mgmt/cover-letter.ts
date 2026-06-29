import "server-only";

import {
  aiEnabled,
  chatComplete,
  resolveModel,
  type AgentExecResult,
  type ChatMessage,
} from "@/agents/shared";

export type CoverLetterInput = {
  offerTitle: string;
  companyName?: string | null;
  description?: string | null;
  candidateName?: string | null;
};

const SYSTEM_PROMPT = `Tu rédiges des lettres de motivation en français, professionnelles et concises (250-350 mots).
Personnalise selon le poste et l'entreprise, reste sobre, évite les formules creuses et les superlatifs.
Réponds UNIQUEMENT par le texte de la lettre, prêt à l'envoi.`;

function buildPrompt(i: CoverLetterInput): string {
  return [
    `Poste visé : ${i.offerTitle}`,
    i.companyName ? `Entreprise : ${i.companyName}` : null,
    i.candidateName ? `Candidat : ${i.candidateName}` : null,
    "",
    "Description du poste :",
    i.description?.trim() || "(non fournie)",
  ]
    .filter((l): l is string => l !== null)
    .join("\n");
}

function mock(i: CoverLetterInput): string {
  return [
    "Madame, Monsieur,",
    "",
    `Je me permets de vous adresser ma candidature au poste de ${i.offerTitle}${
      i.companyName ? ` au sein de ${i.companyName}` : ""
    }.`,
    "",
    "Mon parcours et mes compétences correspondent aux besoins décrits, et je serais ravi(e) de contribuer à vos projets.",
    "",
    "Je me tiens à votre disposition pour un entretien.",
    "",
    "Cordialement,",
    i.candidateName ?? "",
    "",
    "(Lettre de démonstration — configurez OPENROUTER_API_KEY pour une génération IA.)",
  ].join("\n");
}

/**
 * Agent 3 (LLM piece) — drafts a cover letter for an offer. Uses the complex
 * tier; mock fallback without a key.
 */
export async function generateCoverLetter(
  input: CoverLetterInput,
): Promise<AgentExecResult<string>> {
  if (!aiEnabled()) {
    return { result: mock(input), output: { mock: true } };
  }

  const model = resolveModel("complex");
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildPrompt(input) },
  ];

  const completion = await chatComplete({
    model,
    messages,
    temperature: 0.6,
    maxTokens: 900,
  });

  return {
    result: completion.content.trim(),
    usage: {
      model: completion.model,
      inputTokens: completion.inputTokens,
      outputTokens: completion.outputTokens,
    },
    output: { generated: true },
  };
}
