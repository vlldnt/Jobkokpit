import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Candidatures" };

export default function ApplicationsPage() {
  return (
    <ComingSoon
      title="Candidatures"
      description="Gérez le pipeline de vos candidatures."
    />
  );
}
