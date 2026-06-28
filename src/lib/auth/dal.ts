import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";

export type AuthSession = { userId: string; sessionId: string };
export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  role: "OWNER";
};

/**
 * Data Access Layer entry point. Validates the session against the database
 * (secure check, not the optimistic cookie-only check done in proxy).
 * Memoised per request via React `cache` to avoid duplicate queries.
 */
export const getSession = cache(async (): Promise<AuthSession | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const claims = await verifySessionToken(token);
  if (!claims) return null;

  const session = await db.session.findUnique({
    where: { id: claims.sid },
    select: { id: true, userId: true, expiresAt: true, revokedAt: true },
  });

  if (
    !session ||
    session.userId !== claims.sub ||
    session.revokedAt !== null ||
    session.expiresAt.getTime() <= Date.now()
  ) {
    return null;
  }

  return { userId: session.userId, sessionId: session.id };
});

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findFirst({
    where: { id: session.userId, deletedAt: null },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
});

/** Use in protected pages / Server Actions: returns the user or redirects. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
