"use server";

import { revalidatePath } from "next/cache";
import type { ApplicationEventType } from "@prisma/client";

import { toActionError } from "@/lib/action-result";
import type { ActionState } from "@/lib/result";
import { logApplicationEvent, scheduleFollowUp } from "./orchestration";

const EVENT_TYPES: ApplicationEventType[] = [
  "NOTE",
  "EMAIL_SENT",
  "EMAIL_RECEIVED",
  "INTERVIEW_SCHEDULED",
  "OTHER",
];

export async function addEventAction(
  applicationId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const typeRaw = String(formData.get("type") ?? "NOTE");
  const type = (
    EVENT_TYPES.includes(typeRaw as ApplicationEventType) ? typeRaw : "NOTE"
  ) as ApplicationEventType;
  const title = String(formData.get("title") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();

  if (!title) {
    return {
      status: "error",
      message: "Titre requis.",
      fieldErrors: { title: ["Titre requis."] },
    };
  }

  try {
    await logApplicationEvent(applicationId, {
      type,
      title,
      detail: detail || undefined,
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(`/applications/${applicationId}`);
  return { status: "success", message: "Événement ajouté." };
}

export async function scheduleFollowUpAction(
  applicationId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const dateStr = String(formData.get("date") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!dateStr) {
    return {
      status: "error",
      message: "Date requise.",
      fieldErrors: { date: ["Date requise."] },
    };
  }
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return {
      status: "error",
      message: "Date invalide.",
      fieldErrors: { date: ["Date invalide."] },
    };
  }

  try {
    await scheduleFollowUp(applicationId, date, note || undefined);
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(`/applications/${applicationId}`);
  return { status: "success", message: "Relance planifiée." };
}
