import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Offres" };

export default function OffersPage() {
  return (
    <ComingSoon
      title="Offres"
      description="Centralisez et analysez les offres d'emploi."
    />
  );
}
