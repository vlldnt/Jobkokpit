import { z } from "zod";

import {
  offerSourceOptions,
  offerStatusOptions,
  remoteOptions,
  seniorityOptions,
  valuesOf,
} from "@/lib/enums";
import {
  optionalDate,
  optionalInt,
  optionalText,
  optionalUrl,
  requiredText,
} from "@/lib/zod";

export const offerSchema = z
  .object({
    title: requiredText("L'intitulé du poste est requis.", 200),
    companyId: optionalText(40),
    description: optionalText(20000),
    url: optionalUrl(),
    location: optionalText(160),
    remote: z.enum(valuesOf(remoteOptions)).default("UNKNOWN"),
    contractType: optionalText(80),
    salaryMin: optionalInt(),
    salaryMax: optionalInt(),
    currency: optionalText(8),
    seniority: z.enum(valuesOf(seniorityOptions)).default("UNKNOWN"),
    source: z.enum(valuesOf(offerSourceOptions)).default("MANUAL"),
    status: z.enum(valuesOf(offerStatusOptions)).default("NEW"),
    postedAt: optionalDate(),
    expiresAt: optionalDate(),
  })
  .superRefine((val, ctx) => {
    if (
      val.salaryMin != null &&
      val.salaryMax != null &&
      val.salaryMax < val.salaryMin
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "Le salaire maximum doit être supérieur ou égal au minimum.",
      });
    }
  });

export type OfferInput = z.infer<typeof offerSchema>;

export function parseOfferForm(formData: FormData) {
  return offerSchema.safeParse({
    title: formData.get("title"),
    companyId: formData.get("companyId"),
    description: formData.get("description"),
    url: formData.get("url"),
    location: formData.get("location"),
    remote: formData.get("remote"),
    contractType: formData.get("contractType"),
    salaryMin: formData.get("salaryMin"),
    salaryMax: formData.get("salaryMax"),
    currency: formData.get("currency"),
    seniority: formData.get("seniority"),
    source: formData.get("source"),
    status: formData.get("status"),
    postedAt: formData.get("postedAt"),
    expiresAt: formData.get("expiresAt"),
  });
}
