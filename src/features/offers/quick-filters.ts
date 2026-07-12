/**
 * Filtres rapides de la liste des offres (chips cliquables au-dessus du
 * tableau). Un seul filtre actif à la fois, porté par le paramètre d'URL `f`
 * pour rester partageable et compatible pagination/recherche.
 */
export const OFFER_QUICK_FILTERS = [
  { value: "remote", label: "Télétravail" },
  { value: "hybrid", label: "Hybride" },
  { value: "onsite", label: "Sur site" },
  { value: "region", label: "Proche" },
  { value: "europe", label: "Europe" },
  { value: "cdi", label: "CDI" },
  { value: "cdd", label: "CDD" },
  { value: "stage", label: "Stage" },
  { value: "alternance", label: "Alternance" },
  { value: "freelance", label: "Freelance" },
] as const;

export type OfferQuickFilter = (typeof OFFER_QUICK_FILTERS)[number]["value"];

export function parseOfferFilter(
  raw: string | string[] | undefined,
): OfferQuickFilter | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return OFFER_QUICK_FILTERS.some((f) => f.value === value)
    ? (value as OfferQuickFilter)
    : undefined;
}
