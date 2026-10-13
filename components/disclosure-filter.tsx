import Link from "next/link";
import {
  buildQueryString,
  disclosureParam,
  type Disclosure,
  type SortDirection,
} from "@/lib/sort";

const PAID_BADGE = "border-[#ffd400]/40 bg-[#ffd400]/10 text-[#ffd400]";
const UNPAID_BADGE = "border-[#536471] text-[#71767b]";

export function DisclosureFilter({
  basePath,
  sort,
  direction,
  range,
  disclosure,
  paidCount,
  totalCount,
  windowMinutes,
}: {
  basePath: string;
  sort?: string;
  direction: SortDirection;
  range: { from?: string; to?: string };
  disclosure?: Disclosure;
  paidCount: number;
  totalCount: number;
  windowMinutes?: number;
}) {
  const link = (value: Disclosure | undefined) =>
    `${basePath}${buildQueryString({
      sort,
      dir: direction,
      from: range.from,
      to: range.to,
      paid: disclosureParam(value),
      window: windowMinutes ? String(windowMinutes) : undefined,
    })}`;

  const unpaidCount = totalCount - paidCount;

  const options: {
    label: string;
    badge?: string;
    count: number;
    active: boolean;
    href: string;
    disabled: boolean;
  }[] = [
    {
      label: "All quotes",
      count: totalCount,
      active: !disclosure,
      href: link(undefined),
      disabled: false,
    },
    {
      label: "Paid partnership",
      badge: PAID_BADGE,
      count: paidCount,
      active: disclosure === "paid",
      href: link("paid"),
      // Nothing to show when no disclosed sponsorships fall inside the current filters.
      // Stays clickable while active so the count can read 0 without trapping the user.
      disabled: paidCount === 0 && disclosure !== "paid",
    },
    {
      label: "Non-paid",
      badge: UNPAID_BADGE,
      count: unpaidCount,
      active: disclosure === "unpaid",
      href: link("unpaid"),
      disabled: unpaidCount === 0 && disclosure !== "unpaid",
    },
  ];

  return (
    <section className="rounded-2xl border border-[#2f3336] pb-1.5">
      <h2 className="px-4 py-3 text-xl font-bold text-[#e7e9ea]">Disclosure</h2>

      {options.map((option) => {
        const body = (
          <>
            <span className="flex items-center">
              {option.badge ? (
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${option.badge}`}
                >
                  {option.label}
                </span>
              ) : (
                <span
                  className={`text-[15px] ${
                    option.active ? "font-bold text-[#e7e9ea]" : "text-[#71767b]"
                  }`}
                >
                  {option.label}
                </span>
              )}
              <span
                className={`ml-2 tabular-nums text-[13px] ${
                  option.active ? "font-bold text-[#e7e9ea]" : "text-[#71767b]"
                }`}
              >
                {option.count}
              </span>
            </span>
            <span
              className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border ${
                option.active ? "border-[#ffd400]" : "border-[#536471]"
              }`}
            >
              {option.active ? <span className="h-2.5 w-2.5 rounded-full bg-[#ffd400]" /> : null}
            </span>
          </>
        );

        if (option.disabled) {
          return (
            <div
              key={option.label}
              title="No quotes of this kind match the current filters"
              className="flex cursor-not-allowed items-center justify-between px-4 py-2.5 opacity-40"
            >
              {body}
            </div>
          );
        }

        return (
          <Link
            key={option.label}
            href={option.href}
            aria-current={option.active ? "page" : undefined}
            className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-[#080808]"
          >
            {body}
          </Link>
        );
      })}
    </section>
  );
}
