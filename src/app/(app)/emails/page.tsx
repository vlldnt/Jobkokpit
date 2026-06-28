import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "E-mails" };

export default function EmailsPage() {
  return (
    <ComingSoon
      title="E-mails"
      description="Échanges liés à vos candidatures."
    />
  );
}
