import "server-only";

import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";

export async function getStats() {
  const user = await requireUser();
  const userId = user.id;
  const active = { userId, deletedAt: null };

  const [
    offers,
    applications,
    companies,
    recruiters,
    analyzed,
    offersByStatus,
    applicationsByStatus,
    aiAgg,
  ] = await Promise.all([
    db.jobOffer.count({ where: active }),
    db.application.count({ where: active }),
    db.company.count({ where: active }),
    db.recruiter.count({ where: active }),
    db.offerAnalysis.count({ where: { offer: active } }),
    db.jobOffer.groupBy({
      by: ["status"],
      where: active,
      _count: { _all: true },
    }),
    db.application.groupBy({
      by: ["status"],
      where: active,
      _count: { _all: true },
    }),
    db.agentRun.aggregate({
      where: { userId },
      _sum: { costUsd: true, inputTokens: true, outputTokens: true },
      _count: { _all: true },
    }),
  ]);

  return {
    totals: { offers, applications, companies, recruiters, analyzed },
    offersByStatus: offersByStatus.map((o) => ({
      status: o.status,
      count: o._count._all,
    })),
    applicationsByStatus: applicationsByStatus.map((a) => ({
      status: a.status,
      count: a._count._all,
    })),
    ai: {
      runs: aiAgg._count._all,
      costUsd: aiAgg._sum.costUsd ? aiAgg._sum.costUsd.toNumber() : 0,
      tokens: (aiAgg._sum.inputTokens ?? 0) + (aiAgg._sum.outputTokens ?? 0),
    },
  };
}
