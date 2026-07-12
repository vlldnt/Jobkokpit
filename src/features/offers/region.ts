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
export const REGION_CITIES = [
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

/**
 * Pays et grandes villes d'Europe (hors France), normalisés (minuscules, sans
 * accents). Sert au badge "Europe" et au filtre rapide de la liste des offres.
 * Les tokens sont choisis pour ne pas matcher par substring des localités
 * françaises courantes.
 */
export const EUROPE_LOCATION_TOKENS = [
  "germany",
  "deutschland",
  "allemagne",
  "berlin",
  "munich",
  "munchen",
  "hamburg",
  "frankfurt",
  "cologne",
  "koln",
  "austria",
  "autriche",
  "vienna",
  "wien",
  "belgium",
  "belgique",
  "belgie",
  "brussels",
  "bruxelles",
  "antwerp",
  "netherlands",
  "pays-bas",
  "amsterdam",
  "rotterdam",
  "utrecht",
  "spain",
  "espagne",
  "espana",
  "madrid",
  "barcelona",
  "barcelone",
  "valencia",
  "portugal",
  "lisbon",
  "lisbonne",
  "lisboa",
  "porto",
  "italy",
  "italie",
  "italia",
  "milan",
  "rome",
  "roma",
  "turin",
  "poland",
  "pologne",
  "warsaw",
  "varsovie",
  "krakow",
  "cracovie",
  "wroclaw",
  "gdansk",
  "ireland",
  "irlande",
  "dublin",
  "luxembourg",
  "switzerland",
  "suisse",
  "schweiz",
  "zurich",
  "geneva",
  "geneve",
  "lausanne",
  "united kingdom",
  "royaume-uni",
  "london",
  "londres",
  "manchester",
  "edinburgh",
  "sweden",
  "suede",
  "stockholm",
  "gothenburg",
  "denmark",
  "danemark",
  "copenhagen",
  "copenhague",
  "norway",
  "norvege",
  "oslo",
  "finland",
  "finlande",
  "helsinki",
  "czech",
  "tchequie",
  "prague",
  "praha",
  "hungary",
  "hongrie",
  "budapest",
  "romania",
  "roumanie",
  "bucharest",
  "bucarest",
  "bulgaria",
  "bulgarie",
  "sofia",
  "croatia",
  "croatie",
  "zagreb",
  "slovakia",
  "slovaquie",
  "bratislava",
  "slovenia",
  "slovenie",
  "ljubljana",
  "estonia",
  "estonie",
  "tallinn",
  "latvia",
  "lettonie",
  "riga",
  "lithuania",
  "lituanie",
  "vilnius",
  "greece",
  "grece",
  "athens",
  "athenes",
  "malta",
  "malte",
  "cyprus",
  "chypre",
  "europe",
  "emea",
];

/**
 * True si la localisation pointe vers l'Europe hors France : sert à afficher
 * le badge "Europe" directement dans la liste et le détail d'une offre.
 */
export function isEuropeLocation(location: string | null | undefined): boolean {
  if (!location) return false;
  const h = norm(location);
  if (/\bfrance\b/.test(h)) return false;
  return EUROPE_LOCATION_TOKENS.some((t) => h.includes(t));
}
