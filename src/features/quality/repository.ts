import "server-only";

import { db } from "@/lib/db";

/** Mark active offers whose expiry date has passed as EXPIRED. */
export function markExpiredOffers(userId: string) {
  return db.jobOffer.updateMany({
    where: {
      userId,
      deletedAt: null,
      expiresAt: { lt: new Date() },
      status: { notIn: ["EXPIRED", "ARCHIVED"] },
    },
    data: { status: "EXPIRED" },
  });
}

export function loadOffersForQuality(userId: string) {
  return db.jobOffer.findMany({
    where: { userId, deletedAt: null },
    select: {
      id: true,
      title: true,
      companyId: true,
      dedupHash: true,
      url: true,
    },
  });
}

export function loadRecruitersForQuality(userId: string) {
  return db.recruiter.findMany({
    where: { userId, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      linkedinUrl: true,
    },
  });
}

export function loadCompaniesForQuality(userId: string) {
  return db.company.findMany({
    where: { userId, deletedAt: null },
    select: { id: true, name: true, website: true },
  });
}
