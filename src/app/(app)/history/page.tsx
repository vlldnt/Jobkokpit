import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Historique" };

export default function HistoryPage() {
  return (
    <ComingSoon
      title="Historique"
      description="Journal des actions et traitements."
    />
  );
}
