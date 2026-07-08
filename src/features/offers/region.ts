/**
 * Zone géographique pour les offres en présentiel/hybride : Aveyron et ses
 * départements limitrophes retenus par l'utilisateur. Les offres full remote
 * ne sont pas contraintes par cette zone (recherche nationale).
 */

/** Noms de départements utilisés comme `location` dans les recherches. */
export const REGION_SEARCH_LOCATIONS = [
  "Aveyron",
  "Tarn",
  "Lot",
  "Lozère",
  "Cantal",
] as const;

/** Codes postaux (préfixe département) de la zone. */
const REGION_DEPT_CODES = ["12", "81", "46", "48", "15"];

/** Villes principales par département (déjà normalisées : minuscules, sans accents). */
const REGION_CITIES = [
  // Aveyron (12)
  "rodez",
  "millau",
  "villefranche-de-rouergue",
  "decazeville",
  "onet-le-chateau",
  "saint-affrique",
  "capdenac",
  // Tarn (81)
  "albi",
  "castres",
  "gaillac",
  "graulhet",
  "mazamet",
  "carmaux",
  "lavaur",
  // Lot (46)
  "cahors",
  "figeac",
  "gourdon",
  "souillac",
  // Lozère (48)
  "mende",
  "marvejols",
  "florac",
  "saint-chely-d'apcher",
  // Cantal (15)
  "aurillac",
  "saint-flour",
  "mauriac",
  "arpajon-sur-cere",
];

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * True si la localisation (texte libre renvoyé par les providers) appartient à
 * la zone. Filet de sécurité côté code, en complément de la recherche ciblée
 * par département. Gère les noms de département, les codes/formats France
 * Travail ("12 - RODEZ", "12000 …") et les grandes villes.
 */
export function isInRegion(location: string | null | undefined): boolean {
  if (!location) return false;
  const h = norm(location);

  // Format France Travail "12 - RODEZ" ou code postal "12000".
  if (new RegExp(`\\b(${REGION_DEPT_CODES.join("|")})\\s*-`).test(h)) {
    return true;
  }
  if (new RegExp(`\\b(${REGION_DEPT_CODES.join("|")})\\d{3}\\b`).test(h)) {
    return true;
  }

  // Noms de département (avec exclusion des homonymes composés).
  if (/\baveyron\b/.test(h)) return true;
  if (/\bcantal\b/.test(h)) return true;
  if (/\blozere\b/.test(h)) return true;
  if (/\btarn\b(?!-et-garonne)/.test(h)) return true;
  if (/\blot\b(?!-et-garonne)/.test(h)) return true;

  return REGION_CITIES.some((c) => h.includes(c));
}
