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

export type Disclosure = "paid" | "unpaid";

/** `paid=1` keeps paid partnerships, `paid=0` keeps everything else. */
export function parseDisclosure(value: Param): Disclosure | undefined {
  const found = first(value);
  if (found === "1") return "paid";
  if (found === "0") return "unpaid";
  return undefined;
}

export function disclosureParam(disclosure: Disclosure | undefined): string | undefined {
  if (disclosure === "paid") return "1";
  if (disclosure === "unpaid") return "0";
  return undefined;
}

/** PostgREST filter for X's paid-partnership disclosure. */
export function disclosureFilter(disclosure: Disclosure | undefined): string {
  const flag = "content_disclosure->advertising->>isPaidPromotion";

  if (disclosure === "paid") return `&${flag}=eq.true`;
  // Most quotes carry no disclosure at all, so a missing flag counts as non-paid.
  if (disclosure === "unpaid") return `&or=(${flag}.is.null,${flag}.neq.true)`;
  return "";
}

export function buildQueryString(values: Record<string, string | undefined>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export const WINDOW_PRESETS = [30, 60, 90, 120] as const;

/** Minutes since the original post, used for the "first N minutes" filter. */
export function parseWindowMinutes(value: Param): number | undefined {
  const found = first(value);
  if (!found) return undefined;

  const minutes = Number(found);
  return Number.isInteger(minutes) && minutes > 0 && minutes <= 100000 ? minutes : undefined;
}

/**
 * PostgREST filter for rows inside the first `minutes` after `startIso`.
 * The window is inclusive of the post instant and of its closing edge.
 */
export function windowFilter(
  column: string,
  startIso: string | undefined,
  minutes: number | undefined,
): string {
  if (!startIso || !minutes) return "";

  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return "";

  const end = new Date(start.getTime() + minutes * 60_000);

  return `&${column}=gte.${start.toISOString()}&${column}=lte.${end.toISOString()}`;
}
