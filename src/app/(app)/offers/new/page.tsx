import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { OfferForm } from "@/features/offers/components/offer-form";
import { createOfferAction } from "@/features/offers/actions";
import { listCompanyOptions } from "@/features/companies/service";

export const metadata: Metadata = { title: "Nouvelle offre" };

export default async function NewOfferPage() {
  const companies = await listCompanyOptions();

  return (
    <>
      <PageHeader title="Nouvelle offre" />
      <OfferForm
        action={createOfferAction}
        submitLabel="Créer"
        companies={companies}
      />
    </>
  );
}
