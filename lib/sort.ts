export type SortDirection = "asc" | "desc";
export type PostSortField = "date" | "views" | "likes";

export const POST_SORT_FIELDS: { value: PostSortField; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "views", label: "Views" },
  { value: "likes", label: "Likes" },
];

export const DIRECTIONS: { value: SortDirection; label: string }[] = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

const POST_COLUMNS: Record<PostSortField, string> = {
  date: "tweet_created_at",
  views: "view_count",
  likes: "like_count",
};

export const POST_DATE_COLUMN = "tweet_created_at";

type Param = string | string[] | undefined;

function first(value: Param): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parsePostSortField(
  value: Param,
  fallback: PostSortField = "views",
): PostSortField {
  const found = first(value);
  return found === "date" || found === "likes" || found === "views" ? found : fallback;
}

export function parseDirection(value: Param, fallback: SortDirection = "desc"): SortDirection {
  return first(value) === "asc" ? "asc" : first(value) === "desc" ? "desc" : fallback;
}

export function postOrder(field: PostSortField, direction: SortDirection): string {
  return `${POST_COLUMNS[field]}.${direction}`;
}

export function repostOrder(direction: SortDirection): string {
  return `followers.${direction}`;
}

export type DateRange = { from?: string; to?: string };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateRange(from: Param, to: Param): DateRange {
  const start = first(from);
  const end = first(to);

  return {
    from: start && DATE_PATTERN.test(start) ? start : undefined,
    to: end && DATE_PATTERN.test(end) ? end : undefined,
  };
}

/**
 * PostgREST filter for a day-inclusive range. `to` is pushed to the end of the
 * selected day so a single-day range still matches that day's rows.
 */
export function dateRangeFilter(column: string, range: DateRange): string {
  const clauses: string[] = [];

  if (range.from) clauses.push(`&${column}=gte.${range.from}T00:00:00Z`);
  if (range.to) clauses.push(`&${column}=lte.${range.to}T23:59:59Z`);

  return clauses.join("");
}

export function parsePaidOnly(value: Param): boolean {
  return first(value) === "1";
}

/** PostgREST filter for X's paid-partnership disclosure. */
export function paidPromotionFilter(paidOnly: boolean): string {
  return paidOnly ? "&content_disclosure->advertising->>isPaidPromotion=eq.true" : "";
}

export function buildQueryString(values: Record<string, string | undefined>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
