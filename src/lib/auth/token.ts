import { SignJWT, jwtVerify } from "jose";

import { env } from "@/lib/env";

/**
 * Session cookie name + signed-token helpers. Deliberately free of any database
 * import so it can be used in `proxy.ts` for fast, optimistic (signature-only)
 * checks without pulling Prisma into the proxy bundle.
 */
export const SESSION_COOKIE = "session";
const ALG = "HS256";

const encodedSecret = new TextEncoder().encode(env.SESSION_SECRET);

export type SessionClaims = {
  /** session row id */
  sid: string;
  /** user id */
  sub: string;
};

export async function signSession(
  claims: SessionClaims,
  expiresAt: Date,
): Promise<string> {
  return new SignJWT({ sid: claims.sid })
    .setProtectedHeader({ alg: ALG })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(encodedSecret);
}

/** Verify the signed cookie. Returns claims only if the signature is valid. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedSecret, {
      algorithms: [ALG],
    });
    if (typeof payload.sub !== "string" || typeof payload.sid !== "string") {
      return null;
    }
    return { sub: payload.sub, sid: payload.sid };
  } catch {
    return null;
  }
}
