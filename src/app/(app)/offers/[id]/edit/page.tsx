import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { OfferForm } from "@/features/offers/components/offer-form";
import { updateOfferAction } from "@/features/offers/actions";
import { getOffer } from "@/features/offers/service";
import { listCompanyOptions } from "@/features/companies/service";

export const metadata: Metadata = { title: "Modifier l'offre" };

const toDateInput = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [offer, companies] = await Promise.all([
    getOffer(id),
    listCompanyOptions(),
  ]);
  if (!offer) notFound();

  const action = updateOfferAction.bind(null, id);

  return (
    <>
      <PageHeader title="Modifier l'offre" description={offer.title} />
      <OfferForm
        action={action}
        submitLabel="Enregistrer"
        companies={companies}
        defaultValues={{
          title: offer.title,
          companyId: offer.companyId ?? "",
          status: offer.status,
          source: offer.source,
          remote: offer.remote,
          seniority: offer.seniority,
          contractType: offer.contractType ?? "",
          location: offer.location ?? "",
          url: offer.url ?? "",
          salaryMin: offer.salaryMin?.toString() ?? "",
          salaryMax: offer.salaryMax?.toString() ?? "",
          currency: offer.currency ?? "EUR",
          postedAt: toDateInput(offer.postedAt),
          expiresAt: toDateInput(offer.expiresAt),
          description: offer.description ?? "",
        }}
      />
    </>
  );
}
