import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { CompanyForm } from "@/features/companies/components/company-form";
import { updateCompanyAction } from "@/features/companies/actions";
import { getCompany } from "@/features/companies/service";

export const metadata: Metadata = { title: "Modifier l'entreprise" };

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  const action = updateCompanyAction.bind(null, id);

  return (
    <>
      <PageHeader title="Modifier l'entreprise" description={company.name} />
      <CompanyForm
        action={action}
        submitLabel="Enregistrer"
        defaultValues={{
          name: company.name,
          website: company.website ?? "",
          sector: company.sector ?? "",
          size: company.size,
          location: company.location ?? "",
          description: company.description ?? "",
          notes: company.notes ?? "",
        }}
      />
    </>
  );
}
