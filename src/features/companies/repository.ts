import "server-only";

import type { CompanySize, Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import type { CompanyInput } from "./schemas";

const activeWhere = (userId: string): Prisma.CompanyWhereInput => ({
  userId,
  deletedAt: null,
});

function toData(input: CompanyInput) {
  return {
    name: input.name,
    website: input.website ?? null,
    sector: input.sector ?? null,
    size: input.size as CompanySize,
    location: input.location ?? null,
    description: input.description ?? null,
    notes: input.notes ?? null,
  };
}

export async function listCompanies(
  userId: string,
  { skip, take, search }: { skip: number; take: number; search?: string },
) {
  const where: Prisma.CompanyWhereInput = {
    ...activeWhere(userId),
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };

  const [items, total] = await Promise.all([
    db.company.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        name: true,
        sector: true,
        size: true,
        location: true,
        website: true,
        _count: { select: { offers: true, applications: true } },
      },
    }),
    db.company.count({ where }),
  ]);

  return { items, total };
}

export function getCompany(userId: string, id: string) {
  return db.company.findFirst({ where: { id, ...activeWhere(userId) } });
}

/** Match an existing company by (case-insensitive) name or create a stub.
 * Used by offer ingestion to auto-link synced/imported offers to a company. */
export async function findOrCreateByName(userId: string, name: string) {
  const existing = await db.company.findFirst({
    where: {
      ...activeWhere(userId),
      name: { equals: name, mode: "insensitive" },
    },
    select: { id: true },
  });
  if (existing) return existing.id;
  const created = await db.company.create({
    data: { userId, name },
    select: { id: true },
  });
  return created.id;
}

export function listCompanyOptions(userId: string) {
  return db.company.findMany({
    where: activeWhere(userId),
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export function createCompany(userId: string, input: CompanyInput) {
  return db.company.create({ data: { ...toData(input), userId } });
}

export function updateCompany(userId: string, id: string, input: CompanyInput) {
  return db.company.updateMany({
    where: { id, ...activeWhere(userId) },
    data: toData(input),
  });
}

export function softDeleteCompany(userId: string, id: string) {
  return db.company.updateMany({
    where: { id, ...activeWhere(userId) },
    data: { deletedAt: new Date() },
  });
}
