import "server-only";

import { z } from "zod";

/**
 * Centralised, validated access to environment variables.
 *
 * Server-only: importing this module from a Client Component is a build error.
 * Secrets must never reach the browser. Public values use the `NEXT_PUBLIC_`
 * prefix and are intentionally absent here.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DATABASE_URL: z.string().url(),

  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 chars"),
  ENCRYPTION_KEY: z
    .string()
    .regex(
      /^[0-9a-fA-F]{64}$/,
      "ENCRYPTION_KEY must be 64 hex chars (32 bytes)",
    ),
  CRON_SECRET: z.string().min(16),

  // AUTH_BOOTSTRAP_* are consumed only by the seed script (prisma/seed.ts) via
  // plain dotenv, never by the running app, so they are intentionally absent
  // here (Next's env loader would also mangle the "$" in the argon2 hash).

  // LLM access goes through OpenRouter (OpenAI-compatible). Empty key => the
  // agents fall back to a deterministic local mock so the app stays usable.
  OPENROUTER_API_KEY: z.string().default(""),
  OPENROUTER_BASE_URL: z.string().url().default("https://openrouter.ai/api/v1"),
  AI_MODEL_DEFAULT: z.string().default("anthropic/claude-haiku-4.5"),
  AI_MODEL_COMPLEX: z.string().default("anthropic/claude-sonnet-4.5"),

  FRANCE_TRAVAIL_CLIENT_ID: z.string().default(""),
  FRANCE_TRAVAIL_CLIENT_SECRET: z.string().default(""),
  ADZUNA_APP_ID: z.string().default(""),
  ADZUNA_APP_KEY: z.string().default(""),
  // Careerjet v4: the API key is sent via HTTP Basic auth (key as username).
  CAREERJET_API_KEY: z.string().default(""),
  // Findwork.dev: sent as `Authorization: Token <key>`.
  FINDWORK_API_KEY: z.string().default(""),

  APP_URL: z.string().url().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = parsed.data;
export type Env = typeof env;
