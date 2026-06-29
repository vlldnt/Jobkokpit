import { syncOffersForOwner } from "@/features/offers/sync-service";
import { safeEqual } from "@/lib/crypto";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron-triggered offer sync (Agent 1). Protected by a bearer CRON_SECRET so it
 * can be hit by the worker/scheduler without a user session. Single-user app:
 * it syncs for the owner account.
 *
 *   curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
 *     "$APP_URL/api/sync/offers?q=développeur&where=Paris"
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (env.CRON_SECRET.length === 0 || !safeEqual(token, env.CRON_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? undefined;
  const location = searchParams.get("where") ?? undefined;

  try {
    const res = await syncOffersForOwner({ query, location, limit: 30 });
    return Response.json(res);
  } catch (error) {
    logger.error({ err: error }, "cron offer sync failed");
    return Response.json({ error: "sync failed" }, { status: 500 });
  }
}
