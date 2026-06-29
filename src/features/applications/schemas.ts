import { z } from "zod";

import { applicationStatusOptions, valuesOf } from "@/lib/enums";
import { optionalDate, optionalText } from "@/lib/zod";

export const applicationSchema = z.object({
  companyId: optionalText(40),
  offerId: optionalText(40),
  status: z.enum(valuesOf(applicationStatusOptions)).default("DRAFT"),
  appliedAt: optionalDate(),
  nextActionAt: optionalDate(),
  notes: optionalText(5000),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export function parseApplicationForm(formData: FormData) {
  return applicationSchema.safeParse({
    companyId: formData.get("companyId"),
    offerId: formData.get("offerId"),
    status: formData.get("status"),
    appliedAt: formData.get("appliedAt"),
    nextActionAt: formData.get("nextActionAt"),
    notes: formData.get("notes"),
  });
}
