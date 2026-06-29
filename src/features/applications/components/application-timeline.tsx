import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type TimelineEvent = {
  id: string;
  title: string;
  detail: string | null;
  occurredAt: Date;
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function ApplicationTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Historique</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucun événement.</p>
        ) : (
          <ol className="space-y-4">
            {events.map((e) => (
              <li key={e.id} className="border-border border-l-2 pl-4">
                <p className="text-sm font-medium">{e.title}</p>
                {e.detail && (
                  <p className="text-muted-foreground text-sm">{e.detail}</p>
                )}
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {dateFmt.format(e.occurredAt)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
