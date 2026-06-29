import { z } from "zod";

import { documentTypeOptions, valuesOf } from "@/lib/enums";
import { optionalText, requiredText } from "@/lib/zod";

export const documentSchema = z.object({
  title: requiredText("Le titre est requis.", 200),
  type: z.enum(valuesOf(documentTypeOptions)).default("OTHER"),
  applicationId: optionalText(40),
  content: optionalText(50000),
});

export type DocumentInput = z.infer<typeof documentSchema>;

export function parseDocumentForm(formData: FormData) {
  return documentSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    applicationId: formData.get("applicationId"),
    content: formData.get("content"),
  });
}
