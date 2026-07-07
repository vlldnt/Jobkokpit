# Jobkokpit

CRM personnel de recherche d'emploi (orienté développeur) : synchronise des
offres depuis plusieurs sources, les filtre par zone géographique et modalité
(présentiel / télétravail), et t'aide à candidater (lettre de motivation et
email générés par IA, favoris, suivi).

Stack : Next.js · TypeScript · Prisma · PostgreSQL.

## Installation rapide

Prérequis : **Node.js 20+** et **Docker** (pour la base de données).

```bash
# 1. Récupérer le projet et les dépendances
git clone <url-du-repo> Jobkokpit && cd Jobkokpit
npm install

# 2. Créer le fichier d'environnement
cp .env.example .env
#    Renseigne DATABASE_URL (valeur Docker prête à l'emploi indiquée en commentaire).

# 3. Lancer la base de données PostgreSQL
docker compose up -d db

# 4. Générer les secrets et les coller dans .env
openssl rand -base64 32   # -> SESSION_SECRET
openssl rand -hex 32      # -> ENCRYPTION_KEY
openssl rand -hex 16      # -> CRON_SECRET

# 5. Créer le mot de passe du compte admin et coller le hash dans .env
#    (dans AUTH_BOOTSTRAP_PASSWORD_HASH ; ajuste aussi AUTH_BOOTSTRAP_EMAIL)
npm run auth:hash -- "TonMotDePasse"

# 6. Créer les tables et le compte admin
npm run db:deploy
npm run db:seed

# 7. Démarrer
npm run dev
```

Ouvre **http://localhost:3000** et connecte-toi avec l'email / mot de passe
définis à l'étape 5.

> L'IA et toutes les sources d'offres sont **optionnelles** : sans aucune clé,
> l'app démarre et fonctionne (l'IA passe en mode démonstration). Ajoute les
> clés dans `.env` quand tu veux — voir les commentaires de `.env.example`.

## Sources d'offres

Chaque source s'active automatiquement dès que sa clé est présente dans `.env`.

- **Sans clé (déjà actives)** : Remotive, Jobicy, Arbeitnow (offres full remote).
- **Avec clé** : Adzuna, Careerjet, Findwork, Jooble, France Travail.

Les liens pour obtenir les clés sont dans `.env.example`. On peut aussi importer
une annonce manuellement (URL ou copier-coller) — utile pour LinkedIn / Indeed.

## Scripts utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | Lancer en développement |
| `npm run build` / `npm start` | Build et lancement production |
| `npm run db:migrate` | Créer/appliquer une migration (dev) |
| `npm run db:deploy` | Appliquer les migrations |
| `npm run db:seed` | Créer le compte admin |
| `npm run db:studio` | Explorer la base (Prisma Studio) |
| `npm run auth:hash -- "<mdp>"` | Générer un hash de mot de passe |
| `npm run typecheck` / `npm run lint` | Vérifications TypeScript / ESLint |
| `npm test` | Tests (Vitest) |

## Déploiement (production)

Un stack Docker complet est fourni (app Next.js en mode standalone + Caddy pour
le HTTPS automatique + migrations + worker de synchronisation + sauvegardes) :

```bash
cp .env.example .env
#  - remplis les secrets
#  - mets DATABASE_URL sur le service interne :  postgresql://jobkokpit:<mdp>@db:5432/jobkokpit
#  - définis DOMAIN=ton-domaine.fr (pour le certificat HTTPS de Caddy)

docker compose -f docker-compose.prod.yml up -d --build
```

Les migrations sont appliquées automatiquement au démarrage (service `migrate`).

## Notes

- La base Docker (dev) écoute sur le port **5434** de l'hôte (pour éviter tout
  conflit avec un PostgreSQL local). C'est déjà reflété dans `.env.example`.
- Pour tout arrêter : `docker compose down` (les données sont conservées dans un
  volume ; ajoute `-v` pour tout effacer).

## Licence

[MIT](LICENSE) © Adrien Vieilledent
