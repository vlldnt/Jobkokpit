/**
 * Filtre de pertinence des intitulés lors de la synchro : les providers
 * renvoient des résultats hors sujet (vente, esthétique, contrôle…) malgré des
 * mots-clés dev. On ne garde que les intitulés qui évoquent clairement un
 * métier du développement / de l'informatique.
 */

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Motifs testés sur l'intitulé normalisé (minuscules, sans accents). */
const DEV_TITLE_PATTERNS: RegExp[] = [
  /developpeu(r|se)/,
  /\bdev\b/,
  /developer/,
  /devops/,
  /software/,
  /logiciel/,
  /informati(que|cien)/,
  /programmeu(r|se)/,
  /full[ -]?stack/,
  /front[ -]?end/,
  /back[ -]?end/,
  /integrateur (web|html)/,
  /webmaster|webdesigner/,
  /data (engineer|scientist|analyst|architect)/,
  /machine learning|deep learning|\bml engineer\b/,
  /big data/,
  /\bsre\b|site reliability/,
  /cloud/,
  /cyber ?secur|security engineer|securite informatique/,
  /\bqa\b|quality assurance|testeu(r|se)|test (automation|logiciel)|automatisation des tests/,
  /administrat(eur|rice) (systemes?|reseaux?|bases? de donnees)/,
  /\bdba\b/,
  /architecte (logiciel|technique|solutions?|applicatif|si\b)/,
  /tech ?lead|lead (dev|tech)/,
  /ingenieur (d'?etudes?|etudes?|logiciel|systemes?|reseaux?|ia\b)/,
  /developpement (web|logiciel|informatique|mobile)/,
  /javascript|typescript|react|angular|vue\.?js|node|python|django|symfony|laravel|spring|kotlin|swift|flutter|rust\b|ruby|elixir|scala|\bphp\b|\bjava\b|\.net|c#|c\+\+/,
  /\bios\b|android/,
  /salesforce|wordpress|drupal|magento|prestashop|sharepoint|\bsap\b|\berp\b|\bcrm\b/,
  /embarque/,
  /scrum master|product owner|\bcto\b/,
];

/**
 * True si l'intitulé correspond à un métier dev/informatique. Utilisé comme
 * garde-fou de la synchro : tout intitulé hors sujet est écarté.
 */
export function isDevJobTitle(title: string | null | undefined): boolean {
  if (!title) return false;
  const h = norm(title);
  return DEV_TITLE_PATTERNS.some((re) => re.test(h));
}
