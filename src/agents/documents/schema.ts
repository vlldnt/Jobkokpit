import { z } from "zod";

/**
 * Structured output of the application-documents agent. Tolerant by design:
 * a partial result (e.g. only the cover letter) is more useful than a hard
 * failure, so each field falls back to an empty string.
 */
export const applicationDocsSchema = z.object({
  coverLetter: z.string().catch(""),
  email: z.string().catch(""),
});

export type ApplicationDocsData = z.infer<typeof applicationDocsSchema>;
