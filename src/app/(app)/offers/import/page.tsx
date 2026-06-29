import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { OfferImportPanels } from "@/features/offers/components/import-panels";

export const metadata: Metadata = { title: "Importer des offres" };

export default function ImportOffersPage() {
  return (
    <>
      <PageHeader
        title="Importer & synchroniser"
        description="Récupérez des offres via les API ou par import IA (URL / copier-coller)."
        action={
          <Button asChild variant="ghost">
            <Link href="/offers">
              <ArrowLeft />
              Retour
            </Link>
          </Button>
        }
      />
      <OfferImportPanels />
    </>
  );
}
