"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import type { ActionState } from "@/lib/result";
import { loginSchema } from "@/features/auth/schemas";

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 5 * 60 * 1000;
const GENERIC_ERROR = "E-mail ou mot de passe incorrect.";

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "local"
  );
}

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Veuillez corriger les champs.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const ip = await clientIp();
  const limit = rateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!limit.success) {
    return {
      status: "error",
      message: "Trop de tentatives. Réessayez dans quelques minutes.",
    };
  }

  const { email, password } = parsed.data;
  const user = await db.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true, passwordHash: true },
  });

  // Always run a verify to keep timing roughly constant even when user is absent.
  const valid = user
    ? await verifyPassword(user.passwordHash, password)
    : await verifyPassword(
        "$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        password,
      );

  if (!user || !valid) {
    logger.warn({ ip }, "Failed login attempt");
    return { status: "error", message: GENERIC_ERROR };
  }

  const h = await headers();
  await createSession(user.id, {
    ip,
    userAgent: h.get("user-agent") ?? undefined,
  });
  logger.info({ userId: user.id }, "User logged in");

  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
