import "server-only";

import { ExternalServiceError } from "@/core/errors/app-error";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { CompletionRequest, CompletionResult } from "./types";

/** True when a real LLM key is configured; otherwise agents use mock mode. */
export function aiEnabled(): boolean {
  return env.OPENROUTER_API_KEY.length > 0;
}

const REQUEST_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 2;

type OpenRouterChoice = { message?: { content?: string | null } };
type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  error?: { message?: string };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Single chat completion against OpenRouter's OpenAI-compatible endpoint.
 * Adds a timeout and bounded retries on transient (429/5xx) failures. Throws
 * ExternalServiceError on unrecoverable errors — callers decide how to surface.
 */
export async function chatComplete(
  req: CompletionRequest,
): Promise<CompletionResult> {
  if (!aiEnabled()) {
    throw new ExternalServiceError("Clé OpenRouter absente.");
  }

  const body = JSON.stringify({
    model: req.model,
    messages: req.messages,
    temperature: req.temperature ?? 0.2,
    ...(req.maxTokens ? { max_tokens: req.maxTokens } : {}),
    ...(req.json ? { response_format: { type: "json_object" } } : {}),
  });

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    if (req.signal) {
      req.signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }

    try {
      const res = await fetch(`${env.OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          // OpenRouter attribution headers (optional but recommended).
          "HTTP-Referer": env.APP_URL,
          "X-Title": "Job AI CRM",
        },
        body,
        signal: controller.signal,
      });

      if (res.status === 429 || res.status >= 500) {
        lastError = new ExternalServiceError(`OpenRouter ${res.status}`);
        if (attempt < MAX_RETRIES) {
          await sleep(500 * 2 ** attempt);
          continue;
        }
        throw lastError;
      }

      const json = (await res.json()) as OpenRouterResponse;

      if (!res.ok || json.error) {
        throw new ExternalServiceError(
          json.error?.message ?? `OpenRouter ${res.status}`,
        );
      }

      const content = json.choices?.[0]?.message?.content ?? "";
      if (!content) {
        throw new ExternalServiceError("Réponse IA vide.");
      }

      return {
        content,
        model: req.model,
        inputTokens: json.usage?.prompt_tokens ?? 0,
        outputTokens: json.usage?.completion_tokens ?? 0,
      };
    } catch (error) {
      lastError = error;
      const aborted = error instanceof Error && error.name === "AbortError";
      if (aborted || attempt >= MAX_RETRIES) break;
      await sleep(500 * 2 ** attempt);
    } finally {
      clearTimeout(timeout);
    }
  }

  logger.error({ err: lastError, model: req.model }, "OpenRouter call failed");
  if (lastError instanceof ExternalServiceError) throw lastError;
  throw new ExternalServiceError("Service IA indisponible.");
}
