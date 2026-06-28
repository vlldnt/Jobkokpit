import "server-only";

import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  SESSION_COOKIE,
  signSession,
  verifySessionToken,
} from "@/lib/auth/token";

export { SESSION_COOKIE };

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function cookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    expires: expiresAt,
    path: "/",
  };
}

/** Create a DB session and set the signed cookie. */
export async function createSession(
  userId: string,
  meta?: { ip?: string; userAgent?: string },
): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await db.session.create({
    data: { userId, expiresAt, ip: meta?.ip, userAgent: meta?.userAgent },
    select: { id: true },
  });
  const token = await signSession({ sid: session.id, sub: userId }, expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

/** Revoke the current DB session (if any) and clear the cookie. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const claims = await verifySessionToken(token);
  if (claims) {
    await db.session
      .updateMany({
        where: { id: claims.sid, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => undefined);
  }
  cookieStore.delete(SESSION_COOKIE);
}
