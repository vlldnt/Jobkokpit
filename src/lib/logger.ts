import "server-only";

import pino from "pino";

import { env } from "@/lib/env";

/**
 * Structured application logger. Pretty-printed in development, JSON in
 * production for ingestion by log pipelines. Never log secrets or full
 * personal data — log identifiers instead.
 */
export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  redact: {
    paths: [
      "password",
      "passwordHash",
      "*.password",
      "*.passwordHash",
      "*.token",
      "authorization",
      "*.authorization",
    ],
    censor: "[redacted]",
  },
  ...(env.NODE_ENV !== "production"
    ? { transport: { target: "pino-pretty", options: { colorize: true } } }
    : {}),
});

export type Logger = typeof logger;
