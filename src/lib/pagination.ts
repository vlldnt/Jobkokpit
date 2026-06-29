export const DEFAULT_PAGE_SIZE = 20;

export type SearchParams = Record<string, string | string[] | undefined>;

export type Pagination = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Parse a `?page=` search param into Prisma skip/take. 1-indexed pages. */
export function parsePagination(
  searchParams: SearchParams,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Pagination {
  const raw = firstValue(searchParams.page);
  const parsed = Number.parseInt(raw ?? "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

/** Read a trimmed `?q=` search term, or undefined. */
export function parseSearch(searchParams: SearchParams): string | undefined {
  const raw = firstValue(searchParams.q)?.trim();
  return raw ? raw : undefined;
}

export function totalPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
