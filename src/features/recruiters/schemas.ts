import { z } from "zod";

import {
  optionalEmail,
  optionalText,
  optionalUrl,
  requiredText,
} from "@/lib/zod";

export const recruiterSchema = z.object({
  name: requiredText("Le nom du recruteur est requis.", 200),
  email: optionalEmail(),
  phone: optionalText(40),
  linkedinUrl: optionalUrl(),
  companyId: optionalText(40),
  notes: optionalText(5000),
});

export type RecruiterInput = z.infer<typeof recruiterSchema>;

export function parseRecruiterForm(formData: FormData) {
  return recruiterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    linkedinUrl: formData.get("linkedinUrl"),
    companyId: formData.get("companyId"),
    notes: formData.get("notes"),
  });
}
