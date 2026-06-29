import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { QualityRunner } from "@/features/quality/components/quality-runner";

export const metadata: Metadata = { title: "Contrôle qualité" };

export default function QualityPage() {
  return (
    <>
      <PageHeader
        title="Contrôle qualité"
        description="Détecte doublons, coordonnées invalides, liens cassés et offres expirées."
      />
      <QualityRunner />
    </>
  );
}
