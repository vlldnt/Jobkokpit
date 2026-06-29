import type { OfferAnalysis } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ChipList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="outline">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function scoreVariant(score: number) {
  if (score >= 75) return "success" as const;
  if (score >= 50) return "info" as const;
  return "warning" as const;
}

export function OfferAnalysisCard({ analysis }: { analysis: OfferAnalysis }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Analyse IA</CardTitle>
            <CardDescription>
              {analysis.execSummary || "Synthèse de l'offre"}
            </CardDescription>
          </div>
          {analysis.compatibilityScore !== null && (
            <Badge variant={scoreVariant(analysis.compatibilityScore)}>
              Compatibilité {analysis.compatibilityScore}/100
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-relaxed">{analysis.summary}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <ChipList label="Technologies" items={analysis.technologies} />
          <ChipList label="Compétences" items={analysis.skills} />
          <ChipList label="Avantages" items={analysis.benefits} />
        </div>

        <div className="text-muted-foreground grid gap-2 text-sm sm:grid-cols-3">
          {analysis.salaryEstimate && (
            <p>
              <span className="text-foreground font-medium">Salaire : </span>
              {analysis.salaryEstimate}
            </p>
          )}
          {analysis.remoteAssessment && (
            <p>
              <span className="text-foreground font-medium">
                Télétravail :{" "}
              </span>
              {analysis.remoteAssessment}
            </p>
          )}
          {analysis.seniorityAssessment && (
            <p>
              <span className="text-foreground font-medium">Niveau : </span>
              {analysis.seniorityAssessment}
            </p>
          )}
        </div>

        {analysis.suggestions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium">
              Suggestions
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {analysis.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-muted-foreground border-t pt-3 text-xs">
          {analysis.model} · {analysis.inputTokens + analysis.outputTokens}{" "}
          tokens · {analysis.updatedAt.toLocaleString("fr-FR")}
        </p>
      </CardContent>
    </Card>
  );
}
