import "server-only";

import { env } from "@/lib/env";
import type { ModelTier } from "./types";

/**
 * Maps a logical tier to a concrete model id. Default tier favours cost
 * (Haiku); complex tier escalates to a stronger model (Sonnet) for harder
 * reasoning (e.g. interview prep, nuanced analysis). Configurable via env.
 */
export function resolveModel(tier: ModelTier): string {
  return tier === "complex" ? env.AI_MODEL_COMPLEX : env.AI_MODEL_DEFAULT;
}
