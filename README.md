# Job AI CRM

CRM personnel mono-utilisateur pour piloter et **automatiser sa recherche d'emploi** grâce à 5 agents IA : recherche d'offres, analyse, gestion des candidatures, préparation aux entretiens et contrôle qualité.

Application privée, sobre et premium (inspiration Linear / Vercel / Stripe), pensée **Security / Privacy / RGPD by design**.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Agents IA](#agents-ia)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Démarrage rapide (local)](#démarrage-rapide-local)
- [Variables d'environnement](#variables-denvironnement)
- [IA / OpenRouter](#ia--openrouter)
- [Scripts](#scripts)
- [Tests & qualité](#tests--qualité)
- [Déploiement (production)](#déploiement-production)
- [Sécurité & RGPD](#sécurité--rgpd)
- [Feuille de route](#feuille-de-route)

---

## Fonctionnalités

| Module | Description |
|---|---|
| **Tableau de bord** | Indicateurs clés + relances à faire |
| **Offres** | Suivi, import (API / URL / copier-coller IA), déduplication, analyse IA |
| **Entreprises** | Fiches sociétés, liaison offres/candidatures |
| **Candidatures** | Pipeline, timeline d'événements, relances planifiées |
| **Recruteurs** | Carnet de contacts |
| **Documents** | CV, lettres (génération IA), pièces |
| **E-mails** | Suivi des échanges, **corps chiffrés (AES-256-GCM)** |
| **Entretiens** | Questions RH/tech, quiz, cas pratiques, plan de révision (IA) |
| **Statistiques** | Répartitions + consommation IA (tokens & coût) |
| **Contrôle qualité** | Doublons, coordonnées invalides, liens cassés, offres expirées |
| **Notifications** | Alertes et rappels de relance |
| **Historique** | Journal d'audit (traçabilité RGPD) |
| **Configuration** | Profil, export & effacement RGPD |

## Agents IA

Les agents ne communiquent **jamais entre eux directement** : uniquement via la couche `services`. Chaque exécution est journalisée (`AgentRun` : modèle, tokens, coût, durée).

1. **Recherche d'offres** — providers [Adzuna](https://developer.adzuna.com/) & [France Travail](https://francetravail.io/), + import IA par URL/copier-coller. Déduplication (hash normalisé). Pas de scraping (respect des CGU).
2. **Analyse IA** — résumé, compétences, technologies, salaire, score de compatibilité, suggestions.
3. **Gestion des candidatures** — orchestration métier : événements, relances, génération de lettres.
4. **Préparation entretien** — questions, quiz, cas pratiques, checklist, plan de révision.
5. **Contrôle qualité** — validation, cohérence, doublons, expirations.

> Sans clé LLM configurée, les agents basculent en **mode mock déterministe** : l'app reste pleinement utilisable, sans réseau ni coût.

## Stack technique

- **Next.js 16** (App Router, Server Actions, Route Handlers) · **React 19** · **TypeScript strict**
- **Tailwind CSS 4** + composants type shadcn · thème clair/sombre
- **Prisma 7** + **PostgreSQL** (adapter `pg`)
- **IA** via **OpenRouter** (compatible OpenAI) — défaut Haiku, escalade Sonnet (model router)
- **Auth maison** : Argon2id (`@node-rs/argon2`) + session opaque en base, cookie signé (`jose`, HttpOnly/Secure/SameSite=Strict)
- **Zod** (validation à toutes les frontières + `lib/env.ts`) · **Pino** (logs) · **Vitest** (tests)
- **Docker** multi-stage (standalone) + **Caddy** (HTTPS auto)

## Architecture

Clean Architecture + découpage par fonctionnalités (feature-based) + SOLID/DRY/KISS.

```
src/
  app/                 # Routes App Router, layouts, route handlers (api/)
  core/                # Domaine : erreurs métier (framework-agnostic)
  features/<feature>/  # Tranches verticales : schemas · repository · service · actions · components
  agents/              # Couche IA
    shared/            # Client OpenRouter, model-router, pricing, AgentRun
    job-search/ analysis/ interview-prep/ quality-control/ application-mgmt/
  lib/                 # Transverse : db, auth, crypto, ssrf, dedup, rate-limit, env, logger
  components/          # UI partagée
prisma/                # schema.prisma + migrations
docker/                # Dockerfile, Caddyfile, worker.sh, backup.sh
```

**Règles de dépendances** : `core` ne dépend de rien ; `features`/`agents` dépendent de `core` + `lib` ; `app` orchestre via Server Actions. Toutes les requêtes sont scellées au `userId` (protection IDOR).

## Démarrage rapide (local)

Prérequis : **Node 22+**, **PostgreSQL** (natif ou via Docker).

```bash
# 1. Dépendances
npm install

# 2. Configuration
cp .env.example .env
# Générer les secrets :
openssl rand -base64 48   # -> SESSION_SECRET
openssl rand -hex 32      # -> ENCRYPTION_KEY
openssl rand -hex 24      # -> CRON_SECRET
# Renseigner DATABASE_URL et (optionnel) OPENROUTER_API_KEY, ADZUNA_*, FRANCE_TRAVAIL_*

# 3. Base de données (option Docker)
docker compose up -d          # Postgres sur localhost:5434
# 3bis. Migrations + compte propriétaire
npm run db:migrate
npm run auth:hash -- "mon-mot-de-passe"   # -> colle le hash dans AUTH_BOOTSTRAP_PASSWORD_HASH
npm run db:seed

# 4. Lancer
npm run dev                   # http://localhost:3000
```

## Variables d'environnement

Voir [`.env.example`](.env.example). Principales :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL |
| `SESSION_SECRET` | Signature du cookie de session (≥ 32 car.) |
| `ENCRYPTION_KEY` | Chiffrement AES-256-GCM (64 hex) |
| `CRON_SECRET` | Protège la route de synchronisation |
| `AUTH_BOOTSTRAP_EMAIL` / `_PASSWORD_HASH` | Compte propriétaire (seed) |
| `OPENROUTER_API_KEY` | Accès LLM (vide = mode mock) |
| `AI_MODEL_DEFAULT` / `AI_MODEL_COMPLEX` | Modèles OpenRouter |
| `ADZUNA_APP_ID` / `_KEY` | Source Adzuna |
| `FRANCE_TRAVAIL_CLIENT_ID` / `_SECRET` | Source France Travail |

## IA / OpenRouter

L'accès LLM passe par [OpenRouter](https://openrouter.ai) (endpoint compatible OpenAI). Modèles par défaut :

```env
AI_MODEL_DEFAULT="anthropic/claude-haiku-4.5"   # rapide & économique
AI_MODEL_COMPLEX="anthropic/claude-sonnet-4.5"  # raisonnement complexe
```

Coût typique d'une analyse d'offre ≈ **0,00003–0,007 $**. Chaque appel est tracé dans `AgentRun` (tokens + coût estimé), visible dans **Statistiques**.

## Scripts

```bash
npm run dev            # serveur de développement
npm run build          # build de production (standalone)
npm run start          # serveur de production
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint
npm run test           # Vitest
npm run db:migrate     # migrations (dev)
npm run db:deploy      # migrations (prod)
npm run db:seed        # compte propriétaire
npm run db:studio      # Prisma Studio
npm run auth:hash -- "<mdp>"   # hash Argon2id
```

## Tests & qualité

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

## Déploiement (production)

Stack complète via [`docker-compose.prod.yml`](docker-compose.prod.yml) : Postgres + migrations + app (standalone) + **Caddy (HTTPS auto)** + worker de synchronisation + sauvegardes.

```bash
cp .env.example .env      # renseigner DOMAIN, POSTGRES_PASSWORD, DATABASE_URL (hôte: db), secrets…
docker compose -f docker-compose.prod.yml up -d --build
```

- **Caddy** obtient et renouvelle automatiquement le certificat TLS pour `DOMAIN`.
- Le **worker** déclenche `POST /api/sync/offers` (protégé par `CRON_SECRET`) toutes les `SYNC_INTERVAL` secondes.
- Le service **backup** produit un `pg_dump` compressé quotidien (rétention configurable).
- Sonde de santé : `GET /api/health`.

## Sécurité & RGPD

- Validation **Zod** à toutes les frontières ; **Prisma uniquement** (aucun SQL dynamique).
- En-têtes de sécurité (CSP à nonce, HSTS, X-Frame-Options DENY, Referrer-Policy…) via le proxy.
- **Anti-SSRF** sur l'import par URL (blocage des IP privées, re-validation des redirections).
- Cookies HttpOnly/Secure/SameSite=Strict, **rate limiting** (auth + endpoints IA), **audit log**.
- Chiffrement applicatif **AES-256-GCM** des données sensibles (corps d'e-mails).
- **RGPD** : export complet (`GET /api/rgpd/export`), droit à l'effacement, `DataProcessingRecord`.

## Feuille de route

- [ ] Matching sémantique offre ↔ profil (`pgvector` + embeddings)
- [ ] Alertes proactives (nouvelles offres pertinentes, relances)
- [ ] Intégration e-mail (Gmail) pour import automatique des échanges
- [ ] Animations Framer Motion
- [ ] Tests e2e Playwright

---

_Projet personnel — usage privé._
