import "server-only";

import type { EmailDirection, Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { ThreadInput } from "./schemas";

export async function listThreads(
  userId: string,
  { skip, take, search }: { skip: number; take: number; search?: string },
) {
  const where: Prisma.EmailThreadWhereInput = {
    userId,
    ...(search ? { subject: { contains: search, mode: "insensitive" } } : {}),
  };

  const [items, total] = await Promise.all([
    db.emailThread.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        subject: true,
        updatedAt: true,
        application: { select: { offer: { select: { title: true } } } },
        _count: { select: { messages: true } },
      },
    }),
    db.emailThread.count({ where }),
  ]);

  return { items, total };
}

export function getThread(userId: string, id: string) {
  return db.emailThread.findFirst({
    where: { id, userId },
    include: {
      application: { select: { offer: { select: { title: true } } } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}

export function createThread(userId: string, input: ThreadInput) {
  return db.emailThread.create({
    data: {
      userId,
      subject: input.subject,
      applicationId: input.applicationId || null,
    },
    select: { id: true },
  });
}

export function addMessage(
  threadId: string,
  data: {
    direction: EmailDirection;
    fromAddr: string;
    toAddr: string;
    subject: string | null;
    body: string | null;
    sentAt: Date | null;
  },
) {
  return db.$transaction([
    db.emailMessage.create({ data: { threadId, ...data } }),
    db.emailThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    }),
  ]);
}

export function deleteThread(userId: string, id: string) {
  return db.emailThread.deleteMany({ where: { id, userId } });
}

export function listApplicationOptions(userId: string) {
  return db.application.findMany({
    where: { userId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      offer: { select: { title: true } },
      company: { select: { name: true } },
    },
  });
}
