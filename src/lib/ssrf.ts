import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { ExternalServiceError, ValidationError } from "@/core/errors/app-error";

/**
 * SSRF protection for user-supplied URLs (offer import by URL). We only allow
 * http(s), and we reject any URL whose host resolves to a private, loopback,
 * link-local or otherwise non-public address — re-checking on every redirect
 * hop so an open redirect can't pivot to the internal network.
 */

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;
  const a = parts[0]!;
  const b = parts[1]!;
  return (
    a === 0 || // 0.0.0.0/8
    a === 10 || // private
    a === 127 || // loopback
    (a === 169 && b === 254) || // link-local
    (a === 172 && b >= 16 && b <= 31) || // private
    (a === 192 && b === 168) || // private
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    a >= 224 // multicast / reserved
  );
}

function isPrivateIPv6(ip: string): boolean {
  const addr = ip.toLowerCase();
  if (addr === "::1" || addr === "::") return true;
  // IPv4-mapped (::ffff:a.b.c.d)
  const mapped = addr.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped?.[1]) return isPrivateIPv4(mapped[1]);
  return (
    addr.startsWith("fc") || // unique local fc00::/7
    addr.startsWith("fd") ||
    addr.startsWith("fe8") || // link-local fe80::/10
    addr.startsWith("fe9") ||
    addr.startsWith("fea") ||
    addr.startsWith("feb")
  );
}

function isBlockedAddress(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) return isPrivateIPv4(ip);
  if (v === 6) return isPrivateIPv6(ip);
  return true; // not a parseable IP → block defensively
}

/** Validate protocol + resolved IPs. Returns the parsed URL or throws. */
export async function assertSafeUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ValidationError("URL invalide.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ValidationError("Seules les URL http(s) sont autorisées.");
  }

  const host = url.hostname;
  if (isIP(host)) {
    if (isBlockedAddress(host)) {
      throw new ValidationError("Adresse IP non autorisée.");
    }
    return url;
  }

  let records: { address: string }[];
  try {
    records = await lookup(host, { all: true });
  } catch {
    throw new ExternalServiceError("Hôte introuvable.");
  }
  if (
    records.length === 0 ||
    records.some((r) => isBlockedAddress(r.address))
  ) {
    throw new ValidationError("Hôte non autorisé (réseau interne).");
  }
  return url;
}

/**
 * Fetch text from a user-supplied URL with SSRF protection, a timeout, a size
 * cap, and manual redirect re-validation.
 */
export async function safeFetchText(
  raw: string,
  opts: { maxBytes?: number; timeoutMs?: number; maxRedirects?: number } = {},
): Promise<{ url: string; text: string }> {
  const maxBytes = opts.maxBytes ?? 1_000_000;
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const maxRedirects = opts.maxRedirects ?? 3;

  let current = raw;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    const url = await assertSafeUrl(current);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "JobAICRM/1.0 (+offer-import)" },
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) throw new ExternalServiceError("Redirection invalide.");
        current = new URL(location, url).toString();
        continue;
      }
      if (!res.ok) {
        throw new ExternalServiceError(
          `Récupération impossible (${res.status}).`,
        );
      }

      const buf = await res.arrayBuffer();
      const text = Buffer.from(buf.slice(0, maxBytes)).toString("utf8");
      return { url: url.toString(), text };
    } finally {
      clearTimeout(timer);
    }
  }
  throw new ExternalServiceError("Trop de redirections.");
}
