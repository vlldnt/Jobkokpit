import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  markAllReadAction,
  markReadAction,
} from "@/features/notifications/actions";
import { listNotifications } from "@/features/notifications/service";

export const metadata: Metadata = { title: "Notifications" };

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function NotificationsPage() {
  const notifications = await listNotifications();
  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Alertes, rappels et synchronisations."
        action={
          hasUnread ? (
            <form action={markAllReadAction}>
              <Button type="submit" variant="outline">
                Tout marquer comme lu
              </Button>
            </form>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          title="Aucune notification"
          description="Vos rappels de relance et synchronisations apparaîtront ici."
        />
      ) : (
        <ul className="divide-y rounded-xl border">
          {notifications.map((n) => (
            <li
              key={n.id}
              className="flex items-start justify-between gap-4 p-4"
              data-unread={!n.readAt ? "" : undefined}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.readAt && <Badge variant="info">Nouveau</Badge>}
                </div>
                {n.body && (
                  <p className="text-muted-foreground text-sm">{n.body}</p>
                )}
                <p className="text-muted-foreground text-xs">
                  {dateFmt.format(n.createdAt)}
                </p>
              </div>
              {!n.readAt && (
                <form action={markReadAction.bind(null, n.id)}>
                  <Button type="submit" variant="ghost" size="sm">
                    Marquer lu
                  </Button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
