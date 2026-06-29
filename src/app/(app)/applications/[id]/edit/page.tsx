import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { ApplicationTimeline } from "@/features/applications/components/application-timeline";
import { updateApplicationAction } from "@/features/applications/actions";
import {
  getApplication,
  getApplicationEvents,
} from "@/features/applications/service";
import { listCompanyOptions } from "@/features/companies/service";
import { listOfferOptions } from "@/features/offers/service";

export const metadata: Metadata = { title: "Modifier la candidature" };

const toDateInput = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [application, companies, offers, events] = await Promise.all([
    getApplication(id),
    listCompanyOptions(),
    listOfferOptions(),
    getApplicationEvents(id),
  ]);
  if (!application) notFound();

  const action = updateApplicationAction.bind(null, id);

  return (
    <>
      <PageHeader title="Modifier la candidature" />
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <ApplicationForm
          action={action}
          submitLabel="Enregistrer"
          companies={companies}
          offers={offers}
          defaultValues={{
            companyId: application.companyId ?? "",
            offerId: application.offerId ?? "",
            status: application.status,
            appliedAt: toDateInput(application.appliedAt),
            nextActionAt: toDateInput(application.nextActionAt),
            notes: application.notes ?? "",
          }}
        />
        <ApplicationTimeline events={events} />
      </div>
    </>
  );
}
