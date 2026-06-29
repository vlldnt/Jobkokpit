import "server-only";

import type { AgentKind, Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { estimateCostUsd } from "./pricing";

export type AgentUsage = {
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export type AgentExecResult<T> = {
  result: T;
  /** Present when a real model was called; absent in mock mode. */
  usage?: AgentUsage;
  /** JSON-safe payload persisted on the AgentRun for observability. */
  output?: unknown;
};

function toJsonSafe(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

/**
 * Runs an agent task wrapped in AgentRun observability: persists status,
 * model, token usage, estimated cost, duration and I/O. DB bookkeeping is
 * best-effort and never masks the underlying task error.
 */
export async function runAgent<T>(opts: {
  agent: AgentKind;
  userId?: string;
  input?: unknown;
  exec: () => Promise<AgentExecResult<T>>;
}): Promise<{ result: T; usage?: AgentUsage }> {
  const startedAt = Date.now();

  let runId: string | undefined;
  try {
    const run = await db.agentRun.create({
      data: {
        agent: opts.agent,
        userId: opts.userId ?? null,
        status: "RUNNING",
        input: toJsonSafe(opts.input),
      },
      select: { id: true },
    });
    runId = run.id;
  } catch (error) {
    logger.warn({ err: error, agent: opts.agent }, "AgentRun create failed");
  }

  try {
    const { result, usage, output } = await opts.exec();
    const durationMs = Date.now() - startedAt;

    if (runId) {
      const costUsd = usage
        ? estimateCostUsd(usage.model, usage.inputTokens, usage.outputTokens)
        : null;
      await db.agentRun
        .update({
          where: { id: runId },
          data: {
            status: "SUCCESS",
            model: usage?.model ?? null,
            inputTokens: usage?.inputTokens ?? null,
            outputTokens: usage?.outputTokens ?? null,
            costUsd: costUsd ?? null,
            durationMs,
            output: toJsonSafe(output),
          },
        })
        .catch((error) =>
          logger.warn({ err: error }, "AgentRun success update failed"),
        );
    }

    return { result, usage };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    if (runId) {
      await db.agentRun
        .update({
          where: { id: runId },
          data: {
            status: "FAILED",
            durationMs,
            error: error instanceof Error ? error.message : String(error),
          },
        })
        .catch(() => undefined);
    }
    throw error;
  }
}
