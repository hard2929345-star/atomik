import Link from "next/link";
import { buildQueryString, type SortDirection } from "@/lib/sort";

export function DateRangeFilter({
  basePath,
  label,
  sort,
  direction,
  range,
  paidOnly = false,
}: {
  basePath: string;
  label: string;
  sort?: string;
  direction: SortDirection;
  range: { from?: string; to?: string };
  paidOnly?: boolean;
}) {
  const isFiltered = Boolean(range.from || range.to);

  return (
    <section className="rounded-2xl border border-[#2f3336] pb-4">
      <h2 className="px-4 py-3 text-xl font-bold text-[#e7e9ea]">Filter</h2>

      <form method="get" action={basePath} className="flex flex-col gap-3 px-4">
        {sort ? <input type="hidden" name="sort" value={sort} /> : null}
        <input type="hidden" name="dir" value={direction} />
        {paidOnly ? <input type="hidden" name="paid" value="1" /> : null}

        <p className="text-[13px] text-[#71767b]">{label}</p>

        <label className="flex flex-col gap-1">
          <span className="text-[13px] text-[#71767b]">From</span>
          <input
            type="date"
            name="from"
            defaultValue={range.from ?? ""}
            className="rounded-lg border border-[#2f3336] bg-black px-3 py-2 text-[15px] text-[#e7e9ea] outline-none focus:border-[#1d9bf0] [color-scheme:dark]"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[13px] text-[#71767b]">To</span>
          <input
            type="date"
            name="to"
            defaultValue={range.to ?? ""}
            className="rounded-lg border border-[#2f3336] bg-black px-3 py-2 text-[15px] text-[#e7e9ea] outline-none focus:border-[#1d9bf0] [color-scheme:dark]"
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="flex-1 rounded-full bg-[#eff3f4] py-2 text-[15px] font-bold text-black transition-colors hover:bg-[#d7dbdc]"
          >
            Apply
          </button>
          {isFiltered ? (
            <Link
              href={`${basePath}${buildQueryString({
                sort,
                dir: direction,
                paid: paidOnly ? "1" : undefined,
              })}`}
              className="rounded-full border border-[#536471] px-4 py-2 text-[15px] font-bold text-[#e7e9ea] transition-colors hover:bg-[#181919]"
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>
    </section>
  );
}
