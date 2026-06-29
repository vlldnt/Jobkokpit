import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { createApplicationAction } from "@/features/applications/actions";
import { listCompanyOptions } from "@/features/companies/service";
import { listOfferOptions } from "@/features/offers/service";

export const metadata: Metadata = { title: "Nouvelle candidature" };

export default async function NewApplicationPage() {
  const [companies, offers] = await Promise.all([
    listCompanyOptions(),
    listOfferOptions(),
  ]);

  return (
    <>
      <PageHeader title="Nouvelle candidature" />
      <ApplicationForm
        action={createApplicationAction}
        submitLabel="Créer"
        companies={companies}
        offers={offers}
      />
    </>
  );
}
