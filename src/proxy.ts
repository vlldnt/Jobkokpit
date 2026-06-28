import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";

/**
 * Runs before every (non-static) request. Two responsibilities:
 *  1. Security headers — strict CSP with a per-request nonce for scripts,
 *     plus clickjacking / sniffing / referrer / permissions hardening.
 *  2. Optimistic auth gate — signature-only session check (no DB) to redirect
 *     unauthenticated users. The authoritative check lives in the DAL
 *     (`getSession`), close to the data.
 *
 * Note (Next.js 16): this file replaces the former `middleware.ts`. It runs on
 * the Node.js runtime.
 */
const PUBLIC_PATHS = new Set(["/login"]);

function buildCsp(nonce: string, isDev: boolean): string {
  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Nonces don't apply to style *attributes* (used by React/Tailwind), so we
    // allow inline styles. Style-injection XSS is far lower risk than scripts.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self' data:`,
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    ...(isDev ? [] : [`upgrade-insecure-requests`]),
  ];
  return directives.join("; ");
}

function applySecurityHeaders(
  headers: Headers,
  csp: string,
  isDev: boolean,
): void {
  headers.set("Content-Security-Policy", csp);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  );
  if (!isDev) {
    headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const isDev = process.env.NODE_ENV === "development";
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce, isDev);

  const { pathname } = request.nextUrl;
  const claims = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const isAuthed = claims !== null;
  const isPublic = PUBLIC_PATHS.has(pathname);

  // Root: route to the right place.
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAuthed ? "/dashboard" : "/login", request.url),
    );
  }
  if (!isAuthed && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuthed && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Forward the nonce so Next can attach it to its own scripts during SSR.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  applySecurityHeaders(response.headers, csp, isDev);
  return response;
}

export const config = {
  matcher: [
    /*
     * All paths except: API routes (handle their own auth/headers), Next.js
     * internals, and static asset files.
     */
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
