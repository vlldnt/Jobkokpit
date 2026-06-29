import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { createRecruiterAction } from "@/features/recruiters/actions";
import { RecruiterForm } from "@/features/recruiters/components/recruiter-form";
import { listCompanyOptions } from "@/features/companies/service";

export const metadata: Metadata = { title: "Nouveau recruteur" };

export default async function NewRecruiterPage() {
  const companies = await listCompanyOptions();
  return (
    <>
      <PageHeader title="Nouveau recruteur" />
      <RecruiterForm
        action={createRecruiterAction}
        submitLabel="Créer"
        companies={companies}
      />
    </>
  );
}
