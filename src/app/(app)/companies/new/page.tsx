import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { CompanyForm } from "@/features/companies/components/company-form";
import { createCompanyAction } from "@/features/companies/actions";

export const metadata: Metadata = { title: "Nouvelle entreprise" };

export default function NewCompanyPage() {
  return (
    <>
      <PageHeader title="Nouvelle entreprise" />
      <CompanyForm action={createCompanyAction} submitLabel="Créer" />
    </>
  );
}
