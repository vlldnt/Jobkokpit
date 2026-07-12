import Link from "next/link";

import { Button } from "@/components/ui/button";

function buildHref(
  basePath: string,
  page: number,
  query?: string,
  extraParams?: Record<string, string>,
): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  for (const [key, value] of Object.entries(extraParams ?? {})) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function PaginationNav({
  basePath,
  page,
  totalPages,
  query,
  extraParams,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  query?: string;
  /** Paramètres d'URL à préserver entre les pages (ex. filtre rapide). */
  extraParams?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-muted-foreground text-sm">
        Page {page} sur {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          asChild={hasPrev}
          variant="outline"
          size="sm"
          disabled={!hasPrev}
        >
          {hasPrev ? (
            <Link href={buildHref(basePath, page - 1, query, extraParams)}>
              Précédent
            </Link>
          ) : (
            <span>Précédent</span>
          )}
        </Button>
        <Button
          asChild={hasNext}
          variant="outline"
          size="sm"
          disabled={!hasNext}
        >
          {hasNext ? (
            <Link href={buildHref(basePath, page + 1, query, extraParams)}>
              Suivant
            </Link>
          ) : (
            <span>Suivant</span>
          )}
        </Button>
      </div>
    </div>
  );
}
