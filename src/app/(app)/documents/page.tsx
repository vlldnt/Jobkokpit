import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Documents" };

export default function DocumentsPage() {
  return (
    <ComingSoon
      title="Documents"
      description="CV, lettres de motivation et pièces jointes."
    />
  );
}
