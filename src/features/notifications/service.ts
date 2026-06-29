import "server-only";

import { requireUser } from "@/lib/auth/dal";
import * as repo from "./repository";

export async function listNotifications() {
  const user = await requireUser();
  return repo.listNotifications(user.id);
}

export async function countUnread() {
  const user = await requireUser();
  return repo.countUnread(user.id);
}

export async function markNotificationRead(id: string) {
  const user = await requireUser();
  await repo.markRead(user.id, id);
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  await repo.markAllRead(user.id);
}
