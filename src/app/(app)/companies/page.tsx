import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Entreprises" };

export default function CompaniesPage() {
  return (
    <ComingSoon
      title="Entreprises"
      description="Suivez les entreprises ciblées."
    />
  );
}
