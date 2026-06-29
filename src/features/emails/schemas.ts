import { z } from "zod";

import { optionalDate, optionalText, requiredText } from "@/lib/zod";

export const threadSchema = z.object({
  subject: requiredText("Le sujet est requis.", 300),
  applicationId: optionalText(40),
});

export type ThreadInput = z.infer<typeof threadSchema>;

export function parseThreadForm(formData: FormData) {
  return threadSchema.safeParse({
    subject: formData.get("subject"),
    applicationId: formData.get("applicationId"),
  });
}

export const messageSchema = z.object({
  direction: z.enum(["INBOUND", "OUTBOUND"]).default("OUTBOUND"),
  fromAddr: z.string().trim().min(1, "Expéditeur requis.").max(320),
  toAddr: z.string().trim().min(1, "Destinataire requis.").max(320),
  subject: optionalText(300),
  body: optionalText(50000),
  sentAt: optionalDate(),
});

export type MessageInput = z.infer<typeof messageSchema>;

export function parseMessageForm(formData: FormData) {
  return messageSchema.safeParse({
    direction: formData.get("direction"),
    fromAddr: formData.get("fromAddr"),
    toAddr: formData.get("toAddr"),
    subject: formData.get("subject"),
    body: formData.get("body"),
    sentAt: formData.get("sentAt"),
  });
}
