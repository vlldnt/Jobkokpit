import type { Metadata } from "next";
import { Download } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth/dal";
import { EraseData } from "@/features/settings/components/erase-data";
import { ProfileForm } from "@/features/settings/components/profile-form";

export const metadata: Metadata = { title: "Configuration" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader
        title="Configuration"
        description="Profil et confidentialité (RGPD)."
      />

      <div className="grid max-w-3xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm email={user.email} name={user.name ?? ""} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Données personnelles (RGPD)</CardTitle>
            <CardDescription>
              Exportez l’intégralité de vos données au format JSON.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <a href="/api/rgpd/export">
                <Download />
                Exporter mes données
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Zone de danger</CardTitle>
          </CardHeader>
          <CardContent>
            <EraseData />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
