/**
 * Shared types for the AI agent layer. Agents never talk to each other
 * directly — they are invoked from the service layer and communicate through
 * persisted records (OfferAnalysis, ApplicationEvent, ...).
 */

/** Model selection tier. The router maps these to concrete OpenRouter ids. */
export type ModelTier = "default" | "complex";

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

/** Normalised result of a single chat completion. */
export type CompletionResult = {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export type CompletionRequest = {
  model: string;
  messages: ChatMessage[];
  /** 0 = deterministic. Defaults to a low value for structured extraction. */
  temperature?: number;
  maxTokens?: number;
  /** Ask the provider to constrain output to a JSON object. */
  json?: boolean;
  signal?: AbortSignal;
};
