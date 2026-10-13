"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildQueryString, WINDOW_PRESETS, type SortDirection } from "@/lib/sort";

function label(minutes: number | undefined): string {
  if (!minutes) return "All time";
  return `First ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}

export function TimeWindowFilter({
  basePath,
  sort,
  direction,
  range,
  paid,
  windowMinutes,
  matchCount,
}: {
  basePath: string;
  sort?: string;
  direction: SortDirection;
  range: { from?: string; to?: string };
  paid?: string;
  windowMinutes?: number;
  matchCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const href = (minutes: number | undefined) =>
    `${basePath}${buildQueryString({
      sort,
      dir: direction,
      from: range.from,
      to: range.to,
      paid,
      window: minutes ? String(minutes) : undefined,
    })}`;

  const typed = Number(query.trim());
  const customMinutes =
    query.trim() !== "" && Number.isInteger(typed) && typed > 0 && typed <= 100000
      ? typed
      : undefined;

  // Typing narrows the presets; a number that is not a preset becomes its own option.
  const options = useMemo(() => {
    const presets = WINDOW_PRESETS.filter(
      (minutes) => query.trim() === "" || String(minutes).startsWith(query.trim()),
    );
    const extra =
      customMinutes && !WINDOW_PRESETS.includes(customMinutes as (typeof WINDOW_PRESETS)[number])
        ? [customMinutes]
        : [];

    return [...presets, ...extra];
  }, [customMinutes, query]);

  const select = (minutes: number | undefined) => {
    setOpen(false);
    setQuery("");
    router.push(href(minutes));
  };

  return (
    <section className="rounded-2xl border border-[#2f3336] pb-4">
      <h2 className="px-4 py-3 text-xl font-bold text-[#e7e9ea]">Time since post</h2>

      <div className="px-4">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => {
            setOpen((value) => !value);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          className="flex w-full items-center justify-between rounded-lg border border-[#2f3336] bg-black px-3 py-2 text-left text-[15px] text-[#e7e9ea] transition-colors hover:border-[#536471]"
        >
          <span>{label(windowMinutes)}</span>
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#71767b]" fill="currentColor" aria-hidden="true">
            <path d="M12 15.5L5.5 9l1.4-1.4L12 12.7l5.1-5.1L18.5 9z" />
          </svg>
        </button>

        {open ? (
          <div className="mt-2 rounded-lg border border-[#2f3336] bg-black">
            <input
              ref={inputRef}
              type="search"
              inputMode="numeric"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (customMinutes) select(customMinutes);
                }
                if (event.key === "Escape") setOpen(false);
              }}
              placeholder="Search or type minutes"
              className="w-full rounded-t-lg border-b border-[#2f3336] bg-black px-3 py-2 text-[15px] text-[#e7e9ea] outline-none placeholder:text-[#71767b] focus:border-[#1d9bf0]"
            />

            <ul className="max-h-56 overflow-y-auto py-1">
              <li>
                <button
                  type="button"
                  onClick={() => select(undefined)}
                  className={`w-full px-3 py-2 text-left text-[15px] transition-colors hover:bg-[#181919] ${
                    windowMinutes ? "text-[#71767b]" : "font-bold text-[#e7e9ea]"
                  }`}
                >
                  All time
                </button>
              </li>

              {options.map((minutes) => (
                <li key={minutes}>
                  <button
                    type="button"
                    onClick={() => select(minutes)}
                    className={`w-full px-3 py-2 text-left text-[15px] transition-colors hover:bg-[#181919] ${
                      windowMinutes === minutes ? "font-bold text-[#e7e9ea]" : "text-[#71767b]"
                    }`}
                  >
                    {label(minutes)}
                  </button>
                </li>
              ))}

              {options.length === 0 ? (
                <li className="px-3 py-2 text-[13px] text-[#71767b]">
                  Type a whole number of minutes.
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}

        <p className="mt-3 text-[13px] text-[#71767b]">
          <span className="font-bold tabular-nums text-[#e7e9ea]">{matchCount}</span>{" "}
          {matchCount === 1 ? "quote" : "quotes"} match this filter
        </p>
      </div>
    </section>
  );
}
