/**
 * Suggestions de mots-clés pour la synchronisation, centrées sur les métiers du
 * développement / logiciel / tech. Cliquables dans le formulaire de synchro ;
 * chaque mot-clé déclenche sa propre recherche côté providers.
 */
export const DEV_KEYWORD_PRESETS = [
  // Généralistes / stacks web
  "Développeur Full Stack",
  "Développeur Front-End",
  "Développeur Back-End",
  "Développeur Web",
  "Développeur Logiciel",
  "Intégrateur web",
  "Développeur API",
  // JavaScript / TypeScript
  "Développeur JavaScript",
  "Développeur TypeScript",
  "Développeur React",
  "Développeur Next.js",
  "Développeur Vue.js",
  "Développeur Angular",
  "Développeur Node.js",
  // Python
  "Développeur Python",
  "Développeur Django",
  "Développeur FastAPI",
  // Java / JVM
  "Développeur Java",
  "Développeur Spring Boot",
  "Développeur Kotlin",
  "Développeur Scala",
  // PHP
  "Développeur PHP",
  "Développeur Symfony",
  "Développeur Laravel",
  // .NET / C
  "Développeur .NET",
  "Développeur C#",
  "Développeur C++",
  "Développeur C",
  // Autres langages
  "Développeur Go",
  "Développeur Rust",
  "Développeur Ruby",
  "Développeur Ruby on Rails",
  "Développeur Elixir",
  // Mobile
  "Développeur Mobile",
  "Développeur iOS",
  "Développeur Android",
  "Développeur Swift",
  "Développeur React Native",
  "Développeur Flutter",
  // CMS / no-low code / SaaS
  "Développeur WordPress",
  "Développeur Salesforce",
  "Développeur embarqué",
  // Ingénierie / architecture
  "Ingénieur logiciel",
  "Ingénieur d'études",
  "Ingénieur études et développement",
  "Architecte logiciel",
  "Architecte cloud",
  "Lead développeur",
  "Tech Lead",
  // Data / IA
  "Data Engineer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "Ingénieur IA",
  "Ingénieur Big Data",
  // Ops / infra / sécurité
  "DevOps",
  "Ingénieur DevOps",
  "Ingénieur Cloud",
  "Site Reliability Engineer",
  "Administrateur systèmes et réseaux",
  "Administrateur base de données",
  "Ingénieur cybersécurité",
  "Analyste cybersécurité",
  // Qualité / test
  "Ingénieur QA",
  "Testeur logiciel",
  "Ingénieur automatisation des tests",
  // Intitulés anglais (fréquents dans la tech)
  "Software Engineer",
  "Software Developer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Web Developer",
  "React Developer",
  "Node.js Developer",
  "Python Developer",
  "Java Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Data Engineer",
  "Machine Learning Engineer",
  "Site Reliability Engineer",
  "QA Engineer",
  "Security Engineer",
  "Software Architect",
] as const;

/**
 * Sélection pré-cochée par défaut dans le formulaire de synchro (modifiable) :
 * tous les mots-clés du développement informatique, aucun à rajouter à la main.
 * Chaque mot-clé déclenche une recherche par département + une passe remote,
 * la synchro complète est donc plus longue mais couvre tout le métier.
 */
export const DEFAULT_DEV_KEYWORDS: string[] = [...new Set(DEV_KEYWORD_PRESETS)];
