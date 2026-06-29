/**
 * Approximate model pricing (USD per 1M tokens) for cost observability only.
 * These power the `costUsd` column on AgentRun so spend is visible; they are
 * never used for billing. Unknown models yield a null estimate rather than a
 * wrong number. Keep ids aligned with OpenRouter model slugs.
 */
type Price = { input: number; output: number };

const PRICES: Record<string, Price> = {
  "anthropic/claude-haiku-4.5": { input: 1, output: 5 },
  "anthropic/claude-sonnet-4.5": { input: 3, output: 15 },
  "anthropic/claude-3.5-haiku": { input: 0.8, output: 4 },
  "anthropic/claude-3.5-sonnet": { input: 3, output: 15 },
  "google/gemini-2.0-flash-001": { input: 0.1, output: 0.4 },
};

/** Estimated USD cost, or null when the model price is unknown. */
export function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number | null {
  const price = PRICES[model];
  if (!price) return null;
  const cost =
    (inputTokens / 1_000_000) * price.input +
    (outputTokens / 1_000_000) * price.output;
  // Round to 6 decimals (matches the Decimal(10,6) column).
  return Math.round(cost * 1_000_000) / 1_000_000;
}
