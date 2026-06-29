/**
 * Deterministic data-quality validators (Agent 5). Pure functions, no I/O —
 * easy to unit test and reused by the quality scan service.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// French + international friendly: digits, spaces, +, -, ., (), 8–20 chars.
const PHONE_RE = /^\+?[0-9 ().-]{8,20}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return (
    PHONE_RE.test(value.trim()) && digits.length >= 8 && digits.length <= 15
  );
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
