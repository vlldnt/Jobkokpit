import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { labelFor } from "@/lib/enums";
import {
  addEventAction,
  scheduleFollowUpAction,
} from "@/features/applications/event-actions";
import { ApplicationActions } from "@/features/applications/components/application-actions";
import { ApplicationTimeline } from "@/features/applications/components/application-timeline";
import { getApplicationEvents } from "@/features/applications/service";
import { getApplicationDetail } from "@/features/applications/orchestration";

export const metadata: Metadata = { title: "Candidature" };

const fmt = (d: Date | null) => (d ? d.toLocaleDateString("fr-FR") : "—");

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [application, events] = await Promise.all([
    getApplicationDetail(id),
    getApplicationEvents(id),
  ]);
  if (!application) notFound();

  const title =
    application.offer?.title ?? application.company?.name ?? "Candidature";

  return (
    <>
      <PageHeader
        title={title}
        description={application.company?.name ?? undefined}
        action={
          <Button asChild variant="ghost">
            <Link href={`/applications/${id}/edit`}>
              <Pencil />
              Modifier
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Détails</CardTitle>
              <Badge>{labelFor("applicationStatus", application.status)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border-b py-2">
              <span className="text-muted-foreground">Offre</span>
              {application.offer ? (
                <Link
                  href={`/offers/${application.offer.id}`}
                  className="font-medium hover:underline"
                >
                  {application.offer.title}
                </Link>
              ) : (
                <span className="font-medium">—</span>
              )}
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="text-muted-foreground">Postulé le</span>
              <span className="font-medium">{fmt(application.appliedAt)}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="text-muted-foreground">Prochaine action</span>
              <span className="font-medium">
                {fmt(application.nextActionAt)}
              </span>
            </div>
            {application.notes && (
              <p className="text-muted-foreground pt-2 whitespace-pre-wrap">
                {application.notes}
              </p>
            )}
          </CardContent>
        </Card>

        <ApplicationTimeline events={events} />
      </div>

      <ApplicationActions
        addEvent={addEventAction.bind(null, id)}
        scheduleFollowUp={scheduleFollowUpAction.bind(null, id)}
      />
    </>
  );
}
