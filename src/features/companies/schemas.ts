import { z } from "zod";

import { companySizeOptions, valuesOf } from "@/lib/enums";
import { optionalText, optionalUrl, requiredText } from "@/lib/zod";

export const companySchema = z.object({
  name: requiredText("Le nom de l'entreprise est requis.", 200),
  website: optionalUrl(),
  sector: optionalText(120),
  size: z.enum(valuesOf(companySizeOptions)).default("UNKNOWN"),
  location: optionalText(160),
  description: optionalText(5000),
  notes: optionalText(5000),
});

export type CompanyInput = z.infer<typeof companySchema>;

export function parseCompanyForm(formData: FormData) {
  return companySchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website"),
    sector: formData.get("sector"),
    size: formData.get("size"),
    location: formData.get("location"),
    description: formData.get("description"),
    notes: formData.get("notes"),
  });
}
