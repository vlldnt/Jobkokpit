import "server-only";

import type { NotificationType } from "@prisma/client";

import { db } from "@/lib/db";

export function createNotification(
  userId: string,
  data: { type: NotificationType; title: string; body?: string },
) {
  return db.notification.create({
    data: {
      userId,
      type: data.type,
      title: data.title,
      body: data.body ?? null,
    },
  });
}

export function listNotifications(userId: string, take = 50) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export function countUnread(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}

export function markRead(userId: string, id: string) {
  return db.notification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export function markAllRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
