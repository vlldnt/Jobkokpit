import { z } from "zod";

/**
 * Expected structured output of the analysis agent. Tolerant by design: a
 * model occasionally omits or mistypes a field, and a partial analysis is more
 * useful than a hard failure, so each field falls back to a safe default.
 */
export const offerAnalysisSchema = z.object({
  summary: z.string().catch(""),
  execSummary: z.string().catch(""),
  skills: z.array(z.string()).catch([]),
  technologies: z.array(z.string()).catch([]),
  benefits: z.array(z.string()).catch([]),
  salaryEstimate: z.string().catch(""),
  remoteAssessment: z.string().catch(""),
  seniorityAssessment: z.string().catch(""),
  compatibilityScore: z.coerce
    .number()
    .int()
    .min(0)
    .max(100)
    .nullable()
    .catch(null),
  suggestions: z.array(z.string()).catch([]),
});

export type OfferAnalysisData = z.infer<typeof offerAnalysisSchema>;
