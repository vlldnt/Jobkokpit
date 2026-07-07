import type { BadgeProps } from "@/components/ui/badge";

/**
 * Type de contrat déduit du champ `contractType` et de l'intitulé de l'offre.
 * Sert à afficher un badge coloré, compréhensible d'un coup d'œil. La détection
 * gère le français et l'anglais, et le cas « stage OU alternance » (même poste
 * ouvert aux deux) via une couleur mixte dédiée.
 */
export type ContractKind =
  | "STAGE"
  | "ALTERNANCE"
  | "STAGE_ALTERNANCE"
  | "CDI"
  | "CDD"
  | "FREELANCE"
  | "INTERIM"
  | "OTHER";

const STAGE_RE = /stage|stagiaire|intern(ship)?\b/i;
const ALT_RE = /alternance|alternant|apprenti|apprentissage|work[-\s]?study/i;
const CDI_RE = /\bcdi\b|permanent|indefinite/i;
const CDD_RE = /\bcdd\b|fixed[-\s]?term|temporaire/i;
const FREELANCE_RE = /freelance|indépendant|independent|portage/i;
const INTERIM_RE = /intérim|interim|temp\b/i;

export function classifyContract(
  contractType: string | null | undefined,
  title?: string | null,
): ContractKind {
  const text = `${contractType ?? ""} ${title ?? ""}`;
  const isStage = STAGE_RE.test(text);
  const isAlt = ALT_RE.test(text);
  if (isStage && isAlt) return "STAGE_ALTERNANCE";
  if (isStage) return "STAGE";
  if (isAlt) return "ALTERNANCE";
  if (CDI_RE.test(text)) return "CDI";
  if (CDD_RE.test(text)) return "CDD";
  if (FREELANCE_RE.test(text)) return "FREELANCE";
  if (INTERIM_RE.test(text)) return "INTERIM";
  return "OTHER";
}

const META: Record<
  ContractKind,
  { label: string; variant: BadgeProps["variant"] }
> = {
  STAGE: { label: "Stage", variant: "stage" },
  ALTERNANCE: { label: "Alternance", variant: "alternance" },
  STAGE_ALTERNANCE: { label: "Stage / Alternance", variant: "stageAlternance" },
  CDI: { label: "CDI", variant: "cdi" },
  CDD: { label: "CDD", variant: "cdd" },
  FREELANCE: { label: "Freelance", variant: "freelance" },
  INTERIM: { label: "Intérim", variant: "outline" },
  OTHER: { label: "Autre", variant: "outline" },
};

/** Badge label + variant for a kind. Falls back to the raw contractType text. */
export function contractBadge(
  contractType: string | null | undefined,
  title?: string | null,
): { label: string; variant: BadgeProps["variant"] } {
  const kind = classifyContract(contractType, title);
  if (kind === "OTHER" && contractType?.trim()) {
    return { label: contractType.trim(), variant: "outline" };
  }
  return META[kind];
}
