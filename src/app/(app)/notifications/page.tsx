import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return <ComingSoon title="Notifications" description="Alertes et rappels." />;
}
