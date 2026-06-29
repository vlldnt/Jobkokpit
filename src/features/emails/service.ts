import "server-only";

import type { EmailDirection } from "@prisma/client";

import { NotFoundError, ValidationError } from "@/core/errors/app-error";
import { recordAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/dal";
import { decrypt, encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import * as repo from "./repository";
import type { MessageInput, ThreadInput } from "./schemas";

async function assertApplication(userId: string, applicationId?: string) {
  if (applicationId) {
    const app = await db.application.findFirst({
      where: { id: applicationId, userId, deletedAt: null },
      select: { id: true },
    });
    if (!app) throw new ValidationError("Candidature sélectionnée invalide.");
  }
}

function safeDecrypt(body: string | null): string {
  if (!body) return "";
  try {
    return decrypt(body);
  } catch (error) {
    logger.warn({ err: error }, "email body decrypt failed");
    return "[contenu illisible]";
  }
}

export async function listThreads(params: {
  skip: number;
  take: number;
  search?: string;
}) {
  const user = await requireUser();
  return repo.listThreads(user.id, params);
}

export async function listEmailApplicationOptions() {
  const user = await requireUser();
  return repo.listApplicationOptions(user.id);
}

/** Thread with its messages, bodies decrypted for display. */
export async function getThreadDecrypted(id: string) {
  const user = await requireUser();
  const thread = await repo.getThread(user.id, id);
  if (!thread) return null;
  return {
    ...thread,
    messages: thread.messages.map((m) => ({
      ...m,
      body: safeDecrypt(m.body),
    })),
  };
}

export async function createThread(input: ThreadInput) {
  const user = await requireUser();
  await assertApplication(user.id, input.applicationId);
  const thread = await repo.createThread(user.id, input);
  await recordAudit({
    userId: user.id,
    action: "email.thread.create",
    entityType: "EmailThread",
    entityId: thread.id,
    after: { subject: input.subject },
  });
  return thread;
}

export async function addMessage(threadId: string, input: MessageInput) {
  const user = await requireUser();
  const thread = await repo.getThread(user.id, threadId);
  if (!thread) throw new NotFoundError("Conversation introuvable.");

  await repo.addMessage(threadId, {
    direction: input.direction as EmailDirection,
    fromAddr: input.fromAddr,
    toAddr: input.toAddr,
    subject: input.subject ?? null,
    body: input.body ? encrypt(input.body) : null,
    sentAt: input.sentAt ?? null,
  });

  await recordAudit({
    userId: user.id,
    action: "email.message.add",
    entityType: "EmailThread",
    entityId: threadId,
    after: { direction: input.direction },
  });
}

export async function deleteThread(id: string) {
  const user = await requireUser();
  const res = await repo.deleteThread(user.id, id);
  if (res.count === 0) throw new NotFoundError("Conversation introuvable.");
  await recordAudit({
    userId: user.id,
    action: "email.thread.delete",
    entityType: "EmailThread",
    entityId: id,
  });
}
