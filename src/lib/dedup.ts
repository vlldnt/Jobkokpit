import { createHash } from "node:crypto";

const normalize = (value?: string | null) =>
  (value ?? "").toLowerCase().trim().replace(/\s+/g, " ");

/**
 * Stable dedup hash for an offer, derived from normalised title + company +
 * location. Shared by manual creation and by the job-search sync so the same
 * offer from different paths collapses to one record.
 */
export function offerDedupHash(
  title: string,
  companyName?: string | null,
  location?: string | null,
): string {
  return createHash("sha256")
    .update(
      `${normalize(title)}|${normalize(companyName)}|${normalize(location)}`,
    )
    .digest("hex");
}
