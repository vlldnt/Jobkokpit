import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Entretiens" };

export default function InterviewsPage() {
  return (
    <ComingSoon
      title="Entretiens"
      description="Préparez vos entretiens avec l'IA."
    />
  );
}
