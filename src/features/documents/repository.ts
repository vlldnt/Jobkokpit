import "server-only";

import type { DocumentType, Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { DocumentInput } from "./schemas";

const activeWhere = (userId: string): Prisma.DocumentWhereInput => ({
  userId,
  deletedAt: null,
});

function toData(input: DocumentInput) {
  return {
    title: input.title,
    type: input.type as DocumentType,
    applicationId: input.applicationId || null,
    content: input.content ?? null,
  };
}

export async function listDocuments(
  userId: string,
  { skip, take, search }: { skip: number; take: number; search?: string },
) {
  const where: Prisma.DocumentWhereInput = {
    ...activeWhere(userId),
    ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
  };

  const [items, total] = await Promise.all([
    db.document.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        title: true,
        type: true,
        version: true,
        updatedAt: true,
        application: { select: { offer: { select: { title: true } } } },
      },
    }),
    db.document.count({ where }),
  ]);

  return { items, total };
}

export function getDocument(userId: string, id: string) {
  return db.document.findFirst({ where: { id, ...activeWhere(userId) } });
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

export function getApplicationLetterContext(
  userId: string,
  applicationId: string,
) {
  return db.application.findFirst({
    where: { id: applicationId, userId, deletedAt: null },
    select: {
      id: true,
      company: { select: { name: true } },
      offer: { select: { title: true, description: true } },
    },
  });
}

export function createDocument(userId: string, input: DocumentInput) {
  return db.document.create({ data: { ...toData(input), userId } });
}

/** Direct creation used by the cover-letter generator. */
export function createDocumentRaw(
  userId: string,
  data: {
    title: string;
    type: DocumentType;
    applicationId: string | null;
    content: string;
  },
) {
  return db.document.create({
    data: { ...data, userId },
    select: { id: true },
  });
}

export function updateDocument(
  userId: string,
  id: string,
  input: DocumentInput,
) {
  return db.document.updateMany({
    where: { id, ...activeWhere(userId) },
    data: toData(input),
  });
}

export function softDeleteDocument(userId: string, id: string) {
  return db.document.updateMany({
    where: { id, ...activeWhere(userId) },
    data: { deletedAt: new Date() },
  });
}
