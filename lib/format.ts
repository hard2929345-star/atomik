const IST_TIME_ZONE = "Asia/Kolkata";

export function formatCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 10_000) {
    const short = (value / 1000).toFixed(1).replace(/\.0$/, "");
    return `${short}K`;
  }
  if (value < 1_000_000) return `${Math.floor(value / 1000)}K`;
  const millions = (value / 1_000_000).toFixed(1).replace(/\.0$/, "");
  return `${millions}M`;
}

function istParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: IST_TIME_ZONE,
  }).formatToParts(new Date(iso));

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    time: `${value("hour")}:${value("minute")} ${value("dayPeriod").toUpperCase()}`,
    day: value("day"),
    month: value("month"),
    year: value("year"),
  };
}

/** "5:45 PM · Sep 1, 2026 IST" */
export function formatIstDateTime(iso: string): string {
  const { time, month, day, year } = istParts(iso);
  return `${time} · ${month} ${day}, ${year} IST`;
}

/** "Sep 1, 2026 IST" */
export function formatIstDate(iso: string): string {
  const { month, day, year } = istParts(iso);
  return `${month} ${day}, ${year} IST`;
}

/**
 * Twitter-style short stamp: seconds/minutes/hours for the first day, then an
 * IST calendar date. The year is dropped inside the current IST year.
 */
export function formatRelativeTime(iso: string, now = Date.now()): string {
  const created = new Date(iso);
  const seconds = Math.max(0, Math.floor((now - created.valueOf()) / 1000));

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h`;

  const { month, day, year } = istParts(iso);
  const currentYear = istParts(new Date(now).toISOString()).year;

  return year === currentYear ? `${month} ${day}` : `${month} ${day}, ${year}`;
}

/** Full stamp used on the post detail page. */
export function formatFullTimestamp(iso: string): string {
  return formatIstDateTime(iso);
}
