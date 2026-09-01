import Link from "next/link";
import { buildQueryString, type SortDirection } from "@/lib/sort";

export function DisclosureFilter({
  basePath,
  sort,
  direction,
  range,
  paidOnly,
  paidCount,
  totalCount,
}: {
  basePath: string;
  sort?: string;
  direction: SortDirection;
  range: { from?: string; to?: string };
  paidOnly: boolean;
  paidCount: number;
  totalCount: number;
}) {
  const link = (paid: boolean) =>
    `${basePath}${buildQueryString({
      sort,
      dir: direction,
      from: range.from,
      to: range.to,
      paid: paid ? "1" : undefined,
    })}`;

  const options = [
    {
      label: "All quotes",
      count: totalCount,
      active: !paidOnly,
      href: link(false),
      disabled: false,
    },
    {
      label: "Paid partnerships",
      count: paidCount,
      active: paidOnly,
      href: link(true),
      // Nothing to show for a post with no disclosed sponsorships.
      disabled: paidCount === 0,
    },
  ];

  return (
    <section className="rounded-2xl border border-[#2f3336] pb-1.5">
      <h2 className="px-4 py-3 text-xl font-bold text-[#e7e9ea]">Disclosure</h2>

      {options.map((option) => {
        const body = (
          <>
            <span
              className={`text-[15px] ${
                option.active ? "font-bold text-[#e7e9ea]" : "text-[#71767b]"
              }`}
            >
              {option.label}
              <span className="ml-2 tabular-nums text-[13px] text-[#71767b]">{option.count}</span>
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
              title="This post has no quotes labelled as a paid partnership"
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
