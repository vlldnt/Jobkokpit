import "server-only";

import type {
  ApplicationEventType,
  ApplicationStatus,
  Prisma,
} from "@prisma/client";

import { db } from "@/lib/db";
import type { ApplicationInput } from "./schemas";

const activeWhere = (userId: string): Prisma.ApplicationWhereInput => ({
  userId,
  deletedAt: null,
});

function toData(input: ApplicationInput) {
  return {
    companyId: input.companyId ?? null,
    offerId: input.offerId ?? null,
    status: input.status as ApplicationStatus,
    appliedAt: input.appliedAt ?? null,
    nextActionAt: input.nextActionAt ?? null,
    notes: input.notes ?? null,
  };
}

export async function listApplications(
  userId: string,
  { skip, take, search }: { skip: number; take: number; search?: string },
) {
  const where: Prisma.ApplicationWhereInput = {
    ...activeWhere(userId),
    ...(search
      ? {
          OR: [
            { offer: { title: { contains: search, mode: "insensitive" } } },
            { company: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.application.findMany({
      where,
      orderBy: [
        { nextActionAt: { sort: "asc", nulls: "last" } },
        { updatedAt: "desc" },
      ],
      skip,
      take,
      select: {
        id: true,
        status: true,
        appliedAt: true,
        nextActionAt: true,
        updatedAt: true,
        offer: { select: { title: true } },
        company: { select: { name: true } },
      },
    }),
    db.application.count({ where }),
  ]);

  return { items, total };
}

export function getApplication(userId: string, id: string) {
  return db.application.findFirst({ where: { id, ...activeWhere(userId) } });
}

export function getApplicationDetail(userId: string, id: string) {
  return db.application.findFirst({
    where: { id, ...activeWhere(userId) },
    include: {
      offer: { select: { id: true, title: true } },
      company: { select: { id: true, name: true } },
    },
  });
}

export function setNextAction(
  userId: string,
  id: string,
  nextActionAt: Date | null,
) {
  return db.application.updateMany({
    where: { id, ...activeWhere(userId) },
    data: { nextActionAt },
  });
}

/** Applications with a due/overdue follow-up (for dashboard & notifications). */
export function listDueFollowUps(userId: string, now: Date = new Date()) {
  return db.application.findMany({
    where: { ...activeWhere(userId), nextActionAt: { lte: now } },
    orderBy: { nextActionAt: "asc" },
    select: {
      id: true,
      nextActionAt: true,
      status: true,
      offer: { select: { title: true } },
      company: { select: { name: true } },
    },
  });
}

export function listApplicationEvents(userId: string, id: string) {
  return db.applicationEvent.findMany({
    where: { applicationId: id, application: { userId } },
    orderBy: { occurredAt: "desc" },
    select: {
      id: true,
      type: true,
      title: true,
      detail: true,
      occurredAt: true,
    },
  });
}

export function createApplication(userId: string, input: ApplicationInput) {
  return db.application.create({ data: { ...toData(input), userId } });
}

export function updateApplication(
  userId: string,
  id: string,
  input: ApplicationInput,
) {
  return db.application.updateMany({
    where: { id, ...activeWhere(userId) },
    data: toData(input),
  });
}

export function softDeleteApplication(userId: string, id: string) {
  return db.application.updateMany({
    where: { id, ...activeWhere(userId) },
    data: { deletedAt: new Date() },
  });
}

export function addEvent(
  applicationId: string,
  data: { type: ApplicationEventType; title: string; detail?: string },
) {
  return db.applicationEvent.create({
    data: {
      applicationId,
      type: data.type,
      title: data.title,
      detail: data.detail ?? null,
    },
  });
}
