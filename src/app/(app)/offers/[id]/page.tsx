import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { labelFor } from "@/lib/enums";
import { AnalyzeButton } from "@/features/offers/components/analyze-button";
import { OfferAnalysisCard } from "@/features/offers/components/offer-analysis";
import { getOfferDetail } from "@/features/offers/service";

export const metadata: Metadata = { title: "Offre" };

const fmtDate = (d: Date | null) => (d ? d.toLocaleDateString("fr-FR") : "—");

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = await getOfferDetail(id);
  if (!offer) notFound();

  const salary =
    offer.salaryMin || offer.salaryMax
      ? `${offer.salaryMin ?? "?"} – ${offer.salaryMax ?? "?"} ${offer.currency ?? ""}`
      : "—";

  return (
    <>
      <PageHeader
        title={offer.title}
        description={offer.company?.name ?? undefined}
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href={`/offers/${offer.id}/edit`}>
                <Pencil />
                Modifier
              </Link>
            </Button>
            <AnalyzeButton offerId={offer.id} hasAnalysis={!!offer.analysis} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Détails</CardTitle>
              <Badge>{labelFor("offerStatus", offer.status)}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Row label="Entreprise" value={offer.company?.name ?? "—"} />
            <Row label="Localisation" value={offer.location ?? "—"} />
            <Row label="Télétravail" value={labelFor("remote", offer.remote)} />
            <Row
              label="Niveau"
              value={labelFor("seniority", offer.seniority)}
            />
            <Row label="Contrat" value={offer.contractType ?? "—"} />
            <Row label="Salaire" value={salary} />
            <Row label="Source" value={labelFor("offerSource", offer.source)} />
            <Row label="Publiée le" value={fmtDate(offer.postedAt)} />
            <Row label="Expire le" value={fmtDate(offer.expiresAt)} />
            {offer.url && (
              <div className="pt-3">
                <Button asChild variant="outline" size="sm">
                  <a href={offer.url} target="_blank" rel="noopener noreferrer">
                    Voir l’annonce d’origine
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {offer.analysis ? (
          <OfferAnalysisCard analysis={offer.analysis} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Analyse IA</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Aucune analyse pour l’instant. Lancez l’analyse pour obtenir un
              résumé, les compétences clés et un score de compatibilité.
            </CardContent>
          </Card>
        )}
      </div>

      {offer.description && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{offer.description}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
