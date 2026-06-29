/**
 * Single source of truth for enum option lists and their French labels, used by
 * both forms (select options) and read views (labels/badges). Values mirror the
 * Prisma enums in prisma/schema.prisma.
 */
export type Option = { value: string; label: string };

export const companySizeOptions: Option[] = [
  { value: "UNKNOWN", label: "Inconnue" },
  { value: "MICRO", label: "Micro (1-9)" },
  { value: "SMALL", label: "Petite (10-49)" },
  { value: "MEDIUM", label: "Moyenne (50-249)" },
  { value: "LARGE", label: "Grande (250-4999)" },
  { value: "ENTERPRISE", label: "Groupe (5000+)" },
];

export const remoteOptions: Option[] = [
  { value: "UNKNOWN", label: "Non précisé" },
  { value: "ONSITE", label: "Sur site" },
  { value: "HYBRID", label: "Hybride" },
  { value: "REMOTE", label: "Télétravail" },
];

export const seniorityOptions: Option[] = [
  { value: "UNKNOWN", label: "Non précisé" },
  { value: "INTERN", label: "Stage / Alternance" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MID", label: "Confirmé" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
  { value: "PRINCIPAL", label: "Principal" },
];

export const offerSourceOptions: Option[] = [
  { value: "MANUAL", label: "Saisie manuelle" },
  { value: "IMPORT_URL", label: "Import URL" },
  { value: "FRANCE_TRAVAIL", label: "France Travail" },
  { value: "ADZUNA", label: "Adzuna" },
];

export const offerStatusOptions: Option[] = [
  { value: "NEW", label: "Nouvelle" },
  { value: "ANALYZED", label: "Analysée" },
  { value: "SHORTLISTED", label: "Présélectionnée" },
  { value: "APPLIED", label: "Postulée" },
  { value: "ARCHIVED", label: "Archivée" },
  { value: "EXPIRED", label: "Expirée" },
];

export const applicationStatusOptions: Option[] = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "APPLIED", label: "Envoyée" },
  { value: "SCREENING", label: "Préqualification" },
  { value: "INTERVIEW", label: "Entretien" },
  { value: "TECHNICAL_TEST", label: "Test technique" },
  { value: "OFFER", label: "Proposition" },
  { value: "ACCEPTED", label: "Acceptée" },
  { value: "REJECTED", label: "Refusée" },
  { value: "WITHDRAWN", label: "Retirée" },
];

export const documentTypeOptions: Option[] = [
  { value: "CV", label: "CV" },
  { value: "COVER_LETTER", label: "Lettre de motivation" },
  { value: "PORTFOLIO", label: "Portfolio" },
  { value: "OTHER", label: "Autre" },
];

const labelMaps = {
  companySize: companySizeOptions,
  remote: remoteOptions,
  seniority: seniorityOptions,
  offerSource: offerSourceOptions,
  offerStatus: offerStatusOptions,
  applicationStatus: applicationStatusOptions,
  documentType: documentTypeOptions,
} satisfies Record<string, Option[]>;

export function labelFor(group: keyof typeof labelMaps, value: string): string {
  return labelMaps[group].find((o) => o.value === value)?.label ?? value;
}

export function valuesOf(options: Option[]): [string, ...string[]] {
  return options.map((o) => o.value) as [string, ...string[]];
}
