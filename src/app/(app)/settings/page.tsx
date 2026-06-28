import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Configuration" };

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Configuration"
      description="Préférences, sources et confidentialité (RGPD)."
    />
  );
}
