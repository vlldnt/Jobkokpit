/**
 * Best-effort extraction of a contact email / French phone number from free
 * text (offer description). Used to pre-fill the contact card; the user can
 * always correct it. No network, no dependency.
 */
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(?:(?:\+33|0033)\s?|0)[1-9](?:[\s.\-]?\d{2}){4}/;

export function extractContact(text: string | null | undefined): {
  email: string;
  phone: string;
} {
  const t = text ?? "";
  return {
    email: t.match(EMAIL_RE)?.[0] ?? "",
    phone: t.match(PHONE_RE)?.[0]?.trim() ?? "",
  };
}
