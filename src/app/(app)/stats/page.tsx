import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Statistiques" };

export default function StatsPage() {
  return (
    <ComingSoon
      title="Statistiques"
      description="Indicateurs et tendances de votre recherche."
    />
  );
}
