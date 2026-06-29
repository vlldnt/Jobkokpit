import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { updateRecruiterAction } from "@/features/recruiters/actions";
import { RecruiterForm } from "@/features/recruiters/components/recruiter-form";
import { getRecruiter } from "@/features/recruiters/service";
import { listCompanyOptions } from "@/features/companies/service";

export const metadata: Metadata = { title: "Modifier le recruteur" };

export default async function EditRecruiterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [recruiter, companies] = await Promise.all([
    getRecruiter(id),
    listCompanyOptions(),
  ]);
  if (!recruiter) notFound();

  const action = updateRecruiterAction.bind(null, id);

  return (
    <>
      <PageHeader title="Modifier le recruteur" description={recruiter.name} />
      <RecruiterForm
        action={action}
        submitLabel="Enregistrer"
        companies={companies}
        defaultValues={{
          name: recruiter.name,
          email: recruiter.email ?? "",
          phone: recruiter.phone ?? "",
          linkedinUrl: recruiter.linkedinUrl ?? "",
          companyId: recruiter.companyId ?? "",
          notes: recruiter.notes ?? "",
        }}
      />
    </>
  );
}
