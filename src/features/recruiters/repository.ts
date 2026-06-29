import "server-only";

import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { RecruiterInput } from "./schemas";

const activeWhere = (userId: string): Prisma.RecruiterWhereInput => ({
  userId,
  deletedAt: null,
});

function toData(input: RecruiterInput) {
  return {
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    linkedinUrl: input.linkedinUrl ?? null,
    companyId: input.companyId || null,
    notes: input.notes ?? null,
  };
}

export async function listRecruiters(
  userId: string,
  { skip, take, search }: { skip: number; take: number; search?: string },
) {
  const where: Prisma.RecruiterWhereInput = {
    ...activeWhere(userId),
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };

  const [items, total] = await Promise.all([
    db.recruiter.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: { select: { name: true } },
      },
    }),
    db.recruiter.count({ where }),
  ]);

  return { items, total };
}

export function getRecruiter(userId: string, id: string) {
  return db.recruiter.findFirst({ where: { id, ...activeWhere(userId) } });
}

export function createRecruiter(userId: string, input: RecruiterInput) {
  return db.recruiter.create({ data: { ...toData(input), userId } });
}

export function updateRecruiter(
  userId: string,
  id: string,
  input: RecruiterInput,
) {
  return db.recruiter.updateMany({
    where: { id, ...activeWhere(userId) },
    data: toData(input),
  });
}

export function softDeleteRecruiter(userId: string, id: string) {
  return db.recruiter.updateMany({
    where: { id, ...activeWhere(userId) },
    data: { deletedAt: new Date() },
  });
}
