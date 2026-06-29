import Link from "next/link";

import { Button } from "@/components/ui/button";

function buildHref(basePath: string, page: number, query?: string): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function PaginationNav({
  basePath,
  page,
  totalPages,
  query,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  query?: string;
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
            <Link href={buildHref(basePath, page - 1, query)}>Précédent</Link>
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
            <Link href={buildHref(basePath, page + 1, query)}>Suivant</Link>
          ) : (
            <span>Suivant</span>
          )}
        </Button>
      </div>
    </div>
  );
}
