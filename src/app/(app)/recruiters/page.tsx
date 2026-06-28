import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Recruteurs" };

export default function RecruitersPage() {
  return (
    <ComingSoon
      title="Recruteurs"
      description="Vos contacts recruteurs et leurs échanges."
    />
  );
}
