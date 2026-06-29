"use server";

import { revalidatePath } from "next/cache";

import { markAllNotificationsRead, markNotificationRead } from "./service";

export async function markReadAction(id: string) {
  await markNotificationRead(id);
  revalidatePath("/notifications");
}

export async function markAllReadAction() {
  await markAllNotificationsRead();
  revalidatePath("/notifications");
}
